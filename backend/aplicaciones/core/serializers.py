"""
Serializers de la aplicación Core - FELICITAFAC
Sistema de Facturación Electrónica para Perú
"""

from rest_framework import serializers
from .models import Empresa, Sucursal, ConfiguracionSistema


class EmpresaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Empresa
    """
    
    class Meta:
        model = Empresa
        fields = [
            'id', 'ruc', 'razon_social', 'nombre_comercial',
            'direccion', 'ubigeo', 'departamento', 'provincia', 'distrito',
            'telefono', 'email', 'web',
            'logo', 'pie_pagina', 'moneda_defecto', 'igv_tasa',
            'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def validate_ruc(self, value):
        """Validar formato de RUC"""
        if len(value) != 11 or not value.isdigit():
            raise serializers.ValidationError("El RUC debe tener exactamente 11 dígitos")
        return value
    
    def validate_ubigeo(self, value):
        """Validar formato de ubigeo"""
        if len(value) != 6 or not value.isdigit():
            raise serializers.ValidationError("El ubigeo debe tener exactamente 6 dígitos")
        return value


class SucursalSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Sucursal
    """
    empresa_nombre = serializers.CharField(source='empresa.razon_social', read_only=True)
    
    class Meta:
        model = Sucursal
        fields = [
            'id', 'empresa', 'empresa_nombre', 'codigo', 'nombre', 'direccion',
            'telefono', 'email', 'es_principal',
            'serie_factura', 'serie_boleta', 'serie_nota_credito', 'serie_nota_debito',
            'contador_factura', 'contador_boleta', 'contador_nota_credito', 'contador_nota_debito',
            'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def validate_codigo(self, value):
        """Validar código único por empresa"""
        empresa = self.initial_data.get('empresa')
        if empresa:
            existing = Sucursal.objects.filter(
                empresa_id=empresa, 
                codigo=value,
                activo=True
            ).exclude(pk=self.instance.pk if self.instance else None)
            
            if existing.exists():
                raise serializers.ValidationError("Ya existe una sucursal con este código en la empresa")
        return value


class ConfiguracionSistemaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo ConfiguracionSistema
    """
    valor_convertido = serializers.SerializerMethodField()
    
    class Meta:
        model = ConfiguracionSistema
        fields = [
            'id', 'clave', 'valor', 'valor_convertido', 'descripcion', 'tipo_dato',
            'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def get_valor_convertido(self, obj):
        """Obtener valor convertido según tipo de dato"""
        try:
            return obj.obtener_valor()
        except:
            return obj.valor
    
    def validate_clave(self, value):
        """Validar clave única"""
        existing = ConfiguracionSistema.objects.filter(
            clave=value,
            activo=True
        ).exclude(pk=self.instance.pk if self.instance else None)
        
        if existing.exists():
            raise serializers.ValidationError("Ya existe una configuración con esta clave")
        return value
    
    def validate(self, data):
        """Validar valor según tipo de dato"""
        tipo_dato = data.get('tipo_dato', 'string')
        valor = data.get('valor', '')
        
        if tipo_dato == 'integer':
            try:
                int(valor)
            except ValueError:
                raise serializers.ValidationError({
                    'valor': 'El valor debe ser un número entero válido'
                })
        
        elif tipo_dato == 'decimal':
            try:
                float(valor)
            except ValueError:
                raise serializers.ValidationError({
                    'valor': 'El valor debe ser un número decimal válido'
                })
        
        elif tipo_dato == 'boolean':
            if valor.lower() not in ['true', 'false', '1', '0', 'yes', 'no', 'sí']:
                raise serializers.ValidationError({
                    'valor': 'El valor debe ser un booleano válido (true/false)'
                })
        
        elif tipo_dato == 'json':
            import json
            try:
                json.loads(valor)
            except json.JSONDecodeError:
                raise serializers.ValidationError({
                    'valor': 'El valor debe ser un JSON válido'
                })
        
        return data


class SucursalBasicaSerializer(serializers.ModelSerializer):
    """
    Serializer básico para Sucursal (para listados)
    """
    
    class Meta:
        model = Sucursal
        fields = ['id', 'codigo', 'nombre', 'es_principal']


class EmpresaBasicaSerializer(serializers.ModelSerializer):
    """
    Serializer básico para Empresa (para listados)
    """
    sucursales = SucursalBasicaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Empresa
        fields = ['id', 'ruc', 'razon_social', 'nombre_comercial', 'sucursales']