"""
Serializers de Facturación - FELICITAFAC
Sistema de Facturación Electrónica para Perú
API REST para documentos electrónicos según normativa SUNAT
"""

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import re
from .models import (
    TipoDocumentoElectronico, SerieDocumento, DocumentoElectronico,
    DetalleDocumento, FormaPago, PagoDocumento
)


class TipoDocumentoElectronicoSerializer(serializers.ModelSerializer):
    """
    Serializer para tipos de documentos electrónicos SUNAT
    """
    
    cantidad_documentos = serializers.SerializerMethodField()
    
    class Meta:
        model = TipoDocumentoElectronico
        fields = [
            'id', 'codigo_sunat', 'nombre', 'nomenclatura',
            'requiere_cliente_ruc', 'permite_exportacion', 'afecta_inventario',
            'afecta_cuentas_cobrar', 'requiere_referencia', 'serie_defecto',
            'cantidad_documentos', 'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def get_cantidad_documentos(self, obj):
        """Cuenta documentos de este tipo"""
        return obj.documentos.filter(activo=True).count()
    
    def validate_codigo_sunat(self, value):
        """Validar código SUNAT"""
        codigos_validos = ['01', '03', '07', '08', '09', '12', '13', '14', '20', '40']
        if value not in codigos_validos:
            raise serializers.ValidationError(
                f"Código SUNAT debe ser uno de: {', '.join(codigos_validos)}"
            )
        return value
    
    def validate_serie_defecto(self, value):
        """Validar formato de serie"""
        if not re.match(r'^[A-Z0-9]{4}$', value):
            raise serializers.ValidationError(
                "Serie debe tener exactamente 4 caracteres alfanuméricos"
            )
        return value.upper()


class SerieDocumentoSerializer(serializers.ModelSerializer):
    """
    Serializer para series de documentos
    """
    
    sucursal_nombre = serializers.CharField(source='sucursal.nombre', read_only=True)
    tipo_documento_nombre = serializers.CharField(source='tipo_documento.nombre', read_only=True)
    documentos_emitidos = serializers.SerializerMethodField()
    siguiente_numero = serializers.SerializerMethodField()
    
    class Meta:
        model = SerieDocumento
        fields = [
            'id', 'sucursal', 'sucursal_nombre', 'tipo_documento',
            'tipo_documento_nombre', 'serie', 'numero_actual', 'numero_maximo',
            'es_predeterminada', 'documentos_emitidos', 'siguiente_numero',
            'observaciones', 'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['documentos_emitidos', 'siguiente_numero', 'fecha_creacion', 'fecha_actualizacion']
        
        validators = [
            UniqueTogetherValidator(
                queryset=SerieDocumento.objects.all(),
                fields=['sucursal', 'tipo_documento', 'serie'],
                message="Ya existe una serie con esta combinación"
            )
        ]
    
    def get_documentos_emitidos(self, obj):
        """Cantidad de documentos emitidos con esta serie"""
        return obj.documentos.filter(activo=True).count()
    
    def get_siguiente_numero(self, obj):
        """Siguiente número disponible"""
        try:
            return obj.obtener_siguiente_numero()
        except ValidationError:
            return None
    
    def validate_serie(self, value):
        """Validar formato de serie"""
        if not re.match(r'^[A-Z0-9]{4}$', value):
            raise serializers.ValidationError(
                "Serie debe tener exactamente 4 caracteres alfanuméricos"
            )
        return value.upper()
    
    def validate_numero_actual(self, value):
        """Validar número actual"""
        if value < 0:
            raise serializers.ValidationError("Número actual no puede ser negativo")
        return value
    
    def validate_numero_maximo(self, value):
        """Validar número máximo"""
        if value <= 0 or value > 99999999:
            raise serializers.ValidationError(
                "Número máximo debe estar entre 1 y 99,999,999"
            )
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        numero_actual = data.get('numero_actual', 0)
        numero_maximo = data.get('numero_maximo')
        
        if numero_maximo and numero_actual >= numero_maximo:
            raise serializers.ValidationError({
                'numero_actual': 'Número actual no puede ser mayor o igual al número máximo'
            })
        
        return data


class FormaPagoSerializer(serializers.ModelSerializer):
    """
    Serializer para formas de pago
    """
    
    class Meta:
        model = FormaPago
        fields = [
            'id', 'codigo', 'nombre', 'tipo', 'requiere_referencia',
            'es_credito', 'dias_credito_defecto', 'cuenta_contable',
            'orden', 'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def validate_codigo(self, value):
        """Validar código único"""
        if not re.match(r'^[A-Z0-9_]{2,20}$', value):
            raise serializers.ValidationError(
                "Código debe tener 2-20 caracteres alfanuméricos y guiones bajos"
            )
        return value.upper()
    
    def validate_dias_credito_defecto(self, value):
        """Validar días de crédito"""
        if value < 0 or value > 365:
            raise serializers.ValidationError(
                "Días de crédito debe estar entre 0 y 365"
            )
        return value


class PagoDocumentoSerializer(serializers.ModelSerializer):
    """
    Serializer para pagos de documentos
    """
    
    forma_pago_info = FormaPagoSerializer(source='forma_pago', read_only=True)
    
    class Meta:
        model = PagoDocumento
        fields = [
            'id', 'forma_pago', 'forma_pago_info', 'monto', 'referencia',
            'fecha_pago', 'observaciones', 'activo'
        ]
        read_only_fields = ['activo']
    
    def validate_monto(self, value):
        """Validar monto positivo"""
        if value <= 0:
            raise serializers.ValidationError("Monto debe ser mayor a 0")
        return value
    
    def validate_referencia(self, value):
        """Validar referencia si es requerida"""
        forma_pago = self.initial_data.get('forma_pago')
        if forma_pago:
            try:
                forma_pago_obj = FormaPago.objects.get(id=forma_pago)
                if forma_pago_obj.requiere_referencia and not value:
                    raise serializers.ValidationError(
                        f"Referencia es requerida para {forma_pago_obj.nombre}"
                    )
            except FormaPago.DoesNotExist:
                pass
        
        return value


class DetalleDocumentoSerializer(serializers.ModelSerializer):
    """
    Serializer para detalles de documentos electrónicos
    """
    
    producto_info = serializers.SerializerMethodField()
    
    class Meta:
        model = DetalleDocumento
        fields = [
            'id', 'numero_item', 'producto', 'producto_info',
            'codigo_producto', 'descripcion', 'unidad_medida',
            'cantidad', 'precio_unitario', 'precio_unitario_con_igv',
            'descuento_porcentaje', 'descuento', 'subtotal',
            'base_imponible', 'igv', 'total_item',
            'tipo_afectacion_igv', 'codigo_tributo', 'porcentaje_igv',
            'es_gratuito', 'lote', 'fecha_vencimiento_producto',
            'observaciones', 'activo'
        ]
        read_only_fields = [
            'precio_unitario_con_igv', 'descuento', 'subtotal',
            'base_imponible', 'igv', 'total_item', 'activo'
        ]
    
    def get_producto_info(self, obj):
        """Información básica del producto"""
        if obj.producto:
            return {
                'codigo': obj.producto.codigo,
                'nombre': obj.producto.nombre,
                'stock_actual': float(obj.producto.stock_actual),
                'controla_stock': obj.producto.controla_stock
            }
        return None
    
    def validate_cantidad(self, value):
        """Validar cantidad positiva"""
        if value <= 0:
            raise serializers.ValidationError("Cantidad debe ser mayor a 0")
        return value
    
    def validate_precio_unitario(self, value):
        """Validar precio unitario"""
        if value < 0:
            raise serializers.ValidationError("Precio unitario no puede ser negativo")
        return value
    
    def validate_descuento_porcentaje(self, value):
        """Validar porcentaje de descuento"""
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Descuento debe estar entre 0% y 100%"
            )
        return value
    
    def validate_porcentaje_igv(self, value):
        """Validar porcentaje de IGV"""
        if value < 0 or value > 30:  # IGV máximo 30%
            raise serializers.ValidationError(
                "Porcentaje IGV debe estar entre 0% y 30%"
            )
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        producto = data.get('producto')
        cantidad = data.get('cantidad')
        precio_unitario = data.get('precio_unitario', 0)
        es_gratuito = data.get('es_gratuito', False)
        
        # Validar disponibilidad de stock
        if producto and cantidad:
            if producto.controla_stock:
                disponible, mensaje = producto.esta_disponible(cantidad)
                if not disponible:
                    raise serializers.ValidationError({
                        'cantidad': f'Stock insuficiente: {mensaje}'
                    })
        
        # Validar precio gratuito
        if es_gratuito and precio_unitario > 0:
            raise serializers.ValidationError({
                'precio_unitario': 'Precio debe ser 0 para items gratuitos'
            })
        
        # Validar descuento vs precio
        descuento_porcentaje = data.get('descuento_porcentaje', 0)
        if producto and descuento_porcentaje > 0:
            if not producto.permite_descuento:
                raise serializers.ValidationError({
                    'descuento_porcentaje': 'Este producto no permite descuentos'
                })
            
            if descuento_porcentaje > producto.descuento_maximo:
                raise serializers.ValidationError({
                    'descuento_porcentaje': f'Descuento máximo permitido: {producto.descuento_maximo}%'
                })
        
        return data


class DocumentoElectronicoSerializer(serializers.ModelSerializer):
    """
    Serializer principal para documentos electrónicos
    """
    
    # Información relacionada
    tipo_documento_info = TipoDocumentoElectronicoSerializer(source='tipo_documento', read_only=True)
    serie_documento_info = SerieDocumentoSerializer(source='serie_documento', read_only=True)
    cliente_info = serializers.SerializerMethodField()
    vendedor_info = serializers.SerializerMethodField()
    
    # Detalles y pagos
    detalles = DetalleDocumentoSerializer(many=True, read_only=True)
    pagos = PagoDocumentoSerializer(many=True, read_only=True)
    
    # Campos calculados
    puede_anular_info = serializers.SerializerMethodField()
    estado_pago = serializers.SerializerMethodField()
    dias_vencimiento = serializers.SerializerMethodField()
    
    # URLs de descarga
    url_pdf = serializers.SerializerMethodField()
    url_xml = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentoElectronico
        fields = [
            # Identificación
            'id', 'uuid', 'tipo_documento', 'tipo_documento_info',
            'serie_documento', 'serie_documento_info', 'numero',
            'numero_completo',
            
            # Fechas
            'fecha_emision', 'fecha_vencimiento', 'dias_vencimiento',
            
            # Cliente
            'cliente', 'cliente_info', 'cliente_tipo_documento',
            'cliente_numero_documento', 'cliente_razon_social',
            'cliente_direccion', 'cliente_email',
            
            # Moneda y cambio
            'moneda', 'tipo_cambio',
            
            # Importes
            'subtotal', 'total_descuentos', 'base_imponible', 'igv',
            'total_exonerado', 'total_inafecto', 'total_gratuito', 'total',
            
            # Información adicional
            'observaciones', 'condiciones_pago', 'vendedor', 'vendedor_info',
            
            # Estado y control
            'estado', 'motivo_anulacion', 'puede_anular_info', 'estado_pago',
            
            # Información SUNAT
            'hash_documento', 'codigo_qr', 'enlace_pdf', 'enlace_xml',
            'enlace_cdr', 'fecha_envio_sunat', 'fecha_respuesta_sunat',
            'url_pdf', 'url_xml',
            
            # Referencia (para notas)
            'documento_referencia', 'tipo_nota', 'motivo_nota',
            
            # Relacionados
            'detalles', 'pagos',
            
            # Auditoría
            'activo', 'fecha_creacion', 'fecha_actualizacion'
        ]
        read_only_fields = [
            'uuid', 'numero', 'numero_completo', 'subtotal', 'total_descuentos',
            'base_imponible', 'igv', 'total_exonerado', 'total_inafecto',
            'total_gratuito', 'total', 'hash_documento', 'codigo_qr',
            'enlace_pdf', 'enlace_xml', 'enlace_cdr', 'fecha_envio_sunat',
            'fecha_respuesta_sunat', 'fecha_creacion', 'fecha_actualizacion'
        ]
    
    def get_cliente_info(self, obj):
        """Información del cliente"""
        if obj.cliente:
            return {
                'id': obj.cliente.id,
                'razon_social': obj.cliente.razon_social,
                'numero_documento': obj.cliente.numero_documento,
                'email': obj.cliente.email,
                'telefono': obj.cliente.telefono
            }
        return None
    
    def get_vendedor_info(self, obj):
        """Información del vendedor"""
        if obj.vendedor:
            return {
                'id': obj.vendedor.id,
                'nombres': obj.vendedor.nombres,
                'apellidos': obj.vendedor.apellidos,
                'email': obj.vendedor.email
            }
        return None
    
    def get_puede_anular_info(self, obj):
        """Información sobre si puede anularse"""
        puede, motivo = obj.puede_anular()
        return {
            'puede_anular': puede,
            'motivo': motivo
        }
    
    def get_estado_pago(self, obj):
        """Estado de pago del documento"""
        total_pagado = sum(pago.monto for pago in obj.pagos.filter(activo=True))
        
        if total_pagado == 0:
            return 'PENDIENTE'
        elif total_pagado >= obj.total:
            return 'PAGADO'
        else:
            return 'PARCIAL'
    
    def get_dias_vencimiento(self, obj):
        """Días hasta el vencimiento"""
        if obj.fecha_vencimiento:
            from datetime import date
            delta = obj.fecha_vencimiento - date.today()
            return delta.days
        return None
    
    def get_url_pdf(self, obj):
        """URL para descargar PDF"""
        if obj.enlace_pdf:
            return obj.enlace_pdf
        return None
    
    def get_url_xml(self, obj):
        """URL para descargar XML"""
        if obj.enlace_xml:
            return obj.enlace_xml
        return None
    
    def validate_cliente(self, value):
        """Validar cliente según tipo de documento"""
        if not value:
            raise serializers.ValidationError("Cliente es requerido")
        
        if not value.activo:
            raise serializers.ValidationError("Cliente no está activo")
        
        if value.bloqueado:
            raise serializers.ValidationError(
                f"Cliente bloqueado: {value.motivo_bloqueo}"
            )
        
        return value
    
    def validate_fecha_vencimiento(self, value):
        """Validar fecha de vencimiento"""
        if value and value < timezone.now().date():
            raise serializers.ValidationError(
                "Fecha de vencimiento no puede ser anterior a hoy"
            )
        return value
    
    def validate_tipo_cambio(self, value):
        """Validar tipo de cambio"""
        if value <= 0:
            raise serializers.ValidationError("Tipo de cambio debe ser mayor a 0")
        return value
    
    def validate(self, data):
        """Validaciones cruzadas"""
        tipo_documento = data.get('tipo_documento')
        cliente = data.get('cliente')
        
        # Validar cliente RUC para facturas
        if tipo_documento and cliente:
            if tipo_documento.requiere_cliente_ruc:
                if cliente.tipo_documento.codigo != '6':
                    raise serializers.ValidationError({
                        'cliente': f'{tipo_documento.nombre} requiere cliente con RUC'
                    })
        
        # Validar referencia para notas
        if tipo_documento and tipo_documento.requiere_referencia:
            documento_referencia = data.get('documento_referencia')
            if not documento_referencia:
                raise serializers.ValidationError({
                    'documento_referencia': f'{tipo_documento.nombre} requiere documento de referencia'
                })
        
        # Validar moneda y tipo de cambio
        moneda = data.get('moneda', 'PEN')
        tipo_cambio = data.get('tipo_cambio', Decimal('1.0000'))
        
        if moneda != 'PEN' and tipo_cambio == Decimal('1.0000'):
            raise serializers.ValidationError({
                'tipo_cambio': 'Tipo de cambio requerido para moneda extranjera'
            })
        
        return data


class DocumentoElectronicoCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para creación de documentos
    """
    
    detalles_data = DetalleDocumentoSerializer(many=True, write_only=True)
    pagos_data = PagoDocumentoSerializer(many=True, required=False, write_only=True)
    
    class Meta:
        model = DocumentoElectronico
        fields = [
            'tipo_documento', 'serie_documento', 'cliente',
            'fecha_emision', 'fecha_vencimiento', 'moneda', 'tipo_cambio',
            'observaciones', 'condiciones_pago', 'vendedor',
            'documento_referencia', 'tipo_nota', 'motivo_nota',
            'detalles_data', 'pagos_data'
        ]
    
    def validate_detalles_data(self, value):
        """Validar que hay al menos un detalle"""
        if not value:
            raise serializers.ValidationError("Debe incluir al menos un detalle")
        
        # Validar números de item únicos
        numeros_item = [detalle.get('numero_item') for detalle in value]
        if len(numeros_item) != len(set(numeros_item)):
            raise serializers.ValidationError("Números de item deben ser únicos")
        
        return value
    
    def validate_pagos_data(self, value):
        """Validar pagos si se incluyen"""
        if value:
            total_pagos = sum(pago.get('monto', 0) for pago in value)
            if total_pagos <= 0:
                raise serializers.ValidationError("Total de pagos debe ser mayor a 0")
        
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        """Crear documento con detalles y pagos"""
        detalles_data = validated_data.pop('detalles_data')
        pagos_data = validated_data.pop('pagos_data', [])
        
        # Obtener siguiente número de serie
        serie_documento = validated_data['serie_documento']
        validated_data['numero'] = serie_documento.obtener_siguiente_numero()
        
        # Copiar datos del cliente
        cliente = validated_data['cliente']
        validated_data.update({
            'cliente_tipo_documento': cliente.tipo_documento.codigo,
            'cliente_numero_documento': cliente.numero_documento,
            'cliente_razon_social': cliente.razon_social,
            'cliente_direccion': cliente.direccion,
            'cliente_email': cliente.email,
        })
        
        # Crear documento
        documento = DocumentoElectronico.objects.create(**validated_data)
        
        # Crear detalles
        for detalle_data in detalles_data:
            detalle_data['documento'] = documento
            
            # Copiar datos del producto
            producto = detalle_data['producto']
            detalle_data.update({
                'codigo_producto': producto.codigo,
                'descripcion': detalle_data.get('descripcion', producto.nombre),
                'unidad_medida': detalle_data.get('unidad_medida', producto.unidad_medida_sunat),
                'tipo_afectacion_igv': detalle_data.get('tipo_afectacion_igv', producto.tipo_afectacion_igv),
            })
            
            DetalleDocumento.objects.create(**detalle_data)
        
        # Crear pagos
        for pago_data in pagos_data:
            pago_data['documento'] = documento
            PagoDocumento.objects.create(**pago_data)
        
        # Incrementar número de serie
        serie_documento.incrementar_numero()
        
        # Afectar inventario si corresponde
        if documento.tipo_documento.afecta_inventario:
            for detalle in documento.detalles.all():
                detalle.afectar_inventario()
        
        return documento


class DocumentoElectronicoListSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para listados de documentos
    """
    
    tipo_documento_nombre = serializers.CharField(source='tipo_documento.nombre', read_only=True)
    cliente_nombre = serializers.CharField(source='cliente_razon_social', read_only=True)
    estado_pago = serializers.SerializerMethodField()
    dias_vencimiento = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentoElectronico
        fields = [
            'id', 'numero_completo', 'tipo_documento_nombre',
            'cliente_nombre', 'fecha_emision', 'fecha_vencimiento',
            'dias_vencimiento', 'total', 'moneda', 'estado',
            'estado_pago', 'activo'
        ]
    
    def get_estado_pago(self, obj):
        """Estado de pago simplificado"""
        total_pagado = sum(pago.monto for pago in obj.pagos.filter(activo=True))
        
        if total_pagado == 0:
            return 'PENDIENTE'
        elif total_pagado >= obj.total:
            return 'PAGADO'
        else:
            return 'PARCIAL'
    
    def get_dias_vencimiento(self, obj):
        """Días hasta vencimiento"""
        if obj.fecha_vencimiento:
            from datetime import date
            delta = obj.fecha_vencimiento - date.today()
            return delta.days
        return None


class DocumentoBusquedaSerializer(serializers.Serializer):
    """
    Serializer para búsqueda de documentos
    """
    
    numero_completo = serializers.CharField(
        max_length=15,
        required=False,
        help_text="Número completo del documento"
    )
    
    tipo_documento = serializers.IntegerField(
        required=False,
        help_text="ID del tipo de documento"
    )
    
    cliente = serializers.IntegerField(
        required=False,
        help_text="ID del cliente"
    )
    
    estado = serializers.ChoiceField(
        choices=DocumentoElectronico.ESTADOS_DOCUMENTO,
        required=False,
        help_text="Estado del documento"
    )
    
    fecha_desde = serializers.DateField(
        required=False,
        help_text="Fecha de emisión desde"
    )
    
    fecha_hasta = serializers.DateField(
        required=False,
        help_text="Fecha de emisión hasta"
    )
    
    moneda = serializers.ChoiceField(
        choices=DocumentoElectronico.MONEDAS,
        required=False,
        help_text="Moneda del documento"
    )
    
    monto_minimo = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        help_text="Monto mínimo"
    )
    
    monto_maximo = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        help_text="Monto máximo"
    )
    
    estado_pago = serializers.ChoiceField(
        choices=[
            ('pendiente', 'Pendiente'),
            ('parcial', 'Parcial'),
            ('pagado', 'Pagado'),
        ],
        required=False,
        help_text="Estado de pago"
    )
    
    vendedor = serializers.IntegerField(
        required=False,
        help_text="ID del vendedor"
    )
    
    def validate(self, data):
        """Validar criterios de búsqueda"""
        fecha_desde = data.get('fecha_desde')
        fecha_hasta = data.get('fecha_hasta')
        
        if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
            raise serializers.ValidationError(
                "Fecha desde no puede ser mayor a fecha hasta"
            )
        
        monto_minimo = data.get('monto_minimo')
        monto_maximo = data.get('monto_maximo')
        
        if monto_minimo and monto_maximo and monto_minimo > monto_maximo:
            raise serializers.ValidationError(
                "Monto mínimo no puede ser mayor a monto máximo"
            )
        
        return data


class EstadisticasFacturacionSerializer(serializers.Serializer):
    """
    Serializer para estadísticas de facturación
    """
    
    # Totales generales
    total_documentos = serializers.IntegerField()
    total_facturado = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_igv = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    # Por estado
    documentos_por_estado = serializers.DictField()
    
    # Por tipo de documento
    por_tipo_documento = serializers.DictField()
    
    # Por moneda
    por_moneda = serializers.DictField()
    
    # Tendencias
    facturacion_diaria = serializers.ListField(child=serializers.DictField())
    facturacion_mensual = serializers.ListField(child=serializers.DictField())
    
    # Top clientes
    top_clientes = serializers.ListField(child=serializers.DictField())
    
    # Documentos pendientes
    documentos_vencidos = serializers.IntegerField()
    documentos_por_vencer = serializers.IntegerField()
    
    # Promedios
    ticket_promedio = serializers.DecimalField(max_digits=12, decimal_places=2)
    documentos_promedio_dia = serializers.DecimalField(max_digits=8, decimal_places=2)


class AnulacionDocumentoSerializer(serializers.Serializer):
    """
    Serializer para anulación de documentos
    """
    
    motivo = serializers.CharField(
        max_length=500,
        help_text="Motivo de la anulación"
    )
    
    enviar_sunat = serializers.BooleanField(
        default=True,
        help_text="Si enviar comunicación de baja a SUNAT"
    )
    
    def validate_motivo(self, value):
        """Validar motivo de anulación"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Motivo debe tener al menos 10 caracteres"
            )
        return value.strip()