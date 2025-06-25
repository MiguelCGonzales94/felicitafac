"""
Serializers de Productos - FELICITAFAC
Sistema de Facturación Electrónica para Perú
API REST con validaciones específicas para inventarios y SUNAT
"""

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.core.exceptions import ValidationError
from django.db import transaction
from decimal import Decimal
import re
from .models import TipoProducto, Categoria, Producto, ProductoProveedor


class TipoProductoSerializer(serializers.ModelSerializer):
    """
    Serializer para tipos de productos
    """
    
    cantidad_productos = serializers.SerializerMethodField()
    
    class Meta:
        model = TipoProducto
        fields = [
            'id', 'codigo', 'nombre', 'tipo', 'unidad_medida_sunat',
            'controla_stock', 'permite_decimales', 'requiere_lote',
            'requiere_vencimiento', 'cantidad_productos', 'activo',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def get_cantidad_productos(self, obj):
        """Cuenta la cantidad de productos de este tipo"""
        return obj.productos.filter(activo=True).count()
    
    def validate_codigo(self, value):
        """Validar código único"""
        if not re.match(r'^[A-Z0-9]{2,10}$', value):
            raise serializers.ValidationError(
                "Código debe tener entre 2-10 caracteres alfanuméricos"
            )
        return value.upper()
    
    def validate_unidad_medida_sunat(self, value):
        """Validar código de unidad SUNAT"""
        unidades_validas = ['ZZ', 'NIU', 'KGM', 'MTR', 'LTR', 'H87', 'BX', 'PK', 'SET']
        if value not in unidades_validas:
            raise serializers.ValidationError(
                f"Unidad debe ser una de: {', '.join(unidades_validas)}"
            )
        return value


class CategoriaSerializer(serializers.ModelSerializer):
    """
    Serializer para categorías de productos
    Maneja jerarquía de categorías padre-hijo
    """
    
    categoria_padre_nombre = serializers.CharField(
        source='categoria_padre.nombre', read_only=True
    )
    subcategorias = serializers.SerializerMethodField()
    ruta_completa = serializers.ReadOnlyField(source='obtener_ruta_completa')
    cantidad_productos = serializers.SerializerMethodField()
    
    class Meta:
        model = Categoria
        fields = [
            'id', 'codigo', 'nombre', 'descripcion', 'categoria_padre',
            'categoria_padre_nombre', 'subcategorias', 'ruta_completa',
            'orden', 'margen_utilidad_defecto', 'cuenta_contable_ventas',
            'cuenta_contable_inventario', 'cantidad_productos', 'activo',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def get_subcategorias(self, obj):
        """Obtiene subcategorías directas"""
        subcategorias = obj.subcategorias.filter(activo=True).order_by('orden', 'nombre')
        return CategoriaListSerializer(subcategorias, many=True).data
    
    def get_cantidad_productos(self, obj):
        """Cuenta productos en esta categoría"""
        return obj.productos.filter(activo=True).count()
    
    def validate_codigo(self, value):
        """Validar código de categoría"""
        if not re.match(r'^[A-Z0-9]{2,20}$', value):
            raise serializers.ValidationError(
                "Código debe tener entre 2-20 caracteres alfanuméricos"
            )
        return value.upper()
    
    def validate_margen_utilidad_defecto(self, value):
        """Validar margen de utilidad"""
        if value < 0 or value > 1000:
            raise serializers.ValidationError(
                "Margen debe estar entre 0% y 1000%"
            )
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        categoria_padre = data.get('categoria_padre')
        
        # Validar que no se cree referencia circular
        if categoria_padre and self.instance:
            if categoria_padre == self.instance:
                raise serializers.ValidationError({
                    'categoria_padre': 'Una categoría no puede ser padre de sí misma'
                })
            
            # Verificar que el padre no sea una subcategoría de esta categoría
            if self._es_subcategoria(categoria_padre, self.instance):
                raise serializers.ValidationError({
                    'categoria_padre': 'No se puede crear una referencia circular'
                })
        
        return data
    
    def _es_subcategoria(self, posible_hijo, padre):
        """Verifica si una categoría es subcategoría de otra"""
        if posible_hijo.categoria_padre == padre:
            return True
        elif posible_hijo.categoria_padre:
            return self._es_subcategoria(posible_hijo.categoria_padre, padre)
        return False


class CategoriaListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de categorías
    """
    
    categoria_padre_nombre = serializers.CharField(
        source='categoria_padre.nombre', read_only=True
    )
    cantidad_productos = serializers.SerializerMethodField()
    
    class Meta:
        model = Categoria
        fields = [
            'id', 'codigo', 'nombre', 'categoria_padre_nombre',
            'orden', 'cantidad_productos', 'activo'
        ]
    
    def get_cantidad_productos(self, obj):
        return obj.productos.filter(activo=True).count()


class ProductoProveedorSerializer(serializers.ModelSerializer):
    """
    Serializer para relación producto-proveedor
    """
    
    proveedor_nombre = serializers.CharField(source='proveedor.razon_social', read_only=True)
    proveedor_documento = serializers.CharField(source='proveedor.numero_documento', read_only=True)
    
    class Meta:
        model = ProductoProveedor
        fields = [
            'id', 'proveedor', 'proveedor_nombre', 'proveedor_documento',
            'codigo_proveedor', 'precio_compra', 'tiempo_entrega_dias',
            'cantidad_minima', 'es_principal', 'fecha_ultimo_precio',
            'notas', 'activo'
        ]
        read_only_fields = ['fecha_ultimo_precio']
    
    def validate_precio_compra(self, value):
        """Validar precio de compra"""
        if value <= 0:
            raise serializers.ValidationError("Precio de compra debe ser mayor a 0")
        return value
    
    def validate_tiempo_entrega_dias(self, value):
        """Validar tiempo de entrega"""
        if value < 0 or value > 365:
            raise serializers.ValidationError(
                "Tiempo de entrega debe estar entre 0 y 365 días"
            )
        return value
    
    def validate_cantidad_minima(self, value):
        """Validar cantidad mínima"""
        if value <= 0:
            raise serializers.ValidationError("Cantidad mínima debe ser mayor a 0")
        return value


class ProductoSerializer(serializers.ModelSerializer):
    """
    Serializer principal para productos
    Incluye validaciones completas y campos calculados
    """
    
    # Campos relacionados
    tipo_producto_info = TipoProductoSerializer(source='tipo_producto', read_only=True)
    categoria_info = CategoriaSerializer(source='categoria', read_only=True)
    proveedores = ProductoProveedorSerializer(many=True, read_only=True)
    
    # Campos calculados
    disponibilidad = serializers.SerializerMethodField()
    necesita_reorden_info = serializers.SerializerMethodField()
    datos_facturacion = serializers.ReadOnlyField(source='obtener_datos_facturacion')
    rotacion_inventario = serializers.SerializerMethodField()
    margen_utilidad_calculado = serializers.SerializerMethodField()
    
    # Estado del producto
    estado_stock = serializers.SerializerMethodField()
    dias_sin_venta = serializers.SerializerMethodField()
    valor_inventario_actual = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = [
            # Información básica
            'id', 'codigo', 'nombre', 'descripcion', 'tipo_producto',
            'tipo_producto_info', 'categoria', 'categoria_info',
            
            # Códigos adicionales
            'codigo_barras', 'codigo_interno', 'codigo_proveedor',
            'codigo_producto_sunat', 'tipo_afectacion_igv',
            
            # Precios
            'precio_compra', 'precio_venta', 'precio_venta_con_igv',
            'margen_utilidad', 'margen_utilidad_calculado',
            
            # Inventario
            'stock_actual', 'stock_minimo', 'stock_maximo', 'punto_reorden',
            'disponibilidad', 'necesita_reorden_info', 'estado_stock',
            'valor_inventario_actual',
            
            # Unidades
            'unidad_medida', 'unidad_medida_sunat', 'peso', 'volumen',
            
            # Configuraciones
            'permite_venta', 'permite_compra', 'controla_stock',
            'permite_descuento', 'descuento_maximo',
            
            # Información adicional
            'marca', 'modelo', 'color', 'talla', 'fecha_vencimiento',
            'fecha_ultima_compra', 'fecha_ultima_venta', 'dias_sin_venta',
            
            # Contabilidad
            'cuenta_contable_ventas', 'cuenta_contable_compras',
            'cuenta_contable_inventario',
            
            # Estadísticas
            'total_vendido', 'total_comprado', 'monto_total_ventas',
            'numero_ventas', 'rotacion_inventario',
            
            # Relacionados
            'proveedores', 'datos_facturacion',
            
            # Auditoría
            'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = [
            'precio_venta_con_igv', 'margen_utilidad', 'total_vendido',
            'total_comprado', 'monto_total_ventas', 'numero_ventas',
            'fecha_ultima_compra', 'fecha_ultima_venta',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        
        validators = [
            UniqueTogetherValidator(
                queryset=Producto.objects.all(),
                fields=['codigo'],
                message="Ya existe un producto con este código"
            )
        ]
    
    def get_disponibilidad(self, obj):
        """Información de disponibilidad del producto"""
        disponible, mensaje = obj.esta_disponible()
        return {
            'disponible': disponible,
            'mensaje': mensaje,
            'stock_actual': float(obj.stock_actual)
        }
    
    def get_necesita_reorden_info(self, obj):
        """Información sobre necesidad de reorden"""
        necesita = obj.necesita_reorden()
        return {
            'necesita_reorden': necesita,
            'punto_reorden': float(obj.punto_reorden),
            'stock_minimo': float(obj.stock_minimo)
        }
    
    def get_estado_stock(self, obj):
        """Estado del stock del producto"""
        if not obj.controla_stock:
            return 'NO_CONTROLA'
        elif obj.stock_actual <= 0:
            return 'AGOTADO'
        elif obj.stock_actual <= obj.stock_minimo:
            return 'CRITICO'
        elif obj.stock_actual <= obj.punto_reorden:
            return 'BAJO'
        elif obj.stock_actual >= obj.stock_maximo and obj.stock_maximo > 0:
            return 'EXCESO'
        else:
            return 'NORMAL'
    
    def get_dias_sin_venta(self, obj):
        """Días desde la última venta"""
        if obj.fecha_ultima_venta:
            from django.utils import timezone
            delta = timezone.now() - obj.fecha_ultima_venta
            return delta.days
        return None
    
    def get_valor_inventario_actual(self, obj):
        """Valor actual del inventario"""
        return float(obj.stock_actual * obj.precio_compra)
    
    def get_rotacion_inventario(self, obj):
        """Cálculo de rotación de inventario"""
        if obj.stock_actual > 0 and obj.total_vendido > 0:
            # Rotación = Ventas / Stock promedio (simplificado)
            return float(obj.total_vendido / obj.stock_actual)
        return 0.0
    
    def get_margen_utilidad_calculado(self, obj):
        """Margen de utilidad en porcentaje"""
        return float(obj.margen_utilidad)
    
    def validate_codigo(self, value):
        """Validar código de producto"""
        if not re.match(r'^[A-Z0-9\-]{3,50}$', value):
            raise serializers.ValidationError(
                "Código debe tener 3-50 caracteres alfanuméricos y guiones"
            )
        return value.upper()
    
    def validate_nombre(self, value):
        """Validar nombre del producto"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Nombre debe tener al menos 3 caracteres"
            )
        
        if not re.match(r'^[A-Za-z0-9\s\.\,\-\&\'\"\/\(\)]+$', value):
            raise serializers.ValidationError(
                "Nombre contiene caracteres no válidos"
            )
        
        return value.strip().upper()
    
    def validate_codigo_barras(self, value):
        """Validar código de barras"""
        if value and not re.match(r'^[0-9]{8,13}$', value):
            raise serializers.ValidationError(
                "Código de barras debe tener entre 8 y 13 dígitos"
            )
        return value
    
    def validate_precio_compra(self, value):
        """Validar precio de compra"""
        if value < 0:
            raise serializers.ValidationError("Precio de compra no puede ser negativo")
        return value
    
    def validate_precio_venta(self, value):
        """Validar precio de venta"""
        if value <= 0:
            raise serializers.ValidationError("Precio de venta debe ser mayor a 0")
        return value
    
    def validate_stock_minimo(self, value):
        """Validar stock mínimo"""
        if value < 0:
            raise serializers.ValidationError("Stock mínimo no puede ser negativo")
        return value
    
    def validate_stock_maximo(self, value):
        """Validar stock máximo"""
        if value < 0:
            raise serializers.ValidationError("Stock máximo no puede ser negativo")
        return value
    
    def validate_punto_reorden(self, value):
        """Validar punto de reorden"""
        if value < 0:
            raise serializers.ValidationError("Punto de reorden no puede ser negativo")
        return value
    
    def validate_descuento_maximo(self, value):
        """Validar descuento máximo"""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Descuento máximo debe estar entre 0% y 100%"
            )
        return value
    
    def validate_peso(self, value):
        """Validar peso"""
        if value and value < 0:
            raise serializers.ValidationError("Peso no puede ser negativo")
        return value
    
    def validate_volumen(self, value):
        """Validar volumen"""
        if value and value < 0:
            raise serializers.ValidationError("Volumen no puede ser negativo")
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        # Validar precios
        precio_compra = data.get('precio_compra', getattr(self.instance, 'precio_compra', 0))
        precio_venta = data.get('precio_venta')
        
        if precio_venta and precio_compra > precio_venta:
            raise serializers.ValidationError({
                'precio_venta': 'Precio de venta no puede ser menor al precio de compra'
            })
        
        # Validar stocks
        stock_minimo = data.get('stock_minimo', getattr(self.instance, 'stock_minimo', 0))
        stock_maximo = data.get('stock_maximo', getattr(self.instance, 'stock_maximo', 0))
        punto_reorden = data.get('punto_reorden', getattr(self.instance, 'punto_reorden', 0))
        
        if stock_maximo > 0 and stock_minimo > stock_maximo:
            raise serializers.ValidationError({
                'stock_minimo': 'Stock mínimo no puede ser mayor al stock máximo'
            })
        
        if punto_reorden > stock_maximo and stock_maximo > 0:
            raise serializers.ValidationError({
                'punto_reorden': 'Punto de reorden no puede ser mayor al stock máximo'
            })
        
        # Validar tipo de producto vs configuraciones
        tipo_producto = data.get('tipo_producto', getattr(self.instance, 'tipo_producto', None))
        controla_stock = data.get('controla_stock', getattr(self.instance, 'controla_stock', True))
        
        if tipo_producto and tipo_producto.tipo == 'servicio' and controla_stock:
            raise serializers.ValidationError({
                'controla_stock': 'Los servicios no deben controlar stock'
            })
        
        # Validar código de barras único
        codigo_barras = data.get('codigo_barras')
        if codigo_barras:
            existing = Producto.objects.filter(codigo_barras=codigo_barras, activo=True)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError({
                    'codigo_barras': 'Ya existe un producto con este código de barras'
                })
        
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        """Crear producto con configuraciones automáticas"""
        # Configurar unidad SUNAT según tipo de producto
        if not validated_data.get('unidad_medida_sunat'):
            tipo_producto = validated_data.get('tipo_producto')
            if tipo_producto:
                validated_data['unidad_medida_sunat'] = tipo_producto.unidad_medida_sunat
        
        # Configurar control de stock
        tipo_producto = validated_data.get('tipo_producto')
        if tipo_producto and tipo_producto.tipo == 'servicio':
            validated_data['controla_stock'] = False
            validated_data['stock_actual'] = Decimal('0.0000')
            validated_data['stock_minimo'] = Decimal('0.0000')
            validated_data['stock_maximo'] = Decimal('0.0000')
        
        producto = super().create(validated_data)
        
        # Configurar cuentas contables automáticas si la categoría las tiene
        if producto.categoria:
            if producto.categoria.cuenta_contable_ventas and not producto.cuenta_contable_ventas:
                producto.cuenta_contable_ventas = producto.categoria.cuenta_contable_ventas
            
            if producto.categoria.cuenta_contable_inventario and not producto.cuenta_contable_inventario:
                producto.cuenta_contable_inventario = producto.categoria.cuenta_contable_inventario
            
            producto.save(update_fields=['cuenta_contable_ventas', 'cuenta_contable_inventario'])
        
        return producto


class ProductoListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de productos
    Optimizado para performance
    """
    
    tipo_producto_nombre = serializers.CharField(source='tipo_producto.nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    estado_stock = serializers.SerializerMethodField()
    disponibilidad_simple = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = [
            'id', 'codigo', 'nombre', 'tipo_producto_nombre', 'categoria_nombre',
            'precio_venta', 'precio_venta_con_igv', 'stock_actual',
            'estado_stock', 'disponibilidad_simple', 'permite_venta',
            'controla_stock', 'activo'
        ]
    
    def get_estado_stock(self, obj):
        """Estado simplificado del stock"""
        if not obj.controla_stock:
            return 'NO_CONTROLA'
        elif obj.stock_actual <= 0:
            return 'AGOTADO'
        elif obj.stock_actual <= obj.stock_minimo:
            return 'CRITICO'
        else:
            return 'NORMAL'
    
    def get_disponibilidad_simple(self, obj):
        """Disponibilidad simplificada"""
        if not obj.controla_stock:
            return True
        return obj.stock_actual > 0


class ProductoCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para creación de productos
    """
    
    proveedores_data = ProductoProveedorSerializer(many=True, required=False)
    
    class Meta:
        model = Producto
        fields = [
            'codigo', 'nombre', 'descripcion', 'tipo_producto', 'categoria',
            'codigo_barras', 'codigo_interno', 'precio_compra', 'precio_venta',
            'stock_actual', 'stock_minimo', 'stock_maximo', 'punto_reorden',
            'unidad_medida', 'permite_venta', 'permite_compra', 'controla_stock',
            'permite_descuento', 'descuento_maximo', 'marca', 'modelo',
            'proveedores_data'
        ]
    
    @transaction.atomic
    def create(self, validated_data):
        """Crear producto con proveedores"""
        proveedores_data = validated_data.pop('proveedores_data', [])
        
        producto = Producto.objects.create(**validated_data)
        
        # Crear proveedores
        for proveedor_data in proveedores_data:
            ProductoProveedor.objects.create(producto=producto, **proveedor_data)
        
        return producto


class ProductoBusquedaSerializer(serializers.Serializer):
    """
    Serializer para búsqueda avanzada de productos
    """
    
    termino = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Término de búsqueda (código, nombre, código de barras)"
    )
    
    tipo_producto = serializers.IntegerField(
        required=False,
        help_text="ID del tipo de producto"
    )
    
    categoria = serializers.IntegerField(
        required=False,
        help_text="ID de la categoría"
    )
    
    marca = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Filtrar por marca"
    )
    
    permite_venta = serializers.BooleanField(
        required=False,
        help_text="Filtrar productos que permiten venta"
    )
    
    controla_stock = serializers.BooleanField(
        required=False,
        help_text="Filtrar productos que controlan stock"
    )
    
    estado_stock = serializers.ChoiceField(
        choices=[
            ('agotado', 'Agotado'),
            ('critico', 'Crítico'),
            ('bajo', 'Bajo'),
            ('normal', 'Normal'),
            ('exceso', 'Exceso'),
        ],
        required=False,
        help_text="Filtrar por estado de stock"
    )
    
    precio_minimo = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        help_text="Precio mínimo de venta"
    )
    
    precio_maximo = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        help_text="Precio máximo de venta"
    )
    
    con_vencimiento = serializers.BooleanField(
        required=False,
        help_text="Filtrar productos con fecha de vencimiento"
    )
    
    sin_movimiento_dias = serializers.IntegerField(
        required=False,
        help_text="Productos sin movimiento por X días"
    )


class EstadisticasProductoSerializer(serializers.Serializer):
    """
    Serializer para estadísticas de productos
    """
    
    total_productos = serializers.IntegerField()
    productos_activos = serializers.IntegerField()
    productos_agotados = serializers.IntegerField()
    productos_criticos = serializers.IntegerField()
    productos_sin_movimiento = serializers.IntegerField()
    
    valor_total_inventario = serializers.DecimalField(max_digits=15, decimal_places=2)
    productos_mas_vendidos = ProductoListSerializer(many=True)
    productos_menos_vendidos = ProductoListSerializer(many=True)
    
    por_categoria = serializers.DictField()
    por_tipo_producto = serializers.DictField()
    por_marca = serializers.DictField()
    
    rotacion_promedio = serializers.DecimalField(max_digits=8, decimal_places=2)
    margen_promedio = serializers.DecimalField(max_digits=5, decimal_places=2)


class MovimientoStockSerializer(serializers.Serializer):
    """
    Serializer para movimientos de stock
    """
    
    producto = serializers.IntegerField(help_text="ID del producto")
    cantidad = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        help_text="Cantidad del movimiento"
    )
    tipo_movimiento = serializers.ChoiceField(
        choices=[
            ('entrada', 'Entrada'),
            ('salida', 'Salida'),
            ('ajuste', 'Ajuste'),
        ],
        help_text="Tipo de movimiento"
    )
    motivo = serializers.CharField(
        max_length=200,
        help_text="Motivo del movimiento"
    )
    costo_unitario = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        required=False,
        help_text="Costo unitario (para entradas)"
    )
    
    def validate_cantidad(self, value):
        """Validar cantidad positiva"""
        if value <= 0:
            raise serializers.ValidationError("Cantidad debe ser mayor a 0")
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        tipo_movimiento = data.get('tipo_movimiento')
        costo_unitario = data.get('costo_unitario')
        
        if tipo_movimiento == 'entrada' and not costo_unitario:
            raise serializers.ValidationError({
                'costo_unitario': 'Costo unitario es requerido para entradas'
            })
        
        if costo_unitario and costo_unitario < 0:
            raise serializers.ValidationError({
                'costo_unitario': 'Costo unitario no puede ser negativo'
            })
        
        return data