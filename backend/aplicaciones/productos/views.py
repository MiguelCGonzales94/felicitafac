"""
Views de Productos - FELICITAFAC
Sistema de Facturación Electrónica para Perú
API REST para gestión de productos, inventarios y control de stock
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg, F
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import logging

from .models import TipoProducto, Categoria, Producto, ProductoProveedor
from .serializers import (
    TipoProductoSerializer, CategoriaSerializer, CategoriaListSerializer,
    ProductoSerializer, ProductoListSerializer, ProductoCreateSerializer,
    ProductoBusquedaSerializer, ProductoProveedorSerializer,
    EstadisticasProductoSerializer, MovimientoStockSerializer
)
from aplicaciones.core.permissions import (
    EsAdminOContador, EsVendedorOSuperior, PuedeVerProductos, PuedeEditarProductos
)
from aplicaciones.core.pagination import PaginacionEstandar

logger = logging.getLogger(__name__)


class TipoProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para tipos de productos
    Gestión de categorías base de productos
    """
    
    queryset = TipoProducto.objects.filter(activo=True).order_by('codigo')
    serializer_class = TipoProductoSerializer
    permission_classes = [IsAuthenticated, PuedeVerProductos]
    pagination_class = None  # Sin paginación para datos maestros
    
    def get_permissions(self):
        """Permisos específicos por acción"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, EsAdminOContador]
        else:
            permission_classes = [IsAuthenticated, PuedeVerProductos]
        
        return [permission() for permission in permission_classes]
    
    def perform_destroy(self, instance):
        """Eliminación lógica verificando dependencias"""
        if instance.productos.filter(activo=True).exists():
            raise ValidationError(
                "No se puede eliminar un tipo de producto que tiene productos asociados"
            )
        
        instance.soft_delete()
        logger.info(f"Tipo de producto eliminado: {instance.codigo} - {instance.nombre}")
    
    @action(detail=False, methods=['get'])
    def para_bienes(self, request):
        """Tipos de producto para bienes físicos"""
        tipos = self.get_queryset().filter(tipo='bien')
        serializer = self.get_serializer(tipos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def para_servicios(self, request):
        """Tipos de producto para servicios"""
        tipos = self.get_queryset().filter(tipo='servicio')
        serializer = self.get_serializer(tipos, many=True)
        return Response(serializer.data)


class CategoriaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para categorías de productos
    Maneja jerarquía de categorías padre-hijo
    """
    
    queryset = Categoria.objects.filter(activo=True).order_by('orden', 'nombre')
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated, PuedeVerProductos]
    pagination_class = PaginacionEstandar
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo', 'nombre', 'descripcion']
    ordering_fields = ['orden', 'nombre', 'fecha_creacion']
    ordering = ['orden', 'nombre']
    
    def get_serializer_class(self):
        """Seleccionar serializer según acción"""
        if self.action == 'list':
            return CategoriaListSerializer
        return CategoriaSerializer
    
    def get_permissions(self):
        """Permisos específicos por acción"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, PuedeEditarProductos]
        else:
            permission_classes = [IsAuthenticated, PuedeVerProductos]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filtrar categorías con parámetros opcionales"""
        queryset = self.queryset
        
        # Filtrar solo categorías padre
        solo_padres = self.request.query_params.get('solo_padres', '').lower() == 'true'
        if solo_padres:
            queryset = queryset.filter(categoria_padre__isnull=True)
        
        # Filtrar por categoría padre
        padre_id = self.request.query_params.get('padre', None)
        if padre_id:
            try:
                queryset = queryset.filter(categoria_padre_id=padre_id)
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def perform_destroy(self, instance):
        """Eliminación lógica verificando dependencias"""
        # Verificar productos asociados
        if instance.productos.filter(activo=True).exists():
            raise ValidationError(
                "No se puede eliminar una categoría que tiene productos asociados"
            )
        
        # Verificar subcategorías
        if instance.subcategorias.filter(activo=True).exists():
            raise ValidationError(
                "No se puede eliminar una categoría que tiene subcategorías"
            )
        
        instance.soft_delete()
        logger.info(f"Categoría eliminada: {instance.codigo} - {instance.nombre}")
    
    @action(detail=False, methods=['get'])
    def jerarquia(self, request):
        """Obtener jerarquía completa de categorías"""
        try:
            # Obtener categorías padre
            categorias_padre = self.get_queryset().filter(categoria_padre__isnull=True)
            
            def construir_jerarquia(categoria):
                """Construir jerarquía recursiva"""
                subcategorias = categoria.subcategorias.filter(activo=True).order_by('orden', 'nombre')
                return {
                    'id': categoria.id,
                    'codigo': categoria.codigo,
                    'nombre': categoria.nombre,
                    'cantidad_productos': categoria.productos.filter(activo=True).count(),
                    'subcategorias': [construir_jerarquia(sub) for sub in subcategorias]
                }
            
            jerarquia = [construir_jerarquia(cat) for cat in categorias_padre]
            return Response(jerarquia)
        
        except Exception as e:
            logger.error(f"Error obteniendo jerarquía de categorías: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def productos(self, request, pk=None):
        """Obtener productos de la categoría"""
        categoria = self.get_object()
        productos = categoria.productos.filter(activo=True, permite_venta=True)
        
        # Aplicar filtros opcionales
        disponibles_solo = request.query_params.get('disponibles', '').lower() == 'true'
        if disponibles_solo:
            productos = productos.filter(
                Q(controla_stock=False) | Q(stock_actual__gt=0)
            )
        
        # Paginación
        page = self.paginate_queryset(productos)
        if page is not None:
            from .serializers import ProductoListSerializer
            serializer = ProductoListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        from .serializers import ProductoListSerializer
        serializer = ProductoListSerializer(productos, many=True)
        return Response(serializer.data)


class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal para gestión de productos
    CRUD completo con funcionalidades de inventario
    """
    
    queryset = Producto.objects.select_related(
        'tipo_producto', 'categoria'
    ).prefetch_related(
        'proveedores'
    ).filter(activo=True)
    
    permission_classes = [IsAuthenticated, PuedeVerProductos]
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtros
    filterset_fields = {
        'tipo_producto': ['exact'],
        'categoria': ['exact'],
        'marca': ['exact', 'icontains'],
        'permite_venta': ['exact'],
        'controla_stock': ['exact'],
        'stock_actual': ['gte', 'lte', 'exact'],
        'precio_venta': ['gte', 'lte'],
        'fecha_creacion': ['gte', 'lte'],
    }
    
    # Búsqueda
    search_fields = [
        'codigo', 'nombre', 'descripcion', 'codigo_barras',
        'codigo_interno', 'marca', 'modelo'
    ]
    
    # Ordenamiento
    ordering_fields = [
        'codigo', 'nombre', 'precio_venta', 'stock_actual',
        'fecha_creacion', 'fecha_ultima_venta', 'total_vendido'
    ]
    ordering = ['codigo']
    
    def get_serializer_class(self):
        """Seleccionar serializer según acción"""
        if self.action == 'list':
            return ProductoListSerializer
        elif self.action == 'create':
            return ProductoCreateSerializer
        else:
            return ProductoSerializer
    
    def get_permissions(self):
        """Permisos específicos por acción"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, PuedeEditarProductos]
        else:
            permission_classes = [IsAuthenticated, PuedeVerProductos]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filtrar productos según parámetros"""
        queryset = self.queryset
        
        # Filtrar solo productos disponibles para venta
        solo_ventas = self.request.query_params.get('solo_ventas', '').lower() == 'true'
        if solo_ventas:
            queryset = queryset.filter(permite_venta=True)
        
        # Filtrar productos con stock disponible
        con_stock = self.request.query_params.get('con_stock', '').lower() == 'true'
        if con_stock:
            queryset = queryset.filter(
                Q(controla_stock=False) | Q(stock_actual__gt=0)
            )
        
        # Filtrar por estado de stock
        estado_stock = self.request.query_params.get('estado_stock', None)
        if estado_stock:
            if estado_stock == 'agotado':
                queryset = queryset.filter(controla_stock=True, stock_actual=0)
            elif estado_stock == 'critico':
                queryset = queryset.filter(
                    controla_stock=True,
                    stock_actual__gt=0,
                    stock_actual__lte=F('stock_minimo')
                )
            elif estado_stock == 'bajo':
                queryset = queryset.filter(
                    controla_stock=True,
                    stock_actual__gt=F('stock_minimo'),
                    stock_actual__lte=F('punto_reorden')
                )
        
        return queryset
    
    def perform_create(self, serializer):
        """Crear producto con auditoría"""
        try:
            producto = serializer.save()
            logger.info(
                f"Producto creado: {producto.codigo} - {producto.nombre} "
                f"por usuario {self.request.user.username}"
            )
        except Exception as e:
            logger.error(f"Error creando producto: {str(e)}")
            raise
    
    def perform_update(self, serializer):
        """Actualizar producto con auditoría"""
        try:
            producto = serializer.save()
            logger.info(
                f"Producto actualizado: {producto.codigo} - {producto.nombre} "
                f"por usuario {self.request.user.username}"
            )
        except Exception as e:
            logger.error(f"Error actualizando producto: {str(e)}")
            raise
    
    def perform_destroy(self, instance):
        """Eliminación lógica del producto"""
        # Verificar que no tenga movimientos de inventario
        if hasattr(instance, 'movimientos_inventario') and instance.movimientos_inventario.exists():
            raise ValidationError(
                "No se puede eliminar un producto que tiene movimientos de inventario"
            )
        
        try:
            instance.soft_delete()
            logger.info(
                f"Producto eliminado: {instance.codigo} - {instance.nombre} "
                f"por usuario {self.request.user.username}"
            )
        except Exception as e:
            logger.error(f"Error eliminando producto: {str(e)}")
            raise
    
    @action(detail=False, methods=['post'])
    def busqueda_avanzada(self, request):
        """Búsqueda avanzada de productos"""
        serializer = ProductoBusquedaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Parámetros de búsqueda inválidos', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset()
        data = serializer.validated_data
        
        # Aplicar filtros
        if data.get('termino'):
            termino = data['termino']
            queryset = queryset.filter(
                Q(codigo__icontains=termino) |
                Q(nombre__icontains=termino) |
                Q(descripcion__icontains=termino) |
                Q(codigo_barras__icontains=termino) |
                Q(marca__icontains=termino)
            )
        
        if data.get('tipo_producto'):
            queryset = queryset.filter(tipo_producto_id=data['tipo_producto'])
        
        if data.get('categoria'):
            queryset = queryset.filter(categoria_id=data['categoria'])
        
        if data.get('marca'):
            queryset = queryset.filter(marca__icontains=data['marca'])
        
        if data.get('permite_venta') is not None:
            queryset = queryset.filter(permite_venta=data['permite_venta'])
        
        if data.get('controla_stock') is not None:
            queryset = queryset.filter(controla_stock=data['controla_stock'])
        
        if data.get('precio_minimo'):
            queryset = queryset.filter(precio_venta__gte=data['precio_minimo'])
        
        if data.get('precio_maximo'):
            queryset = queryset.filter(precio_venta__lte=data['precio_maximo'])
        
        if data.get('con_vencimiento'):
            queryset = queryset.filter(fecha_vencimiento__isnull=False)
        
        if data.get('sin_movimiento_dias'):
            fecha_limite = timezone.now() - timezone.timedelta(days=data['sin_movimiento_dias'])
            queryset = queryset.filter(
                Q(fecha_ultima_venta__lt=fecha_limite) |
                Q(fecha_ultima_venta__isnull=True)
            )
        
        # Aplicar estado de stock
        estado_stock = data.get('estado_stock')
        if estado_stock:
            if estado_stock == 'agotado':
                queryset = queryset.filter(controla_stock=True, stock_actual=0)
            elif estado_stock == 'critico':
                queryset = queryset.filter(
                    controla_stock=True,
                    stock_actual__gt=0,
                    stock_actual__lte=F('stock_minimo')
                )
            elif estado_stock == 'bajo':
                queryset = queryset.filter(
                    controla_stock=True,
                    stock_actual__gt=F('stock_minimo'),
                    stock_actual__lte=F('punto_reorden')
                )
            elif estado_stock == 'normal':
                queryset = queryset.filter(
                    Q(controla_stock=False) |
                    Q(stock_actual__gt=F('punto_reorden'))
                )
            elif estado_stock == 'exceso':
                queryset = queryset.filter(
                    controla_stock=True,
                    stock_maximo__gt=0,
                    stock_actual__gte=F('stock_maximo')
                )
        
        # Paginar resultados
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ProductoListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductoListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def disponibilidad(self, request, pk=None):
        """Verificar disponibilidad del producto"""
        producto = self.get_object()
        cantidad = request.query_params.get('cantidad', 1)
        
        try:
            cantidad = Decimal(str(cantidad))
            disponible, mensaje = producto.esta_disponible(cantidad)
            
            return Response({
                'disponible': disponible,
                'mensaje': mensaje,
                'stock_actual': float(producto.stock_actual),
                'controla_stock': producto.controla_stock,
                'cantidad_solicitada': float(cantidad)
            })
        
        except (ValueError, TypeError):
            return Response(
                {'error': 'Cantidad inválida'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def movimiento_stock(self, request, pk=None):
        """Realizar movimiento de stock manual"""
        producto = self.get_object()
        
        # Verificar permisos
        if not request.user.has_perm('productos.change_producto'):
            return Response(
                {'error': 'No tiene permisos para realizar movimientos de stock'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = MovimientoStockSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        cantidad = data['cantidad']
        tipo_movimiento = data['tipo_movimiento']
        motivo = data['motivo']
        costo_unitario = data.get('costo_unitario', producto.precio_compra)
        
        try:
            with transaction.atomic():
                # Validar disponibilidad para salidas
                if tipo_movimiento == 'salida' and producto.controla_stock:
                    if producto.stock_actual < cantidad:
                        return Response(
                            {'error': f'Stock insuficiente. Disponible: {producto.stock_actual}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                # Realizar movimiento
                stock_anterior = producto.stock_actual
                
                if tipo_movimiento == 'entrada':
                    producto.stock_actual += cantidad
                elif tipo_movimiento == 'salida':
                    producto.stock_actual -= cantidad
                elif tipo_movimiento == 'ajuste':
                    producto.stock_actual = cantidad
                
                producto.save(update_fields=['stock_actual'])
                
                # TODO: Crear registro en MovimientoInventario
                # Aquí se integraría con el módulo de inventario
                
                logger.info(
                    f"Movimiento de stock - Producto: {producto.codigo}, "
                    f"Tipo: {tipo_movimiento}, Cantidad: {cantidad}, "
                    f"Stock anterior: {stock_anterior}, Stock nuevo: {producto.stock_actual}, "
                    f"Usuario: {request.user.username}, Motivo: {motivo}"
                )
                
                return Response({
                    'message': 'Movimiento de stock realizado exitosamente',
                    'stock_anterior': float(stock_anterior),
                    'stock_nuevo': float(producto.stock_actual),
                    'cantidad_movimiento': float(cantidad),
                    'tipo_movimiento': tipo_movimiento
                })
        
        except Exception as e:
            logger.error(f"Error en movimiento de stock: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def alertas_stock(self, request):
        """Obtener productos con alertas de stock"""
        productos_criticos = self.get_queryset().filter(
            controla_stock=True,
            stock_actual__lte=F('stock_minimo')
        ).order_by('stock_actual')
        
        productos_agotados = productos_criticos.filter(stock_actual=0)
        productos_bajos = productos_criticos.filter(stock_actual__gt=0)
        
        productos_reorden = self.get_queryset().filter(
            controla_stock=True,
            stock_actual__gt=F('stock_minimo'),
            stock_actual__lte=F('punto_reorden')
        ).order_by('stock_actual')
        
        return Response({
            'productos_agotados': ProductoListSerializer(productos_agotados, many=True).data,
            'productos_criticos': ProductoListSerializer(productos_bajos, many=True).data,
            'productos_reorden': ProductoListSerializer(productos_reorden, many=True).data,
            'resumen': {
                'total_agotados': productos_agotados.count(),
                'total_criticos': productos_bajos.count(),
                'total_reorden': productos_reorden.count(),
                'total_alertas': productos_criticos.count() + productos_reorden.count()
            }
        })
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Estadísticas generales de productos"""
        if not request.user.has_perm('productos.view_estadisticas'):
            return Response(
                {'error': 'No tiene permisos para ver estadísticas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            queryset = self.get_queryset()
            
            # Estadísticas básicas
            total_productos = queryset.count()
            productos_activos = queryset.filter(permite_venta=True).count()
            productos_agotados = queryset.filter(controla_stock=True, stock_actual=0).count()
            productos_criticos = queryset.filter(
                controla_stock=True,
                stock_actual__gt=0,
                stock_actual__lte=F('stock_minimo')
            ).count()
            
            # Productos sin movimiento (más de 30 días)
            fecha_limite = timezone.now() - timezone.timedelta(days=30)
            productos_sin_movimiento = queryset.filter(
                Q(fecha_ultima_venta__lt=fecha_limite) |
                Q(fecha_ultima_venta__isnull=True)
            ).count()
            
            # Valor total del inventario
            valor_inventario = queryset.aggregate(
                valor_total=Sum(F('stock_actual') * F('precio_compra'))
            )['valor_total'] or 0
            
            # Productos más vendidos
            productos_mas_vendidos = queryset.filter(
                total_vendido__gt=0
            ).order_by('-total_vendido')[:10]
            
            # Productos menos vendidos
            productos_menos_vendidos = queryset.filter(
                numero_ventas__gt=0
            ).order_by('total_vendido')[:10]
            
            # Por categoría
            por_categoria = queryset.values('categoria__nombre').annotate(
                cantidad=Count('id')
            ).order_by('-cantidad')[:10]
            
            # Por tipo de producto
            por_tipo_producto = queryset.values('tipo_producto__nombre').annotate(
                cantidad=Count('id')
            ).order_by('-cantidad')
            
            # Por marca
            por_marca = queryset.exclude(marca__isnull=True).exclude(marca='').values('marca').annotate(
                cantidad=Count('id')
            ).order_by('-cantidad')[:10]
            
            # Promedios
            promedios = queryset.aggregate(
                rotacion_promedio=Avg('total_vendido'),
                margen_promedio=Avg('margen_utilidad')
            )
            
            estadisticas = {
                'total_productos': total_productos,
                'productos_activos': productos_activos,
                'productos_agotados': productos_agotados,
                'productos_criticos': productos_criticos,
                'productos_sin_movimiento': productos_sin_movimiento,
                'valor_total_inventario': valor_inventario,
                'productos_mas_vendidos': ProductoListSerializer(productos_mas_vendidos, many=True).data,
                'productos_menos_vendidos': ProductoListSerializer(productos_menos_vendidos, many=True).data,
                'por_categoria': {item['categoria__nombre']: item['cantidad'] for item in por_categoria},
                'por_tipo_producto': {item['tipo_producto__nombre']: item['cantidad'] for item in por_tipo_producto},
                'por_marca': {item['marca']: item['cantidad'] for item in por_marca},
                'rotacion_promedio': promedios['rotacion_promedio'] or 0,
                'margen_promedio': promedios['margen_promedio'] or 0,
            }
            
            return Response(EstadisticasProductoSerializer(estadisticas).data)
        
        except Exception as e:
            logger.error(f"Error generando estadísticas de productos: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def buscar_por_codigo(self, request):
        """Buscar producto por código o código de barras"""
        codigo = request.query_params.get('codigo', '').strip()
        
        if not codigo:
            return Response(
                {'error': 'Código es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Buscar por código principal
            producto = self.get_queryset().filter(codigo=codigo).first()
            
            # Si no encuentra, buscar por código de barras
            if not producto:
                producto = self.get_queryset().filter(codigo_barras=codigo).first()
            
            # Si no encuentra, buscar por código interno
            if not producto:
                producto = self.get_queryset().filter(codigo_interno=codigo).first()
            
            if producto:
                serializer = self.get_serializer(producto)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': 'Producto no encontrado'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        except Exception as e:
            logger.error(f"Error buscando producto por código: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def proveedores(self, request, pk=None):
        """Obtener proveedores del producto"""
        producto = self.get_object()
        proveedores = producto.proveedores.filter(activo=True).order_by('-es_principal', 'proveedor__razon_social')
        serializer = ProductoProveedorSerializer(proveedores, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def agregar_proveedor(self, request, pk=None):
        """Agregar proveedor al producto"""
        producto = self.get_object()
        
        if not request.user.has_perm('productos.change_producto'):
            return Response(
                {'error': 'No tiene permisos para agregar proveedores'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ProductoProveedorSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Si es principal, desmarcar otros como principales
                    if serializer.validated_data.get('es_principal', False):
                        ProductoProveedor.objects.filter(
                            producto=producto, es_principal=True
                        ).update(es_principal=False)
                    
                    proveedor_producto = serializer.save(producto=producto)
                    
                    logger.info(
                        f"Proveedor agregado al producto {producto.codigo}: "
                        f"{proveedor_producto.proveedor.razon_social}"
                    )
                    
                    return Response(
                        ProductoProveedorSerializer(proveedor_producto).data,
                        status=status.HTTP_201_CREATED
                    )
            except Exception as e:
                logger.error(f"Error agregando proveedor: {str(e)}")
                return Response(
                    {'error': 'Error interno del servidor'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductoProveedorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para relaciones producto-proveedor
    """
    
    queryset = ProductoProveedor.objects.select_related(
        'producto', 'proveedor'
    ).filter(activo=True)
    serializer_class = ProductoProveedorSerializer
    permission_classes = [IsAuthenticated, PuedeEditarProductos]
    pagination_class = PaginacionEstandar
    
    def get_queryset(self):
        """Filtrar por producto si se especifica"""
        queryset = self.queryset
        producto_id = self.request.query_params.get('producto', None)
        
        if producto_id:
            queryset = queryset.filter(producto_id=producto_id)
        
        return queryset.order_by('-es_principal', 'proveedor__razon_social')
    
    def perform_create(self, serializer):
        """Crear relación con validaciones"""
        try:
            # Si es principal, desmarcar otros como principales del mismo producto
            if serializer.validated_data.get('es_principal', False):
                producto = serializer.validated_data['producto']
                ProductoProveedor.objects.filter(
                    producto=producto, es_principal=True
                ).update(es_principal=False)
            
            proveedor_producto = serializer.save()
            logger.info(
                f"Relación producto-proveedor creada: {proveedor_producto.producto.codigo} - "
                f"{proveedor_producto.proveedor.razon_social}"
            )
        except Exception as e:
            logger.error(f"Error creando relación producto-proveedor: {str(e)}")
            raise
    
    def perform_destroy(self, instance):
        """Eliminación lógica de la relación"""
        try:
            instance.soft_delete()
            logger.info(
                f"Relación producto-proveedor eliminada: {instance.producto.codigo} - "
                f"{instance.proveedor.razon_social}"
            )
        except Exception as e:
            logger.error(f"Error eliminando relación producto-proveedor: {str(e)}")
            raise