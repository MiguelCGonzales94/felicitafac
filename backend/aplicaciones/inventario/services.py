"""
Services de Inventario - FELICITAFAC
Lógica de negocio PEPS y control de stock
Optimizado para MySQL y hosting compartido
"""

from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import logging
from .models import (
    StockProducto, LoteProducto, MovimientoInventario, 
    DetalleMovimiento, TipoMovimiento, Almacen
)

logger = logging.getLogger(__name__)


class ServicioInventario:
    """
    Servicio principal para manejo de inventarios
    Implementa método PEPS (Primero en Entrar, Primero en Salir)
    """
    
    @staticmethod
    def procesar_entrada(producto, almacen, cantidad, costo_unitario, 
                        numero_lote=None, fecha_vencimiento=None, 
                        proveedor=None, documento_origen=None, usuario=None):
        """Procesar entrada de inventario con método PEPS"""
        
        with transaction.atomic():
            try:
                # Crear o actualizar stock del producto
                stock, creado = StockProducto.objects.get_or_create(
                    producto=producto,
                    almacen=almacen,
                    defaults={
                        'cantidad_actual': Decimal('0.0000'),
                        'costo_promedio': costo_unitario
                    }
                )
                
                # Crear lote si se especifica
                lote = None
                if numero_lote or producto.tipo_producto.requiere_lote:
                    numero_lote = numero_lote or f"LOTE-{timezone.now().strftime('%Y%m%d%H%M%S')}"
                    
                    lote = LoteProducto.objects.create(
                        producto=producto,
                        almacen=almacen,
                        numero_lote=numero_lote,
                        fecha_vencimiento=fecha_vencimiento,
                        cantidad_inicial=cantidad,
                        cantidad_actual=cantidad,
                        costo_unitario=costo_unitario,
                        proveedor=proveedor,
                        documento_origen=documento_origen
                    )
                
                # Actualizar stock con costo promedio ponderado
                cantidad_total = stock.cantidad_actual + cantidad
                if cantidad_total > 0:
                    valor_anterior = stock.cantidad_actual * stock.costo_promedio
                    valor_nuevo = cantidad * costo_unitario
                    stock.costo_promedio = (valor_anterior + valor_nuevo) / cantidad_total
                
                stock.cantidad_actual = cantidad_total
                stock.fecha_ultimo_ingreso = timezone.now()
                stock.fecha_ultimo_movimiento = timezone.now()
                stock.save()
                
                # Actualizar estadísticas del producto
                producto.total_comprado += cantidad
                producto.fecha_ultima_compra = timezone.now()
                producto.save(update_fields=['total_comprado', 'fecha_ultima_compra'])
                
                logger.info(
                    f"Entrada procesada: {producto.codigo} - "
                    f"Cantidad: {cantidad} - Almacén: {almacen.codigo}"
                )
                
                return {
                    'exitoso': True,
                    'stock_actual': stock.cantidad_actual,
                    'costo_promedio': stock.costo_promedio,
                    'lote': lote
                }
                
            except Exception as e:
                logger.error(f"Error procesando entrada: {str(e)}")
                raise ValidationError(f"Error en entrada de inventario: {str(e)}")
    
    @staticmethod
    def procesar_salida(producto, almacen, cantidad, usuario=None, 
                       documento_origen=None, forzar=False):
        """Procesar salida de inventario usando método PEPS"""
        
        with transaction.atomic():
            try:
                # Verificar stock disponible
                stock = StockProducto.objects.filter(
                    producto=producto, almacen=almacen
                ).first()
                
                if not stock:
                    raise ValidationError(f"No hay stock del producto {producto.codigo} en {almacen.codigo}")
                
                if stock.cantidad_actual < cantidad and not forzar:
                    raise ValidationError(
                        f"Stock insuficiente. Disponible: {stock.cantidad_actual}, "
                        f"Requerido: {cantidad}"
                    )
                
                # Procesar salida usando PEPS
                cantidad_pendiente = cantidad
                lotes_consumidos = []
                
                # Obtener lotes ordenados por fecha (PEPS)
                lotes = LoteProducto.objects.filter(
                    producto=producto,
                    almacen=almacen,
                    cantidad_actual__gt=0,
                    activo=True
                ).order_by('fecha_ingreso', 'numero_lote')
                
                for lote in lotes:
                    if cantidad_pendiente <= 0:
                        break
                    
                    # Verificar calidad del lote
                    disponible, mensaje = lote.esta_disponible(cantidad_pendiente)
                    if not disponible and not forzar:
                        continue
                    
                    # Consumir del lote
                    cantidad_a_consumir = min(cantidad_pendiente, lote.cantidad_actual)
                    cantidad_consumida = lote.consumir_cantidad(cantidad_a_consumir)
                    
                    cantidad_pendiente -= cantidad_consumida
                    lotes_consumidos.append({
                        'lote': lote.numero_lote,
                        'cantidad': cantidad_consumida,
                        'costo_unitario': lote.costo_unitario
                    })
                
                # Verificar que se pudo completar la salida
                if cantidad_pendiente > 0 and not forzar:
                    raise ValidationError(
                        f"No se pudo completar la salida. Faltante: {cantidad_pendiente}"
                    )
                
                # Actualizar stock general
                stock.cantidad_actual -= (cantidad - cantidad_pendiente)
                stock.fecha_ultima_salida = timezone.now()
                stock.fecha_ultimo_movimiento = timezone.now()
                stock.save()
                
                # Actualizar estadísticas del producto
                cantidad_real_salida = cantidad - cantidad_pendiente
                producto.total_vendido += cantidad_real_salida
                producto.fecha_ultima_venta = timezone.now()
                producto.save(update_fields=['total_vendido', 'fecha_ultima_venta'])
                
                logger.info(
                    f"Salida procesada: {producto.codigo} - "
                    f"Cantidad: {cantidad_real_salida} - Almacén: {almacen.codigo}"
                )
                
                return {
                    'exitoso': True,
                    'cantidad_procesada': cantidad_real_salida,
                    'cantidad_faltante': cantidad_pendiente,
                    'stock_actual': stock.cantidad_actual,
                    'lotes_consumidos': lotes_consumidos
                }
                
            except Exception as e:
                logger.error(f"Error procesando salida: {str(e)}")
                raise ValidationError(f"Error en salida de inventario: {str(e)}")
    
    @staticmethod
    def ajustar_stock(producto, almacen, cantidad_nueva, motivo, usuario=None):
        """Ajustar stock a una cantidad específica"""
        
        with transaction.atomic():
            try:
                stock, creado = StockProducto.objects.get_or_create(
                    producto=producto,
                    almacen=almacen,
                    defaults={
                        'cantidad_actual': Decimal('0.0000'),
                        'costo_promedio': producto.precio_compra
                    }
                )
                
                cantidad_anterior = stock.cantidad_actual
                diferencia = cantidad_nueva - cantidad_anterior
                
                # Actualizar stock
                stock.cantidad_actual = cantidad_nueva
                stock.fecha_ultimo_movimiento = timezone.now()
                stock.save()
                
                # Crear movimiento de ajuste
                tipo_ajuste = TipoMovimiento.objects.filter(
                    categoria='ajuste_positivo' if diferencia >= 0 else 'ajuste_negativo'
                ).first()
                
                if tipo_ajuste:
                    almacen_obj = almacen if isinstance(almacen, Almacen) else Almacen.objects.get(id=almacen)
                    
                    movimiento = MovimientoInventario.objects.create(
                        tipo_movimiento=tipo_ajuste,
                        almacen=almacen_obj,
                        usuario_creacion=usuario,
                        observaciones=f"Ajuste de stock: {motivo}",
                        motivo=motivo,
                        estado='ejecutado'
                    )
                    
                    DetalleMovimiento.objects.create(
                        movimiento=movimiento,
                        numero_item=1,
                        producto=producto,
                        cantidad=abs(diferencia),
                        costo_unitario=stock.costo_promedio,
                        ejecutado=True,
                        fecha_ejecucion=timezone.now()
                    )
                
                logger.info(
                    f"Ajuste de stock: {producto.codigo} - "
                    f"Anterior: {cantidad_anterior} - Nuevo: {cantidad_nueva}"
                )
                
                return {
                    'exitoso': True,
                    'cantidad_anterior': cantidad_anterior,
                    'cantidad_nueva': cantidad_nueva,
                    'diferencia': diferencia
                }
                
            except Exception as e:
                logger.error(f"Error ajustando stock: {str(e)}")
                raise ValidationError(f"Error en ajuste de stock: {str(e)}")
    
    @staticmethod
    def transferir_stock(producto, almacen_origen, almacen_destino, cantidad, usuario=None):
        """Transferir stock entre almacenes"""
        
        with transaction.atomic():
            try:
                # Procesar salida del almacén origen
                resultado_salida = ServicioInventario.procesar_salida(
                    producto, almacen_origen, cantidad, usuario
                )
                
                if not resultado_salida['exitoso']:
                    raise ValidationError("Error en salida de almacén origen")
                
                # Calcular costo promedio para la transferencia
                costo_promedio = Decimal('0.0000')
                cantidad_total = Decimal('0.0000')
                
                for lote_info in resultado_salida['lotes_consumidos']:
                    cantidad_lote = Decimal(str(lote_info['cantidad']))
                    costo_lote = Decimal(str(lote_info['costo_unitario']))
                    costo_promedio += cantidad_lote * costo_lote
                    cantidad_total += cantidad_lote
                
                if cantidad_total > 0:
                    costo_promedio = costo_promedio / cantidad_total
                else:
                    costo_promedio = producto.precio_compra
                
                # Procesar entrada en almacén destino
                resultado_entrada = ServicioInventario.procesar_entrada(
                    producto, almacen_destino, cantidad, costo_promedio,
                    numero_lote=f"TRANS-{timezone.now().strftime('%Y%m%d%H%M%S')}",
                    usuario=usuario,
                    documento_origen="Transferencia de almacén"
                )
                
                logger.info(
                    f"Transferencia completada: {producto.codigo} - "
                    f"Origen: {almacen_origen.codigo} - Destino: {almacen_destino.codigo} - "
                    f"Cantidad: {cantidad}"
                )
                
                return {
                    'exitoso': True,
                    'cantidad_transferida': cantidad,
                    'costo_promedio': costo_promedio,
                    'salida': resultado_salida,
                    'entrada': resultado_entrada
                }
                
            except Exception as e:
                logger.error(f"Error en transferencia: {str(e)}")
                raise ValidationError(f"Error en transferencia de stock: {str(e)}")
    
    @staticmethod
    def verificar_disponibilidad(producto, almacen, cantidad):
        """Verificar disponibilidad de stock"""
        try:
            stock = StockProducto.objects.filter(
                producto=producto, almacen=almacen
            ).first()
            
            if not stock:
                return {
                    'disponible': False,
                    'mensaje': 'Producto no disponible en el almacén',
                    'stock_actual': 0,
                    'cantidad_disponible': 0
                }
            
            disponible = stock.cantidad_disponible >= cantidad
            
            return {
                'disponible': disponible,
                'mensaje': 'Disponible' if disponible else 'Stock insuficiente',
                'stock_actual': float(stock.cantidad_actual),
                'cantidad_disponible': float(stock.cantidad_disponible),
                'cantidad_requerida': float(cantidad)
            }
            
        except Exception as e:
            logger.error(f"Error verificando disponibilidad: {str(e)}")
            return {
                'disponible': False,
                'mensaje': f'Error verificando disponibilidad: {str(e)}',
                'stock_actual': 0,
                'cantidad_disponible': 0
            }
    
    @staticmethod
    def obtener_lotes_vencidos(almacen=None, dias_anticipacion=0):
        """Obtener lotes vencidos o próximos a vencer"""
        try:
            fecha_limite = timezone.now().date()
            if dias_anticipacion > 0:
                from datetime import timedelta
                fecha_limite += timedelta(days=dias_anticipacion)
            
            queryset = LoteProducto.objects.filter(
                fecha_vencimiento__lte=fecha_limite,
                cantidad_actual__gt=0,
                activo=True
            ).select_related('producto', 'almacen')
            
            if almacen:
                queryset = queryset.filter(almacen=almacen)
            
            return queryset.order_by('fecha_vencimiento')
            
        except Exception as e:
            logger.error(f"Error obteniendo lotes vencidos: {str(e)}")
            return LoteProducto.objects.none()
    
    @staticmethod
    def generar_reporte_valorizado(almacen=None, fecha=None):
        """Generar reporte valorizado de inventario"""
        try:
            if not fecha:
                fecha = timezone.now().date()
            
            queryset = StockProducto.objects.filter(
                cantidad_actual__gt=0, activo=True
            ).select_related('producto', 'almacen')
            
            if almacen:
                queryset = queryset.filter(almacen=almacen)
            
            reporte = {
                'fecha_reporte': fecha,
                'total_productos': 0,
                'valor_total': Decimal('0.00'),
                'items': []
            }
            
            for stock in queryset:
                valor_item = stock.cantidad_actual * stock.costo_promedio
                
                item = {
                    'producto_codigo': stock.producto.codigo,
                    'producto_nombre': stock.producto.nombre,
                    'almacen': stock.almacen.nombre,
                    'cantidad': float(stock.cantidad_actual),
                    'costo_promedio': float(stock.costo_promedio),
                    'valor_total': float(valor_item),
                    'fecha_ultimo_movimiento': stock.fecha_ultimo_movimiento
                }
                
                reporte['items'].append(item)
                reporte['valor_total'] += valor_item
                reporte['total_productos'] += 1
            
            reporte['valor_total'] = float(reporte['valor_total'])
            
            return reporte
            
        except Exception as e:
            logger.error(f"Error generando reporte valorizado: {str(e)}")
            return {'error': str(e)}
    
    @staticmethod
    def calcular_costo_promedio_producto(producto, almacen):
        """Calcular costo promedio actual de un producto"""
        try:
            lotes = LoteProducto.objects.filter(
                producto=producto,
                almacen=almacen,
                cantidad_actual__gt=0,
                activo=True
            )
            
            if not lotes.exists():
                return producto.precio_compra
            
            total_cantidad = sum(lote.cantidad_actual for lote in lotes)
            total_valor = sum(lote.cantidad_actual * lote.costo_unitario for lote in lotes)
            
            if total_cantidad > 0:
                return total_valor / total_cantidad
            else:
                return producto.precio_compra
                
        except Exception as e:
            logger.error(f"Error calculando costo promedio: {str(e)}")
            return producto.precio_compra