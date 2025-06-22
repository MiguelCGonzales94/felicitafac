"""
Serializers de Clientes - FELICITAFAC
Sistema de Facturación Electrónica para Perú
API REST con validaciones específicas para SUNAT
"""

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.core.exceptions import ValidationError
from django.db import transaction
from decimal import Decimal
import re
from .models import TipoDocumento, Cliente, ContactoCliente


class TipoDocumentoSerializer(serializers.ModelSerializer):
    """
    Serializer para tipos de documentos de identidad
    """
    
    class Meta:
        model = TipoDocumento
        fields = [
            'id', 'codigo', 'nombre', 'longitud_minima', 'longitud_maxima',
            'solo_numeros', 'requiere_validacion', 'activo',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def validate_codigo(self, value):
        """Validar código SUNAT"""
        codigos_validos = ['1', '4', '6', '7', '11', '12', '0']
        if value not in codigos_validos:
            raise serializers.ValidationError(
                f"Código debe ser uno de: {', '.join(codigos_validos)}"
            )
        return value


class ContactoClienteSerializer(serializers.ModelSerializer):
    """
    Serializer para contactos de clientes
    """
    nombre_completo = serializers.ReadOnlyField(source='obtener_nombre_completo')
    
    class Meta:
        model = ContactoCliente
        fields = [
            'id', 'nombres', 'apellidos', 'nombre_completo', 'cargo',
            'email', 'telefono', 'es_principal', 'recibe_facturas',
            'notas', 'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def validate_email(self, value):
        """Validar formato de email"""
        if value and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError("Formato de email inválido")
        return value
    
    def validate_telefono(self, value):
        """Validar formato de teléfono"""
        if value and not re.match(r'^(\+51)?[0-9]{9,12}$', value):
            raise serializers.ValidationError("Formato de teléfono inválido para Perú")
        return value


class ClienteSerializer(serializers.ModelSerializer):
    """
    Serializer principal para clientes
    Incluye validaciones específicas para documentos peruanos
    """
    
    # Campos relacionados
    tipo_documento_info = TipoDocumentoSerializer(source='tipo_documento', read_only=True)
    contactos = ContactoClienteSerializer(many=True, read_only=True)
    
    # Campos calculados
    nombre_completo = serializers.ReadOnlyField(source='obtener_nombre_completo')
    datos_facturacion = serializers.ReadOnlyField(source='obtener_datos_facturacion')
    puede_comprar_info = serializers.SerializerMethodField()
    
    # Estadísticas
    promedio_compra = serializers.SerializerMethodField()
    dias_desde_ultima_compra = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = [
            # Campos básicos
            'id', 'uuid', 'tipo_cliente', 'tipo_documento', 'tipo_documento_info',
            'numero_documento', 'razon_social', 'nombre_comercial', 'nombre_completo',
            
            # Contacto
            'email', 'telefono', 'celular',
            
            # Dirección
            'direccion', 'ubigeo', 'departamento', 'provincia', 'distrito',
            
            # Configuración comercial
            'descuento_maximo', 'credito_limite', 'dias_credito',
            'es_agente_retencion', 'es_buen_contribuyente',
            
            # Control
            'bloqueado', 'motivo_bloqueo',
            
            # Estadísticas
            'fecha_primer_compra', 'fecha_ultima_compra', 'total_compras',
            'numero_compras', 'promedio_compra', 'dias_desde_ultima_compra',
            
            # Validación SUNAT
            'validado_sunat', 'fecha_validacion_sunat', 'estado_sunat',
            'condicion_sunat',
            
            # Relacionados
            'contactos', 'datos_facturacion', 'puede_comprar_info',
            
            # Auditoría
            'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = [
            'uuid', 'fecha_primer_compra', 'fecha_ultima_compra',
            'total_compras', 'numero_compras', 'validado_sunat',
            'fecha_validacion_sunat', 'estado_sunat', 'condicion_sunat',
            'fecha_creacion', 'fecha_actualizacion'
        ]
        
        validators = [
            UniqueTogetherValidator(
                queryset=Cliente.objects.all(),
                fields=['tipo_documento', 'numero_documento'],
                message="Ya existe un cliente con este tipo y número de documento"
            )
        ]
    
    def get_puede_comprar_info(self, obj):
        """Información sobre si el cliente puede comprar"""
        puede, motivo = obj.puede_comprar()
        return {
            'puede_comprar': puede,
            'motivo': motivo
        }
    
    def get_promedio_compra(self, obj):
        """Calcula el promedio de compra del cliente"""
        if obj.numero_compras > 0:
            return float(obj.total_compras / obj.numero_compras)
        return 0.0
    
    def get_dias_desde_ultima_compra(self, obj):
        """Calcula días desde la última compra"""
        if obj.fecha_ultima_compra:
            from django.utils import timezone
            delta = timezone.now() - obj.fecha_ultima_compra
            return delta.days
        return None
    
    def validate_numero_documento(self, value):
        """Validar número de documento según tipo"""
        # Validación básica de formato
        if not value.strip():
            raise serializers.ValidationError("Número de documento es requerido")
        
        # Solo números para la mayoría de documentos
        if not re.match(r'^[0-9]+$', value):
            # Permitir algunos caracteres especiales para pasaportes
            if not re.match(r'^[A-Z0-9-]+$', value):
                raise serializers.ValidationError("Formato de documento inválido")
        
        return value.strip().upper()
    
    def validate_razon_social(self, value):
        """Validar razón social"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Razón social debe tener al menos 3 caracteres"
            )
        
        # Caracteres válidos
        if not re.match(r'^[A-Za-z0-9\s\.\,\-\&\'\"]+$', value):
            raise serializers.ValidationError(
                "Razón social contiene caracteres no válidos"
            )
        
        return value.strip().upper()
    
    def validate_email(self, value):
        """Validar formato de email"""
        if value and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError("Formato de email inválido")
        return value.lower() if value else value
    
    def validate_telefono(self, value):
        """Validar formato de teléfono"""
        if value and not re.match(r'^(\+51)?[0-9]{9,12}$', value):
            raise serializers.ValidationError("Formato de teléfono inválido para Perú")
        return value
    
    def validate_celular(self, value):
        """Validar formato de celular"""
        if value and not re.match(r'^(\+51)?[0-9]{9,12}$', value):
            raise serializers.ValidationError("Formato de celular inválido para Perú")
        return value
    
    def validate_ubigeo(self, value):
        """Validar código de ubigeo"""
        if not re.match(r'^\d{6}$', value):
            raise serializers.ValidationError("Ubigeo debe tener exactamente 6 dígitos")
        return value
    
    def validate_descuento_maximo(self, value):
        """Validar descuento máximo"""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Descuento máximo debe estar entre 0 y 100"
            )
        return value
    
    def validate_credito_limite(self, value):
        """Validar límite de crédito"""
        if value < 0:
            raise serializers.ValidationError(
                "Límite de crédito no puede ser negativo"
            )
        return value
    
    def validate_dias_credito(self, value):
        """Validar días de crédito"""
        if value < 0 or value > 365:
            raise serializers.ValidationError(
                "Días de crédito debe estar entre 0 y 365"
            )
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        # Validar documento según tipo
        tipo_documento = data.get('tipo_documento')
        numero_documento = data.get('numero_documento')
        
        if tipo_documento and numero_documento:
            if not self._validar_documento_por_tipo(tipo_documento, numero_documento):
                raise serializers.ValidationError({
                    'numero_documento': f'Documento inválido para tipo {tipo_documento.nombre}'
                })
        
        # Validar tipo de cliente vs tipo de documento
        tipo_cliente = data.get('tipo_cliente')
        if tipo_documento and tipo_cliente:
            if tipo_documento.codigo == '6' and tipo_cliente != 'persona_juridica':
                data['tipo_cliente'] = 'persona_juridica'  # Auto-corregir
            elif tipo_documento.codigo in ['1', '4', '7'] and tipo_cliente == 'persona_juridica':
                raise serializers.ValidationError({
                    'tipo_cliente': 'Persona jurídica requiere RUC (tipo documento 6)'
                })
        
        return data
    
    def _validar_documento_por_tipo(self, tipo_documento, numero_documento):
        """Validar documento según tipo específico"""
        if tipo_documento.codigo == '1':  # DNI
            return self._validar_dni(numero_documento)
        elif tipo_documento.codigo == '6':  # RUC
            return self._validar_ruc(numero_documento)
        elif tipo_documento.codigo == '4':  # Carnet Extranjería
            return len(numero_documento) >= 8 and len(numero_documento) <= 12
        elif tipo_documento.codigo == '7':  # Pasaporte
            return len(numero_documento) >= 6 and len(numero_documento) <= 12
        else:
            return True  # Otros tipos no tienen validación específica
    
    def _validar_dni(self, dni):
        """Validar DNI peruano"""
        if len(dni) != 8 or not dni.isdigit():
            return False
        
        # Validar que no sea un DNI inválido conocido
        dnis_invalidos = ['00000000', '11111111', '22222222', '33333333', 
                         '44444444', '55555555', '66666666', '77777777', 
                         '88888888', '99999999', '12345678', '87654321']
        
        return dni not in dnis_invalidos
    
    def _validar_ruc(self, ruc):
        """Validar RUC peruano con algoritmo"""
        if len(ruc) != 11 or not ruc.isdigit():
            return False
        
        # Validar tipo de RUC (primeros 2 dígitos)
        tipo_ruc = ruc[:2]
        tipos_validos = ['10', '15', '17', '20']  # Personas naturales y jurídicas
        if tipo_ruc not in tipos_validos:
            return False
        
        # Algoritmo de validación del dígito verificador
        factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
        suma = sum(int(ruc[i]) * factores[i] for i in range(10))
        resto = suma % 11
        digito_verificador = 11 - resto if resto > 1 else resto
        
        return int(ruc[10]) == digito_verificador
    
    @transaction.atomic
    def create(self, validated_data):
        """Crear cliente con validaciones adicionales"""
        # Normalizar datos
        validated_data['razon_social'] = validated_data['razon_social'].upper()
        if validated_data.get('nombre_comercial'):
            validated_data['nombre_comercial'] = validated_data['nombre_comercial'].upper()
        
        cliente = super().create(validated_data)
        
        # Crear contacto principal automáticamente si no existe
        if not ContactoCliente.objects.filter(cliente=cliente, es_principal=True).exists():
            nombres, apellidos = self._separar_nombres(cliente.razon_social)
            ContactoCliente.objects.create(
                cliente=cliente,
                nombres=nombres,
                apellidos=apellidos,
                email=cliente.email,
                telefono=cliente.telefono or cliente.celular,
                es_principal=True,
                recibe_facturas=True
            )
        
        return cliente
    
    def _separar_nombres(self, razon_social):
        """Separar nombres y apellidos de razón social"""
        partes = razon_social.split()
        if len(partes) >= 2:
            nombres = ' '.join(partes[:len(partes)//2])
            apellidos = ' '.join(partes[len(partes)//2:])
        else:
            nombres = razon_social
            apellidos = ''
        
        return nombres, apellidos


class ClienteListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de clientes
    Optimizado para performance en listados grandes
    """
    
    tipo_documento_nombre = serializers.CharField(source='tipo_documento.nombre', read_only=True)
    nombre_completo = serializers.ReadOnlyField(source='obtener_nombre_completo')
    estado_comercial = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = [
            'id', 'tipo_cliente', 'tipo_documento_nombre', 'numero_documento',
            'razon_social', 'nombre_comercial', 'nombre_completo', 'email',
            'telefono', 'total_compras', 'numero_compras', 'bloqueado',
            'estado_comercial', 'activo', 'fecha_creacion'
        ]
    
    def get_estado_comercial(self, obj):
        """Estado comercial simplificado"""
        if not obj.activo:
            return 'INACTIVO'
        elif obj.bloqueado:
            return 'BLOQUEADO'
        elif obj.total_compras > 0:
            return 'ACTIVO'
        else:
            return 'NUEVO'


class ClienteCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para creación de clientes
    Incluye validaciones más estrictas
    """
    
    contacto_principal = ContactoClienteSerializer(required=False)
    
    class Meta:
        model = Cliente
        fields = [
            'tipo_cliente', 'tipo_documento', 'numero_documento',
            'razon_social', 'nombre_comercial', 'email', 'telefono', 'celular',
            'direccion', 'ubigeo', 'departamento', 'provincia', 'distrito',
            'descuento_maximo', 'credito_limite', 'dias_credito',
            'es_agente_retencion', 'es_buen_contribuyente',
            'contacto_principal'
        ]
    
    def validate(self, data):
        """Validaciones específicas para creación"""
        data = super().validate(data)
        
        # Validar que no exista cliente con mismo documento
        tipo_documento = data.get('tipo_documento')
        numero_documento = data.get('numero_documento')
        
        if Cliente.objects.filter(
            tipo_documento=tipo_documento,
            numero_documento=numero_documento,
            activo=True
        ).exists():
            raise serializers.ValidationError(
                "Ya existe un cliente activo con este documento"
            )
        
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        """Crear cliente con contacto principal"""
        contacto_data = validated_data.pop('contacto_principal', None)
        
        cliente = Cliente.objects.create(**validated_data)
        
        # Crear contacto principal si se proporcionó
        if contacto_data:
            contacto_data['es_principal'] = True
            ContactoCliente.objects.create(cliente=cliente, **contacto_data)
        
        return cliente


class ClienteUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para actualizaciones de clientes
    No permite cambiar documento de identidad
    """
    
    class Meta:
        model = Cliente
        fields = [
            'razon_social', 'nombre_comercial', 'email', 'telefono', 'celular',
            'direccion', 'ubigeo', 'departamento', 'provincia', 'distrito',
            'descuento_maximo', 'credito_limite', 'dias_credito',
            'es_agente_retencion', 'es_buen_contribuyente',
            'bloqueado', 'motivo_bloqueo'
        ]
    
    def validate(self, data):
        """Validaciones para actualización"""
        # No permitir cambio de documento
        if 'tipo_documento' in data or 'numero_documento' in data:
            raise serializers.ValidationError(
                "No se puede cambiar el tipo o número de documento"
            )
        
        return data


class ClienteBusquedaSerializer(serializers.Serializer):
    """
    Serializer para búsqueda avanzada de clientes
    """
    
    termino = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Término de búsqueda (nombre, documento, email)"
    )
    
    tipo_cliente = serializers.ChoiceField(
        choices=Cliente.TIPOS_CLIENTE,
        required=False,
        help_text="Filtrar por tipo de cliente"
    )
    
    tipo_documento = serializers.IntegerField(
        required=False,
        help_text="ID del tipo de documento"
    )
    
    departamento = serializers.CharField(
        max_length=50,
        required=False,
        help_text="Filtrar por departamento"
    )
    
    provincia = serializers.CharField(
        max_length=50,
        required=False,
        help_text="Filtrar por provincia"
    )
    
    bloqueado = serializers.BooleanField(
        required=False,
        help_text="Filtrar por estado de bloqueo"
    )
    
    con_credito = serializers.BooleanField(
        required=False,
        help_text="Filtrar clientes con límite de crédito"
    )
    
    fecha_creacion_desde = serializers.DateField(
        required=False,
        help_text="Fecha de creación desde"
    )
    
    fecha_creacion_hasta = serializers.DateField(
        required=False,
        help_text="Fecha de creación hasta"
    )
    
    total_compras_minimo = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        help_text="Total mínimo de compras"
    )
    
    def validate(self, data):
        """Validar criterios de búsqueda"""
        fecha_desde = data.get('fecha_creacion_desde')
        fecha_hasta = data.get('fecha_creacion_hasta')
        
        if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
            raise serializers.ValidationError(
                "La fecha desde no puede ser mayor a la fecha hasta"
            )
        
        return data


class EstadisticasClienteSerializer(serializers.Serializer):
    """
    Serializer para estadísticas de clientes
    """
    
    total_clientes = serializers.IntegerField()
    clientes_activos = serializers.IntegerField()
    clientes_bloqueados = serializers.IntegerField()
    clientes_con_compras = serializers.IntegerField()
    
    por_tipo_cliente = serializers.DictField()
    por_tipo_documento = serializers.DictField()
    por_departamento = serializers.DictField()
    
    total_compras_general = serializers.DecimalField(max_digits=15, decimal_places=2)
    promedio_compras_cliente = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    clientes_nuevos_mes = serializers.IntegerField()
    clientes_con_credito = serializers.IntegerField()
    
    top_clientes = ClienteListSerializer(many=True)