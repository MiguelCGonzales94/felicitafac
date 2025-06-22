"""
Serializers de Inventario - FELICITAFAC
Sistema PEPS optimizado para MySQL
"""

from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import (
    TipoMovimiento, Almacen, StockProducto, LoteProducto,
    MovimientoInventario, DetalleMovimiento
)


class TipoMovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoMovimiento
        fields = ['id', 'codigo', 'nombre', 'tipo', 'categoria', 'afecta_costo',
                 'requiere_autorizacion', 'genera_documento', 'activo']


class AlmacenSerializer(serializers.ModelSerializer):
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)
    responsable_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Almacen
        fields = ['id', 'codigo', 'nombre', 'sucursal', 'sucursal_nombre',
                 'responsable', 'responsable_nombre', 'es_principal', 'activo']
    
    def get_responsable_nombre(self, obj):
        if obj.responsable:
            return f"{obj.responsable.nombres} {obj.responsable.apellidos}"
        return None


class StockProductoSerializer(serializers.ModelSerializer):
    producto_info = serializers.SerializerMethodField()
    almacen_nombre = serializers.CharField(source='almacen.nombre', read_only=True)
    
    class Meta:
        model = StockProducto
        fields = ['id', 'producto', 'producto_info', 'almacen', 'almacen_nombre',
                 'cantidad_actual', 'cantidad_disponible', 'costo_promedio',
                 'valor_inventario', 'fecha_ultimo_movimiento']
    
    def get_producto_info(self, obj):
        return {
            'codigo': obj.producto.codigo,
            'nombre': obj.producto.nombre,
            'stock_minimo': float(obj.producto.stock_minimo)
        }


class LoteProductoSerializer(serializers.ModelSerializer):
    producto_codigo = serializers.CharField(source='producto.codigo', read_only=True)
    almacen_nombre = serializers.CharField(source='almacen.nombre', read_only=True)
    dias_vencimiento = serializers.SerializerMethodField()
    
    class Meta:
        model = LoteProducto
        fields = ['id', 'producto', 'producto_codigo', 'almacen', 'almacen_nombre',
                 'numero_lote', 'fecha_ingreso', 'fecha_vencimiento', 'dias_vencimiento',
                 'cantidad_inicial', 'cantidad_actual', 'costo_unitario', 'estado_calidad']
    
    def get_dias_vencimiento(self, obj):
        return obj.dias_hasta_vencimiento()


class DetalleMovimientoSerializer(serializers.ModelSerializer):
    producto_info = serializers.SerializerMethodField()
    
    class Meta:
        model = DetalleMovimiento
        fields = ['id', 'numero_item', 'producto', 'producto_info', 'cantidad',
                 'costo_unitario', 'valor_total', 'lote', 'ejecutado']
    
    def get_producto_info(self, obj):
        return {
            'codigo': obj.producto.codigo,
            'nombre': obj.producto.nombre
        }


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    tipo_movimiento_info = TipoMovimientoSerializer(source='tipo_movimiento', read_only=True)
    almacen_nombre = serializers.CharField(source='almacen.nombre', read_only=True)
    usuario_nombre = serializers.SerializerMethodField()
    detalles = DetalleMovimientoSerializer(many=True, read_only=True)
    
    class Meta:
        model = MovimientoInventario
        fields = ['id', 'uuid', 'numero', 'tipo_movimiento', 'tipo_movimiento_info',
                 'almacen', 'almacen_nombre', 'fecha_movimiento', 'estado',
                 'usuario_creacion', 'usuario_nombre', 'total_items', 'total_cantidad',
                 'total_valor', 'observaciones', 'detalles']
        read_only_fields = ['uuid', 'numero', 'total_items', 'total_cantidad', 'total_valor']
    
    def get_usuario_nombre(self, obj):
        if obj.usuario_creacion:
            return f"{obj.usuario_creacion.nombres} {obj.usuario_creacion.apellidos}"
        return None


class MovimientoCreateSerializer(serializers.ModelSerializer):
    detalles_data = DetalleMovimientoSerializer(many=True, write_only=True)
    
    class Meta:
        model = MovimientoInventario
        fields = ['tipo_movimiento', 'almacen', 'fecha_movimiento', 'observaciones',
                 'motivo', 'detalles_data']
    
    def validate_detalles_data(self, value):
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un detalle")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles_data')
        usuario = self.context['request'].user
        
        movimiento = MovimientoInventario.objects.create(
            usuario_creacion=usuario,
            **validated_data
        )
        
        for i, detalle_data in enumerate(detalles_data, 1):
            DetalleMovimiento.objects.create(
                movimiento=movimiento,
                numero_item=i,
                **detalle_data
            )
        
        return movimiento


class ReporteInventarioSerializer(serializers.Serializer):
    total_productos = serializers.IntegerField()
    valor_total_inventario = serializers.DecimalField(max_digits=15, decimal_places=2)
    productos_agotados = serializers.IntegerField()
    productos_criticos = serializers.IntegerField()
    movimientos_mes = serializers.IntegerField()
    
    top_productos_stock = StockProductoSerializer(many=True)
    productos_vencimiento_proximo = LoteProductoSerializer(many=True)
    
    por_almacen = serializers.DictField()
    por_categoria = serializers.DictField()