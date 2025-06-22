"""
Services de Facturación - FELICITAFAC
Validaciones SUNAT y lógica de negocio
"""

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import re
import logging
from .models import DocumentoElectronico, DetalleDocumento, SerieDocumento

logger = logging.getLogger(__name__)


class ServicioFacturacion:
    """Servicio para validaciones y lógica de facturación SUNAT"""
    
    @staticmethod
    def validar_documento_antes_emision(documento):
        """Validar documento antes de emisión"""
        errores = []
        
        try:
            # Validar cliente
            if not documento.cliente or not documento.cliente.activo:
                errores.append("Cliente no válido o inactivo")
            
            if documento.cliente and documento.cliente.bloqueado:
                errores.append(f"Cliente bloqueado: {documento.cliente.motivo_bloqueo}")
            
            # Validar tipo de documento vs cliente
            if documento.tipo_documento.requiere_cliente_ruc:
                if not documento.cliente or documento.cliente.tipo_documento.codigo != '6':
                    errores.append("Este tipo de documento requiere cliente con RUC")
            
            # Validar serie y numeración
            if not documento.serie_documento:
                errores.append("Serie de documento requerida")
            elif not documento.serie_documento.activo:
                errores.append("Serie de documento inactiva")
            
            # Validar detalles
            detalles = documento.detalles.filter(activo=True)
            if not detalles.exists():
                errores.append("Documento debe tener al menos un detalle")
            
            # Validar stock de productos
            for detalle in detalles:
                if detalle.producto.controla_stock:
                    disponible, mensaje = detalle.producto.esta_disponible(detalle.cantidad)
                    if not disponible:
                        errores.append(f"Producto {detalle.producto.codigo}: {mensaje}")
            
            # Validar importes
            if documento.total <= 0:
                errores.append("Total del documento debe ser mayor a cero")
            
            # Validar fecha de emisión
            if documento.fecha_emision.date() > timezone.now().date():
                errores.append("Fecha de emisión no puede ser futura")
            
            # Validar documento de referencia para notas
            if documento.tipo_documento.requiere_referencia and not documento.documento_referencia:
                errores.append("Documento de referencia requerido para este tipo")
            
            return {'valido': len(errores) == 0, 'errores': errores}
            
        except Exception as e:
            logger.error(f"Error validando documento: {str(e)}")
            return {'valido': False, 'errores': [f"Error en validación: {str(e)}"]}
    
    @staticmethod
    def calcular_totales_documento(documento):
        """Calcular totales del documento basado en detalles"""
        try:
            detalles = documento.detalles.filter(activo=True)
            
            subtotal = sum(d.subtotal for d in detalles)
            total_descuentos = sum(d.descuento for d in detalles)
            base_imponible = sum(d.base_imponible for d in detalles)
            igv = sum(d.igv for d in detalles)
            
            # Separar por tipo de afectación
            total_exonerado = sum(
                d.subtotal for d in detalles 
                if d.tipo_afectacion_igv.startswith('2')
            )
            
            total_inafecto = sum(
                d.subtotal for d in detalles 
                if d.tipo_afectacion_igv.startswith('3')
            )
            
            total_gratuito = sum(
                d.subtotal for d in detalles 
                if d.es_gratuito
            )
            
            total = base_imponible + igv + total_exonerado + total_inafecto
            
            # Actualizar documento
            documento.subtotal = subtotal
            documento.total_descuentos = total_descuentos
            documento.base_imponible = base_imponible
            documento.igv = igv
            documento.total_exonerado = total_exonerado
            documento.total_inafecto = total_inafecto
            documento.total_gratuito = total_gratuito
            documento.total = total
            
            documento.save(update_fields=[
                'subtotal', 'total_descuentos', 'base_imponible', 'igv',
                'total_exonerado', 'total_inafecto', 'total_gratuito', 'total'
            ])
            
            return {
                'exitoso': True,
                'totales': {
                    'subtotal': float(subtotal),
                    'base_imponible': float(base_imponible),
                    'igv': float(igv),
                    'total': float(total)
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculando totales: {str(e)}")
            return {'exitoso': False, 'error': str(e)}
    
    @staticmethod
    def validar_ruc_cliente(ruc):
        """Validar RUC según algoritmo SUNAT"""
        try:
            if len(ruc) != 11 or not ruc.isdigit():
                return False, "RUC debe tener 11 dígitos"
            
            # Validar tipos válidos de RUC
            tipo_ruc = ruc[:2]
            tipos_validos = ['10', '15', '17', '20']
            if tipo_ruc not in tipos_validos:
                return False, f"Tipo de RUC no válido: {tipo_ruc}"
            
            # Algoritmo de validación
            factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
            suma = sum(int(ruc[i]) * factores[i] for i in range(10))
            resto = suma % 11
            digito_verificador = 11 - resto if resto > 1 else resto
            
            if int(ruc[10]) != digito_verificador:
                return False, "RUC inválido según algoritmo"
            
            return True, "RUC válido"
            
        except Exception as e:
            return False, f"Error validando RUC: {str(e)}"
    
    @staticmethod
    def validar_dni_cliente(dni):
        """Validar DNI peruano"""
        try:
            if len(dni) != 8 or not dni.isdigit():
                return False, "DNI debe tener 8 dígitos"
            
            # DNIs inválidos conocidos
            dnis_invalidos = [
                '00000000', '11111111', '22222222', '33333333',
                '44444444', '55555555', '66666666', '77777777',
                '88888888', '99999999', '12345678', '87654321'
            ]
            
            if dni in dnis_invalidos:
                return False, "DNI inválido"
            
            return True, "DNI válido"
            
        except Exception as e:
            return False, f"Error validando DNI: {str(e)}"
    
    @staticmethod
    def generar_siguiente_numero(serie_documento):
        """Generar siguiente número para una serie"""
        try:
            with transaction.atomic():
                # Bloquear serie para evitar concurrencia
                serie = SerieDocumento.objects.select_for_update().get(id=serie_documento.id)
                
                siguiente = serie.numero_actual + 1
                if siguiente > serie.numero_maximo:
                    raise ValidationError(f"Se alcanzó el número máximo para la serie {serie.serie}")
                
                serie.numero_actual = siguiente
                serie.save(update_fields=['numero_actual'])
                
                return siguiente
                
        except Exception as e:
            logger.error(f"Error generando número: {str(e)}")
            raise ValidationError(f"Error generando numeración: {str(e)}")
    
    @staticmethod
    def formatear_numero_completo(serie, numero):
        """Formatear número completo del documento"""
        return f"{serie}-{numero:08d}"
    
    @staticmethod
    def validar_formato_serie(serie):
        """Validar formato de serie SUNAT"""
        patron = r'^[A-Z0-9]{4}$'
        if not re.match(patron, serie):
            return False, "Serie debe tener 4 caracteres alfanuméricos"
        
        return True, "Serie válida"
    
    @staticmethod
    def calcular_igv(base_imponible, tasa_igv=18):
        """Calcular IGV según base imponible"""
        try:
            base = Decimal(str(base_imponible))
            tasa = Decimal(str(tasa_igv)) / 100
            return base * tasa
        except:
            return Decimal('0.00')
    
    @staticmethod
    def separar_precio_con_igv(precio_con_igv, tasa_igv=18):
        """Separar precio con IGV en base + IGV"""
        try:
            precio_total = Decimal(str(precio_con_igv))
            tasa = Decimal(str(tasa_igv)) / 100
            
            base_imponible = precio_total / (1 + tasa)
            igv = precio_total - base_imponible
            
            return {
                'base_imponible': base_imponible,
                'igv': igv,
                'total': precio_total
            }
        except:
            return {
                'base_imponible': Decimal('0.00'),
                'igv': Decimal('0.00'),
                'total': Decimal('0.00')
            }
    
    @staticmethod
    def validar_detalle_documento(detalle_data, producto):
        """Validar detalle de documento"""
        errores = []
        
        try:
            cantidad = Decimal(str(detalle_data.get('cantidad', 0)))
            precio_unitario = Decimal(str(detalle_data.get('precio_unitario', 0)))
            descuento_porcentaje = Decimal(str(detalle_data.get('descuento_porcentaje', 0)))
            
            # Validar cantidad
            if cantidad <= 0:
                errores.append("Cantidad debe ser mayor a cero")
            
            # Validar precio
            if precio_unitario < 0:
                errores.append("Precio unitario no puede ser negativo")
            
            # Validar descuento
            if descuento_porcentaje < 0 or descuento_porcentaje > 100:
                errores.append("Descuento debe estar entre 0% y 100%")
            
            # Validar producto
            if not producto.permite_venta:
                errores.append("Producto no permite venta")
            
            if not producto.activo:
                errores.append("Producto inactivo")
            
            # Validar descuento vs producto
            if descuento_porcentaje > 0:
                if not producto.permite_descuento:
                    errores.append("Producto no permite descuentos")
                elif descuento_porcentaje > producto.descuento_maximo:
                    errores.append(f"Descuento máximo permitido: {producto.descuento_maximo}%")
            
            # Validar stock
            if producto.controla_stock:
                disponible, mensaje = producto.esta_disponible(cantidad)
                if not disponible:
                    errores.append(f"Stock: {mensaje}")
            
            return {'valido': len(errores) == 0, 'errores': errores}
            
        except Exception as e:
            logger.error(f"Error validando detalle: {str(e)}")
            return {'valido': False, 'errores': [f"Error en validación: {str(e)}"]}
    
    @staticmethod
    def procesar_anulacion_documento(documento, motivo, usuario):
        """Procesar anulación de documento"""
        try:
            with transaction.atomic():
                # Validar que se puede anular
                puede, mensaje = documento.puede_anular()
                if not puede:
                    raise ValidationError(mensaje)
                
                # Anular documento
                documento.estado = 'anulado'
                documento.motivo_anulacion = motivo
                documento.save(update_fields=['estado', 'motivo_anulacion'])
                
                # Reversar inventario si aplica
                if documento.tipo_documento.afecta_inventario:
                    for detalle in documento.detalles.filter(activo=True):
                        if detalle.producto.controla_stock:
                            from aplicaciones.inventario.services import ServicioInventario
                            ServicioInventario.procesar_entrada(
                                producto=detalle.producto,
                                almacen=documento.serie_documento.sucursal.almacenes.first(),
                                cantidad=detalle.cantidad,
                                costo_unitario=detalle.producto.precio_compra,
                                numero_lote=f"DEV-{documento.numero_completo}",
                                usuario=usuario,
                                documento_origen=f"Devolución por anulación {documento.numero_completo}"
                            )
                
                # Generar asiento contable de reversión
                try:
                    from aplicaciones.contabilidad.services import ServicioContabilidad
                    # Implementar reversión contable si es necesario
                except:
                    pass
                
                logger.info(f"Documento anulado: {documento.numero_completo} - Motivo: {motivo}")
                
                return {'exitoso': True, 'mensaje': 'Documento anulado exitosamente'}
                
        except Exception as e:
            logger.error(f"Error anulando documento: {str(e)}")
            return {'exitoso': False, 'error': str(e)}
    
    @staticmethod
    def generar_codigo_qr_sunat(documento):
        """Generar código QR según formato SUNAT"""
        try:
            from aplicaciones.core.models import Empresa
            
            empresa = Empresa.objects.filter(activo=True).first()
            if not empresa:
                return ""
            
            # Formato: RUC|TIPO_DOC|SERIE|NUMERO|IGV|TOTAL|FECHA|TIPO_DOC_CLIENTE|NUM_DOC_CLIENTE|
            qr_data = (
                f"{empresa.ruc}|"
                f"{documento.tipo_documento.codigo_sunat}|"
                f"{documento.serie_documento.serie}|"
                f"{documento.numero}|"
                f"{documento.igv}|"
                f"{documento.total}|"
                f"{documento.fecha_emision.strftime('%Y-%m-%d')}|"
                f"{documento.cliente_tipo_documento}|"
                f"{documento.cliente_numero_documento}|"
            )
            
            return qr_data
            
        except Exception as e:
            logger.error(f"Error generando QR: {str(e)}")
            return ""
    
    @staticmethod
    def obtener_estadisticas_facturacion(fecha_desde=None, fecha_hasta=None):
        """Obtener estadísticas de facturación"""
        try:
            from django.db.models import Sum, Count, Avg
            
            if not fecha_desde:
                fecha_desde = timezone.now().replace(day=1).date()
            if not fecha_hasta:
                fecha_hasta = timezone.now().date()
            
            queryset = DocumentoElectronico.objects.filter(
                fecha_emision__date__gte=fecha_desde,
                fecha_emision__date__lte=fecha_hasta,
                activo=True
            )
            
            estadisticas = {
                'periodo': {'desde': fecha_desde, 'hasta': fecha_hasta},
                'total_documentos': queryset.count(),
                'total_facturado': queryset.aggregate(Sum('total'))['total__sum'] or 0,
                'total_igv': queryset.aggregate(Sum('igv'))['igv__sum'] or 0,
                'ticket_promedio': queryset.aggregate(Avg('total'))['total__avg'] or 0,
                'por_estado': {},
                'por_tipo': {},
                'por_moneda': {}
            }
            
            # Por estado
            por_estado = queryset.values('estado').annotate(
                cantidad=Count('id'),
                monto=Sum('total')
            )
            for item in por_estado:
                estadisticas['por_estado'][item['estado']] = {
                    'cantidad': item['cantidad'],
                    'monto': float(item['monto'] or 0)
                }
            
            # Por tipo de documento
            por_tipo = queryset.values('tipo_documento__nombre').annotate(
                cantidad=Count('id'),
                monto=Sum('total')
            )
            for item in por_tipo:
                estadisticas['por_tipo'][item['tipo_documento__nombre']] = {
                    'cantidad': item['cantidad'],
                    'monto': float(item['monto'] or 0)
                }
            
            # Por moneda
            por_moneda = queryset.values('moneda').annotate(
                cantidad=Count('id'),
                monto=Sum('total')
            )
            for item in por_moneda:
                estadisticas['por_moneda'][item['moneda']] = {
                    'cantidad': item['cantidad'],
                    'monto': float(item['monto'] or 0)
                }
            
            return estadisticas
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {str(e)}")
            return {'error': str(e)}