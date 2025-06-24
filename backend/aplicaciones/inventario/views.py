"""
Views de Inventario - FELICITAFAC
API REST para movimientos PEPS y control de stock
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, F
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import logging

from .models import (
    TipoMovimiento, Almacen, StockProducto, LoteProducto,
    MovimientoInventario, DetalleMovimiento
)
from .serializers import (
    TipoMovimientoSerializer, AlmacenSerializer, StockProductoSerializer,
    LoteProductoSerializer, MovimientoInventarioSerializer,
    MovimientoCreateSerializer, ReporteInventarioSerializer
)
from aplicaciones.core.permissions import PuedeGestionarInventario
from aplicaciones.core.pagination import PaginacionEstandar

logger = logging.getLogger(__name__)


class TipoMovimientoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoMovimiento.objects.filter(activo=True).order_by('orden', 'nombre')
    serializer_class = TipoMovimientoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    
    @action(detail=False, methods=['get'])
    def entradas(self, request):
        tipos = self.get_queryset().filter(tipo='entrada')
        serializer = self.get_serializer(tipos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def salidas(self, request):
        tipos = self.get_queryset().filter(tipo='salida')
        serializer = self.get_serializer(tipos, many=True)
        return Response(serializer.data)


class AlmacenViewSet(viewsets.ModelViewSet):
    queryset = Almacen.objects.select_related('sucursal', 'responsable').filter(activo=True)
    serializer_class = AlmacenSerializer
    permission_classes = [IsAuthenticated, PuedeGestionarInventario]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, PuedeGestionarInventario]
        else:
            permission_classes = [IsAuthenticated, PuedeGestionarInventario]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def stocks(self, request, pk=None):
        almacen = self.get_object()
        stocks = StockProducto.objects.filter(
            almacen=almacen, activo=True, cantidad_actual__gt=0
        ).select_related('producto')
        
        serializer = StockProductoSerializer(stocks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def resumen(self, request, pk=None):
        almacen = self.get_object()
        
        total_productos = StockProducto.objects.filter(almacen=almacen, activo=True).count()
        valor_total = StockProducto.objects.filter(almacen=almacen, activo=True).aggregate(
            total=Sum('valor_inventario')
        )['total'] or 0
        
        productos_agotados = StockProducto.objects.filter(
            almacen=almacen, activo=True, cantidad_actual=0
        ).count()
        
        return Response({
            'total_productos': total_productos,
            'valor_total_inventario': valor_total,
            'productos_agotados': productos_agotados,
            'productos_disponibles': total_productos - productos_agotados
        })


class StockProductoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockProducto.objects.select_related('producto', 'almacen').filter(activo=True)
    serializer_class = StockProductoSerializer
    permission_classes = [IsAuthenticated, PuedeGestionarInventario]
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = {
        'almacen': ['exact'],
        'producto': ['exact'],
        'cantidad_actual': ['gte', 'lte', 'exact'],
        'cantidad_disponible': ['gte', 'lte'],
    }
    
    search_fields = ['producto__codigo', 'producto__nombre', 'almacen__nombre']
    ordering_fields = ['cantidad_actual', 'valor_inventario', 'fecha_ultimo_movimiento']
    ordering = ['-fecha_ultimo_movimiento']
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filtrar solo con stock
        con_stock = self.request.query_params.get('con_stock', '').lower() == 'true'
        if con_stock:
            queryset = queryset.filter(cantidad_actual__gt=0)
        
        # Filtrar productos críticos
        criticos = self.request.query_params.get('criticos', '').lower() == 'true'
        if criticos:
            queryset = queryset.filter(cantidad_actual__lte=F('producto__stock_minimo'))
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def alertas(self, request):
        """Productos con alertas de stock"""
        agotados = self.get_queryset().filter(cantidad_actual=0)
        criticos = self.get_queryset().filter(
            cantidad_actual__gt=0,
            cantidad_actual__lte=F('producto__stock_minimo')
        )
        
        return Response({
            'productos_agotados': StockProductoSerializer(agotados, many=True).data,
            'productos_criticos': StockProductoSerializer(criticos, many=True).data,
            'total_alertas': agotados.count() + criticos.count()
        })
    
    @action(detail=False, methods=['get'])
    def valorizado(self, request):
        """Reporte valorizado de inventario"""
        queryset = self.get_queryset().filter(cantidad_actual__gt=0)
        
        # Por almacén
        por_almacen = queryset.values('almacen__nombre').annotate(
            total_productos=Count('id'),
            valor_total=Sum('valor_inventario')
        ).order_by('-valor_total')
        
        # Por categoría
        por_categoria = queryset.values('producto__categoria__nombre').annotate(
            total_productos=Count('id'),
            valor_total=Sum('valor_inventario')
        ).order_by('-valor_total')
        
        # Totales
        totales = queryset.aggregate(
            total_productos=Count('id'),
            valor_total=Sum('valor_inventario'),
            costo_promedio=Sum('valor_inventario') / Sum('cantidad_actual') if queryset.exists() else 0
        )
        
        return Response({
            'por_almacen': list(por_almacen),
            'por_categoria': list(por_categoria),
            'totales': totales
        })


class LoteProductoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LoteProducto.objects.select_related('producto', 'almacen').filter(activo=True)
    serializer_class = LoteProductoSerializer
    permission_classes = [IsAuthenticated, PuedeGestionarInventario]
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = {
        'producto': ['exact'],
        'almacen': ['exact'],
        'estado_calidad': ['exact'],
        'fecha_vencimiento': ['gte', 'lte'],
    }
    
    search_fields = ['numero_lote', 'producto__codigo', 'producto__nombre']
    ordering_fields = ['fecha_ingreso', 'fecha_vencimiento', 'cantidad_actual']
    ordering = ['fecha_ingreso']  # PEPS: Primero en entrar
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Solo lotes con stock
        con_stock = self.request.query_params.get('con_stock', '').lower() == 'true'
        if con_stock:
            queryset = queryset.filter(cantidad_actual__gt=0)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def proximos_vencer(self, request):
        """Lotes próximos a vencer"""
        dias = int(request.query_params.get('dias', 30))
        fecha_limite = timezone.now().date() + timezone.timedelta(days=dias)
        
        lotes = self.get_queryset().filter(
            fecha_vencimiento__lte=fecha_limite,
            fecha_vencimiento__gte=timezone.now().date(),
            cantidad_actual__gt=0
        ).order_by('fecha_vencimiento')
        
        serializer = self.get_serializer(lotes, many=True)
        return Response({
            'lotes': serializer.data,
            'total': lotes.count(),
            'valor_total': sum(float(lote.valor_total) for lote in lotes)
        })
    
    @action(detail=False, methods=['get'])
    def vencidos(self, request):
        """Lotes vencidos"""
        lotes = self.get_queryset().filter(
            fecha_vencimiento__lt=timezone.now().date(),
            cantidad_actual__gt=0
        ).order_by('fecha_vencimiento')
        
        serializer = self.get_serializer(lotes, many=True)
        return Response({
            'lotes': serializer.data,
            'total': lotes.count(),
            'valor_total': sum(float(lote.valor_total) for lote in lotes)
        })


class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.select_related(
        'tipo_movimiento', 'almacen', 'usuario_creacion'
    ).prefetch_related('detalles').filter(activo=True)
    
    permission_classes = [IsAuthenticated, PuedeGestionarInventario]
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = {
        'tipo_movimiento': ['exact'],
        'almacen': ['exact'],
        'estado': ['exact'],
        'fecha_movimiento': ['gte', 'lte', 'exact'],
        'usuario_creacion': ['exact'],
    }
    
    search_fields = ['numero', 'observaciones', 'documento_origen']
    ordering_fields = ['fecha_movimiento', 'numero', 'total_valor']
    ordering = ['-fecha_movimiento', '-numero']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MovimientoCreateSerializer
        return MovimientoInventarioSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsAuthenticated, PuedeGestionarInventario]
        else:
            permission_classes = [IsAuthenticated, PuedeGestionarInventario]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Filtrar por usuario si no es admin
        if hasattr(user, 'rol') and user.rol.codigo not in ['admin', 'contador']:
            queryset = queryset.filter(usuario_creacion=user)
        
        return queryset
    
    def perform_create(self, serializer):
        try:
            movimiento = serializer.save()
            
            # Autorizar automáticamente si no requiere autorización
            if not movimiento.tipo_movimiento.requiere_autorizacion:
                movimiento.autorizar(self.request.user)
                movimiento.ejecutar()
            
            logger.info(f"Movimiento creado: {movimiento.numero} por {self.request.user.username}")
        except Exception as e:
            logger.error(f"Error creando movimiento: {str(e)}")
            raise
    
    @action(detail=True, methods=['post'])
    def autorizar(self, request, pk=None):
        """Autorizar movimiento"""
        movimiento = self.get_object()
        
        if not request.user.has_perm('inventario.change_movimientoinventario'):
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            movimiento.autorizar(request.user)
            return Response({'message': 'Movimiento autorizado'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def ejecutar(self, request, pk=None):
        """Ejecutar movimiento"""
        movimiento = self.get_object()
        
        if not request.user.has_perm('inventario.change_movimientoinventario'):
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            with transaction.atomic():
                movimiento.ejecutar()
                
            logger.info(f"Movimiento ejecutado: {movimiento.numero}")
            return Response({'message': 'Movimiento ejecutado exitosamente'})
        
        except Exception as e:
            logger.error(f"Error ejecutando movimiento: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        """Anular movimiento"""
        movimiento = self.get_object()
        
        if not request.user.has_perm('inventario.change_movimientoinventario'):
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        
        motivo = request.data.get('motivo', '')
        if not motivo:
            return Response({'error': 'Motivo requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                movimiento.anular(motivo)
                
            logger.info(f"Movimiento anulado: {movimiento.numero} - Motivo: {motivo}")
            return Response({'message': 'Movimiento anulado exitosamente'})
        
        except Exception as e:
            logger.error(f"Error anulando movimiento: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Movimientos pendientes de autorización"""
        pendientes = self.get_queryset().filter(estado='pendiente')
        serializer = self.get_serializer(pendientes, many=True)
        return Response({
            'total': pendientes.count(),
            'movimientos': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def reporte_periodo(self, request):
        """Reporte de movimientos por período"""
        fecha_desde = request.query_params.get('fecha_desde')
        fecha_hasta = request.query_params.get('fecha_hasta')
        
        if not fecha_desde or not fecha_hasta:
            return Response({'error': 'Fechas requeridas'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from datetime import datetime
            fecha_desde = datetime.strptime(fecha_desde, '%Y-%m-%d').date()
            fecha_hasta = datetime.strptime(fecha_hasta, '%Y-%m-%d').date()
            
            queryset = self.get_queryset().filter(
                fecha_movimiento__date__gte=fecha_desde,
                fecha_movimiento__date__lte=fecha_hasta,
                estado='ejecutado'
            )
            
            # Resumen por tipo
            por_tipo = queryset.values('tipo_movimiento__nombre').annotate(
                cantidad=Count('id'),
                valor_total=Sum('total_valor')
            ).order_by('-valor_total')
            
            # Entradas vs Salidas
            entradas = queryset.filter(tipo_movimiento__tipo='entrada').aggregate(
                cantidad=Count('id'),
                valor=Sum('total_valor')
            )
            
            salidas = queryset.filter(tipo_movimiento__tipo='salida').aggregate(
                cantidad=Count('id'),
                valor=Sum('total_valor')
            )
            
            return Response({
                'periodo': {'desde': fecha_desde, 'hasta': fecha_hasta},
                'total_movimientos': queryset.count(),
                'por_tipo': list(por_tipo),
                'entradas': entradas,
                'salidas': salidas,
                'saldo': (entradas['valor'] or 0) - (salidas['valor'] or 0)
            })
        
        except ValueError:
            return Response({'error': 'Formato de fecha inválido'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error generando reporte: {str(e)}")
            return Response({'error': 'Error interno'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)