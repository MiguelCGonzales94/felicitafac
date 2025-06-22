"""
Services de Contabilidad - FELICITAFAC
Lógica automática PCGE y asientos contables
"""

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import logging
from .models import (
    PlanCuentas, AsientoContable, DetalleAsiento, 
    EjercicioContable, ConfiguracionContable
)

logger = logging.getLogger(__name__)


class ServicioContabilidad:
    """Servicio para generación automática de asientos contables"""
    
    @staticmethod
    def generar_asiento_venta(documento_electronico, usuario):
        """Generar asiento contable por venta"""
        
        with transaction.atomic():
            try:
                configuracion = ConfiguracionContable.objects.first()
                if not configuracion or not configuracion.generar_asientos_venta:
                    return None
                
                ejercicio = EjercicioContable.objects.filter(es_actual=True).first()
                if not ejercicio:
                    raise ValidationError("No hay ejercicio contable activo")
                
                # Crear asiento principal
                asiento = AsientoContable.objects.create(
                    ejercicio=ejercicio,
                    fecha=documento_electronico.fecha_emision.date(),
                    tipo_asiento='automatico',
                    glosa=f"Venta {documento_electronico.numero_completo} - {documento_electronico.cliente_razon_social}",
                    documento_electronico=documento_electronico,
                    moneda=documento_electronico.moneda,
                    tipo_cambio=documento_electronico.tipo_cambio,
                    usuario_creacion=usuario,
                    es_automatico=True,
                    proceso_origen='venta_automatica'
                )
                
                numero_linea = 1
                
                # 1. Cuentas por cobrar o Efectivo (DEBE)
                if documento_electronico.condiciones_pago == 'CONTADO':
                    cuenta_debe = configuracion.cuenta_caja
                else:
                    if documento_electronico.tipo_documento.codigo_sunat == '01':
                        cuenta_debe = configuracion.cuenta_cuentas_cobrar_facturas
                    else:
                        cuenta_debe = configuracion.cuenta_cuentas_cobrar_boletas
                
                DetalleAsiento.objects.create(
                    asiento=asiento,
                    numero_linea=numero_linea,
                    cuenta=cuenta_debe,
                    glosa=f"Por venta {documento_electronico.numero_completo}",
                    debe=documento_electronico.total,
                    haber=Decimal('0.00'),
                    cliente_proveedor=documento_electronico.cliente,
                    tipo_documento_tercero=documento_electronico.cliente_tipo_documento,
                    numero_documento_tercero=documento_electronico.cliente_numero_documento,
                    fecha_vencimiento=documento_electronico.fecha_vencimiento
                )
                numero_linea += 1
                
                # 2. Ventas gravadas (HABER)
                if documento_electronico.base_imponible > 0:
                    DetalleAsiento.objects.create(
                        asiento=asiento,
                        numero_linea=numero_linea,
                        cuenta=configuracion.cuenta_ventas_gravadas,
                        glosa="Ventas gravadas",
                        debe=Decimal('0.00'),
                        haber=documento_electronico.base_imponible
                    )
                    numero_linea += 1
                
                # 3. Ventas exoneradas (HABER)
                if documento_electronico.total_exonerado > 0:
                    DetalleAsiento.objects.create(
                        asiento=asiento,
                        numero_linea=numero_linea,
                        cuenta=configuracion.cuenta_ventas_exoneradas,
                        glosa="Ventas exoneradas",
                        debe=Decimal('0.00'),
                        haber=documento_electronico.total_exonerado
                    )
                    numero_linea += 1
                
                # 4. Ventas inafectas (HABER)
                if documento_electronico.total_inafecto > 0:
                    DetalleAsiento.objects.create(
                        asiento=asiento,
                        numero_linea=numero_linea,
                        cuenta=configuracion.cuenta_ventas_inafectas,
                        glosa="Ventas inafectas",
                        debe=Decimal('0.00'),
                        haber=documento_electronico.total_inafecto
                    )
                    numero_linea += 1
                
                # 5. IGV por pagar (HABER)
                if documento_electronico.igv > 0:
                    DetalleAsiento.objects.create(
                        asiento=asiento,
                        numero_linea=numero_linea,
                        cuenta=configuracion.cuenta_igv_ventas,
                        glosa="IGV por pagar",
                        debe=Decimal('0.00'),
                        haber=documento_electronico.igv
                    )
                    numero_linea += 1
                
                # Aprobar asiento automáticamente
                asiento.estado = 'definitivo'
                asiento.usuario_aprobacion = usuario
                asiento.fecha_aprobacion = timezone.now()
                asiento.save()
                
                # Actualizar saldos
                asiento._actualizar_saldos_cuentas()
                
                logger.info(f"Asiento de venta generado: {asiento.numero}")
                return asiento
                
            except Exception as e:
                logger.error(f"Error generando asiento de venta: {str(e)}")
                raise ValidationError(f"Error generando asiento: {str(e)}")
    
    @staticmethod
    def generar_asiento_costo_venta(documento_electronico, usuario):
        """Generar asiento por costo de ventas"""
        
        with transaction.atomic():
            try:
                configuracion = ConfiguracionContable.objects.first()
                if not configuracion or not configuracion.generar_asientos_inventario:
                    return None
                
                ejercicio = EjercicioContable.objects.filter(es_actual=True).first()
                if not ejercicio:
                    return None
                
                # Calcular costo total de la venta
                costo_total = Decimal('0.00')
                detalles_costo = []
                
                for detalle in documento_electronico.detalles.filter(activo=True):
                    if detalle.producto.controla_stock:
                        # Obtener costo promedio del producto
                        from aplicaciones.inventario.services import ServicioInventario
                        costo_unitario = ServicioInventario.calcular_costo_promedio_producto(
                            detalle.producto, 
                            documento_electronico.serie_documento.sucursal.almacenes.first()
                        )
                        costo_detalle = detalle.cantidad * costo_unitario
                        costo_total += costo_detalle
                        
                        detalles_costo.append({
                            'producto': detalle.producto,
                            'cantidad': detalle.cantidad,
                            'costo_unitario': costo_unitario,
                            'costo_total': costo_detalle
                        })
                
                if costo_total == 0:
                    return None
                
                # Crear asiento de costo
                asiento = AsientoContable.objects.create(
                    ejercicio=ejercicio,
                    fecha=documento_electronico.fecha_emision.date(),
                    tipo_asiento='automatico',
                    glosa=f"Costo venta {documento_electronico.numero_completo}",
                    documento_electronico=documento_electronico,
                    usuario_creacion=usuario,
                    es_automatico=True,
                    proceso_origen='costo_venta_automatico'
                )
                
                # 1. Costo de ventas (DEBE)
                DetalleAsiento.objects.create(
                    asiento=asiento,
                    numero_linea=1,
                    cuenta=configuracion.cuenta_costo_ventas,
                    glosa="Costo de productos vendidos",
                    debe=costo_total,
                    haber=Decimal('0.00')
                )
                
                # 2. Inventario de mercaderías (HABER)
                DetalleAsiento.objects.create(
                    asiento=asiento,
                    numero_linea=2,
                    cuenta=configuracion.cuenta_inventario_mercaderias,
                    glosa="Salida de inventario por venta",
                    debe=Decimal('0.00'),
                    haber=costo_total
                )
                
                # Aprobar asiento
                asiento.estado = 'definitivo'
                asiento.usuario_aprobacion = usuario
                asiento.fecha_aprobacion = timezone.now()
                asiento.save()
                
                asiento._actualizar_saldos_cuentas()
                
                logger.info(f"Asiento de costo generado: {asiento.numero}")
                return asiento
                
            except Exception as e:
                logger.error(f"Error generando asiento de costo: {str(e)}")
                return None
    
    @staticmethod
    def generar_asiento_compra(documento_compra, usuario):
        """Generar asiento por compra (futuro)"""
        # Implementar cuando se agregue módulo de compras
        pass
    
    @staticmethod
    def generar_asiento_pago(documento_electronico, pago, usuario):
        """Generar asiento por pago recibido"""
        
        with transaction.atomic():
            try:
                configuracion = ConfiguracionContable.objects.first()
                if not configuracion:
                    return None
                
                ejercicio = EjercicioContable.objects.filter(es_actual=True).first()
                if not ejercicio:
                    return None
                
                asiento = AsientoContable.objects.create(
                    ejercicio=ejercicio,
                    fecha=pago.fecha_pago.date(),
                    tipo_asiento='automatico',
                    glosa=f"Pago {documento_electronico.numero_completo} - {pago.forma_pago.nombre}",
                    usuario_creacion=usuario,
                    es_automatico=True,
                    proceso_origen='pago_automatico'
                )
                
                # 1. Efectivo/Banco (DEBE)
                if pago.forma_pago.tipo in ['efectivo', 'yape', 'plin']:
                    cuenta_debe = configuracion.cuenta_caja
                else:
                    cuenta_debe = configuracion.cuenta_banco_principal or configuracion.cuenta_caja
                
                DetalleAsiento.objects.create(
                    asiento=asiento,
                    numero_linea=1,
                    cuenta=cuenta_debe,
                    glosa=f"Pago recibido - {pago.forma_pago.nombre}",
                    debe=pago.monto,
                    haber=Decimal('0.00'),
                    documento_referencia=pago.referencia
                )
                
                # 2. Cuentas por cobrar (HABER)
                if documento_electronico.tipo_documento.codigo_sunat == '01':
                    cuenta_haber = configuracion.cuenta_cuentas_cobrar_facturas
                else:
                    cuenta_haber = configuracion.cuenta_cuentas_cobrar_boletas
                
                DetalleAsiento.objects.create(
                    asiento=asiento,
                    numero_linea=2,
                    cuenta=cuenta_haber,
                    glosa=f"Cancelación {documento_electronico.numero_completo}",
                    debe=Decimal('0.00'),
                    haber=pago.monto,
                    cliente_proveedor=documento_electronico.cliente,
                    tipo_documento_tercero=documento_electronico.cliente_tipo_documento,
                    numero_documento_tercero=documento_electronico.cliente_numero_documento
                )
                
                # Aprobar asiento
                asiento.estado = 'definitivo'
                asiento.usuario_aprobacion = usuario
                asiento.fecha_aprobacion = timezone.now()
                asiento.save()
                
                asiento._actualizar_saldos_cuentas()
                
                logger.info(f"Asiento de pago generado: {asiento.numero}")
                return asiento
                
            except Exception as e:
                logger.error(f"Error generando asiento de pago: {str(e)}")
                return None
    
    @staticmethod
    def crear_plan_cuentas_inicial():
        """Crear plan de cuentas inicial básico según PCGE"""
        
        with transaction.atomic():
            try:
                # Verificar si ya existe plan de cuentas
                if PlanCuentas.objects.exists():
                    return
                
                cuentas_pcge = [
                    # ELEMENTO 1 - ACTIVO CORRIENTE
                    {'codigo': '10', 'nombre': 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', 'nivel': 2, 'padre': None},
                    {'codigo': '101', 'nombre': 'Caja', 'nivel': 3, 'padre': '10'},
                    {'codigo': '1011', 'nombre': 'Caja', 'nivel': 4, 'padre': '101'},
                    {'codigo': '104', 'nombre': 'Cuentas corrientes en instituciones financieras', 'nivel': 3, 'padre': '10'},
                    {'codigo': '1041', 'nombre': 'Cuentas corrientes operativas', 'nivel': 4, 'padre': '104'},
                    
                    {'codigo': '12', 'nombre': 'CUENTAS POR COBRAR COMERCIALES - TERCEROS', 'nivel': 2, 'padre': None},
                    {'codigo': '121', 'nombre': 'Facturas, boletas y otros comprobantes por cobrar', 'nivel': 3, 'padre': '12'},
                    {'codigo': '1211', 'nombre': 'No emitidas', 'nivel': 4, 'padre': '121'},
                    {'codigo': '1212', 'nombre': 'Emitidas en cartera', 'nivel': 4, 'padre': '121'},
                    
                    {'codigo': '20', 'nombre': 'MERCADERÍAS', 'nivel': 2, 'padre': None},
                    {'codigo': '201', 'nombre': 'Mercaderías manufacturadas', 'nivel': 3, 'padre': '20'},
                    {'codigo': '2011', 'nombre': 'Mercaderías manufacturadas', 'nivel': 4, 'padre': '201'},
                    
                    # ELEMENTO 4 - PASIVO
                    {'codigo': '40', 'nombre': 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR', 'nivel': 2, 'padre': None},
                    {'codigo': '401', 'nombre': 'Gobierno central', 'nivel': 3, 'padre': '40'},
                    {'codigo': '4011', 'nombre': 'Impuesto general a las ventas', 'nivel': 4, 'padre': '401'},
                    
                    {'codigo': '42', 'nombre': 'CUENTAS POR PAGAR COMERCIALES - TERCEROS', 'nivel': 2, 'padre': None},
                    {'codigo': '421', 'nombre': 'Facturas, boletas y otros comprobantes por pagar', 'nivel': 3, 'padre': '42'},
                    {'codigo': '4212', 'nombre': 'Emitidas', 'nivel': 4, 'padre': '421'},
                    
                    # ELEMENTO 5 - PATRIMONIO
                    {'codigo': '50', 'nombre': 'CAPITAL', 'nivel': 2, 'padre': None},
                    {'codigo': '501', 'nombre': 'Capital social', 'nivel': 3, 'padre': '50'},
                    {'codigo': '5011', 'nombre': 'Acciones', 'nivel': 4, 'padre': '501'},
                    
                    # ELEMENTO 6 - GASTOS
                    {'codigo': '60', 'nombre': 'COMPRAS', 'nivel': 2, 'padre': None},
                    {'codigo': '601', 'nombre': 'Mercaderías', 'nivel': 3, 'padre': '60'},
                    {'codigo': '6011', 'nombre': 'Mercaderías manufacturadas', 'nivel': 4, 'padre': '601'},
                    
                    {'codigo': '69', 'nombre': 'COSTO DE VENTAS', 'nivel': 2, 'padre': None},
                    {'codigo': '691', 'nombre': 'Mercaderías', 'nivel': 3, 'padre': '69'},
                    {'codigo': '6911', 'nombre': 'Mercaderías manufacturadas', 'nivel': 4, 'padre': '691'},
                    
                    # ELEMENTO 7 - INGRESOS
                    {'codigo': '70', 'nombre': 'VENTAS', 'nivel': 2, 'padre': None},
                    {'codigo': '701', 'nombre': 'Mercaderías', 'nivel': 3, 'padre': '70'},
                    {'codigo': '7011', 'nombre': 'Mercaderías manufacturadas', 'nivel': 4, 'padre': '701'},
                ]
                
                # Crear cuentas
                cuentas_creadas = {}
                
                for cuenta_data in cuentas_pcge:
                    cuenta_padre = None
                    if cuenta_data['padre']:
                        cuenta_padre = cuentas_creadas.get(cuenta_data['padre'])
                    
                    cuenta = PlanCuentas.objects.create(
                        codigo=cuenta_data['codigo'],
                        nombre=cuenta_data['nombre'],
                        nivel=cuenta_data['nivel'],
                        cuenta_padre=cuenta_padre,
                        acepta_movimientos=(cuenta_data['nivel'] >= 4)
                    )
                    
                    cuentas_creadas[cuenta_data['codigo']] = cuenta
                
                logger.info("Plan de cuentas inicial creado exitosamente")
                
                # Crear configuración contable inicial
                ServicioContabilidad.crear_configuracion_inicial(cuentas_creadas)
                
            except Exception as e:
                logger.error(f"Error creando plan de cuentas inicial: {str(e)}")
                raise
    
    @staticmethod
    def crear_configuracion_inicial(cuentas):
        """Crear configuración contable inicial"""
        try:
            if ConfiguracionContable.objects.exists():
                return
            
            ConfiguracionContable.objects.create(
                cuenta_ventas_gravadas=cuentas.get('7011'),
                cuenta_igv_ventas=cuentas.get('4011'),
                cuenta_cuentas_cobrar_facturas=cuentas.get('1212'),
                cuenta_cuentas_cobrar_boletas=cuentas.get('1212'),
                cuenta_inventario_mercaderias=cuentas.get('2011'),
                cuenta_costo_ventas=cuentas.get('6911'),
                cuenta_caja=cuentas.get('1011'),
                generar_asientos_venta=True,
                generar_asientos_inventario=True
            )
            
            logger.info("Configuración contable inicial creada")
            
        except Exception as e:
            logger.error(f"Error creando configuración inicial: {str(e)}")