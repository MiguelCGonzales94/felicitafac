"""
Modelos de Integraciones - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Integración con Nubefact API para SUNAT
Optimizado para MySQL y hosting compartido
"""

from django.db import models
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid
import json
from aplicaciones.core.models import ModeloBase


class ProveedorIntegracion(ModeloBase):
    """
    Modelo para proveedores de integración
    Nubefact, FacturalaPeru, etc.
    """
    
    TIPOS_PROVEEDOR = [
        ('nubefact', 'Nubefact'),
        ('facturalaPeru', 'FacturalaPeru'),
        ('efact', 'eFact'),
        ('sunat_directa', 'SUNAT Directa'),
    ]
    
    ESTADOS_PROVEEDOR = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('mantenimiento', 'En Mantenimiento'),
        ('suspendido', 'Suspendido'),
    ]
    
    codigo = models.CharField(
        'Código',
        max_length=20,
        unique=True,
        db_index=True,
        help_text='Código único del proveedor'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre del proveedor de integración'
    )
    
    tipo = models.CharField(
        'Tipo',
        max_length=20,
        choices=TIPOS_PROVEEDOR,
        db_index=True,
        help_text='Tipo de proveedor de integración'
    )
    
    descripcion = models.TextField(
        'Descripción',
        blank=True,
        null=True,
        help_text='Descripción del proveedor'
    )
    
    url_api = models.URLField(
        'URL API',
        help_text='URL base de la API del proveedor'
    )
    
    url_documentacion = models.URLField(
        'URL Documentación',
        blank=True,
        null=True,
        help_text='URL de documentación de la API'
    )
    
    estado = models.CharField(
        'Estado',
        max_length=20,
        choices=ESTADOS_PROVEEDOR,
        default='activo',
        db_index=True,
        help_text='Estado del proveedor'
    )
    
    version_api = models.CharField(
        'Versión API',
        max_length=20,
        default='1.0',
        help_text='Versión de la API utilizada'
    )
    
    es_principal = models.BooleanField(
        'Es Principal',
        default=False,
        help_text='Si es el proveedor principal'
    )
    
    limite_documentos_dia = models.PositiveIntegerField(
        'Límite Documentos/Día',
        default=1000,
        help_text='Límite de documentos por día'
    )
    
    tiempo_espera_segundos = models.PositiveIntegerField(
        'Tiempo Espera (seg)',
        default=30,
        help_text='Tiempo de espera para respuestas en segundos'
    )
    
    reintentos_maximos = models.PositiveIntegerField(
        'Reintentos Máximos',
        default=3,
        help_text='Número máximo de reintentos'
    )
    
    # Configuración de autenticación
    requiere_token = models.BooleanField(
        'Requiere Token',
        default=True,
        help_text='Si requiere token de autenticación'
    )
    
    tipo_autenticacion = models.CharField(
        'Tipo Autenticación',
        max_length=20,
        choices=[
            ('token', 'Token'),
            ('api_key', 'API Key'),
            ('oauth', 'OAuth'),
            ('basic', 'Basic Auth'),
        ],
        default='token',
        help_text='Tipo de autenticación requerida'
    )
    
    # Configuración de endpoints
    endpoint_emision = models.CharField(
        'Endpoint Emisión',
        max_length=200,
        help_text='Endpoint para emisión de documentos'
    )
    
    endpoint_consulta = models.CharField(
        'Endpoint Consulta',
        max_length=200,
        help_text='Endpoint para consulta de documentos'
    )
    
    endpoint_anulacion = models.CharField(
        'Endpoint Anulación',
        max_length=200,
        blank=True,
        null=True,
        help_text='Endpoint para anulación de documentos'
    )
    
    endpoint_comunicacion_baja = models.CharField(
        'Endpoint Comunicación Baja',
        max_length=200,
        blank=True,
        null=True,
        help_text='Endpoint para comunicación de baja'
    )
    
    # Configuración de respuesta
    formato_respuesta = models.CharField(
        'Formato Respuesta',
        max_length=20,
        choices=[
            ('json', 'JSON'),
            ('xml', 'XML'),
            ('soap', 'SOAP'),
        ],
        default='json',
        help_text='Formato de respuesta de la API'
    )
    
    # Estadísticas
    total_documentos_enviados = models.PositiveIntegerField(
        'Total Documentos Enviados',
        default=0,
        help_text='Total de documentos enviados'
    )
    
    total_documentos_exitosos = models.PositiveIntegerField(
        'Total Documentos Exitosos',
        default=0,
        help_text='Total de documentos procesados exitosamente'
    )
    
    total_documentos_error = models.PositiveIntegerField(
        'Total Documentos Error',
        default=0,
        help_text='Total de documentos con error'
    )
    
    fecha_ultimo_envio = models.DateTimeField(
        'Último Envío',
        blank=True,
        null=True,
        help_text='Fecha del último envío'
    )
    
    class Meta:
        db_table = 'integraciones_proveedor_integracion'
        verbose_name = 'Proveedor de Integración'
        verbose_name_plural = 'Proveedores de Integración'
        indexes = [
            models.Index(fields=['codigo'], name='idx_proveedor_codigo'),
            models.Index(fields=['tipo'], name='idx_proveedor_tipo'),
            models.Index(fields=['estado'], name='idx_proveedor_estado'),
            models.Index(fields=['es_principal'], name='idx_proveedor_principal'),
            models.Index(fields=['activo'], name='idx_proveedor_activo'),
        ]
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
    
    def save(self, *args, **kwargs):
        """Override save para proveedor principal único"""
        if self.es_principal:
            # Solo un proveedor puede ser principal
            ProveedorIntegracion.objects.filter(es_principal=True).update(es_principal=False)
        
        super().save(*args, **kwargs)
    
    def esta_disponible(self):
        """Verifica si el proveedor está disponible"""
        return self.estado == 'activo' and self.activo
    
    def puede_enviar_documento(self):
        """Verifica si puede enviar más documentos hoy"""
        from datetime import date
        
        if not self.esta_disponible():
            return False, "Proveedor no disponible"
        
        # Verificar límite diario
        hoy = date.today()
        documentos_hoy = LogIntegracion.objects.filter(
            proveedor=self,
            fecha_envio__date=hoy
        ).count()
        
        if documentos_hoy >= self.limite_documentos_dia:
            return False, f"Límite diario alcanzado ({self.limite_documentos_dia})"
        
        return True, "Puede enviar documento"
    
    def actualizar_estadisticas(self, exitoso=True):
        """Actualiza las estadísticas del proveedor"""
        self.total_documentos_enviados += 1
        if exitoso:
            self.total_documentos_exitosos += 1
        else:
            self.total_documentos_error += 1
        
        self.fecha_ultimo_envio = timezone.now()
        self.save(update_fields=[
            'total_documentos_enviados', 'total_documentos_exitosos',
            'total_documentos_error', 'fecha_ultimo_envio'
        ])
    
    def obtener_tasa_exito(self):
        """Calcula la tasa de éxito del proveedor"""
        if self.total_documentos_enviados == 0:
            return 0
        
        return (self.total_documentos_exitosos / self.total_documentos_enviados) * 100


class ConfiguracionIntegracion(ModeloBase):
    """
    Modelo para configuración específica de integración
    Tokens, credenciales, parámetros por proveedor
    """
    
    AMBIENTES = [
        ('demo', 'Demo/Pruebas'),
        ('produccion', 'Producción'),
    ]
    
    proveedor = models.ForeignKey(
        ProveedorIntegracion,
        on_delete=models.CASCADE,
        related_name='configuraciones',
        verbose_name='Proveedor'
    )
    
    ambiente = models.CharField(
        'Ambiente',
        max_length=20,
        choices=AMBIENTES,
        default='demo',
        db_index=True,
        help_text='Ambiente de la integración'
    )
    
    # Credenciales
    token = models.TextField(
        'Token',
        blank=True,
        null=True,
        help_text='Token de autenticación'
    )
    
    api_key = models.CharField(
        'API Key',
        max_length=200,
        blank=True,
        null=True,
        help_text='Clave de API'
    )
    
    usuario = models.CharField(
        'Usuario',
        max_length=100,
        blank=True,
        null=True,
        help_text='Usuario de autenticación'
    )
    
    password = models.CharField(
        'Password',
        max_length=200,
        blank=True,
        null=True,
        help_text='Contraseña de autenticación'
    )
    
    # Configuración específica Nubefact
    ruc_empresa = models.CharField(
        'RUC Empresa',
        max_length=11,
        help_text='RUC de la empresa en el proveedor'
    )
    
    codigo_establecimiento = models.CharField(
        'Código Establecimiento',
        max_length=10,
        default='0000',
        help_text='Código de establecimiento'
    )
    
    # URLs específicas por ambiente
    url_base = models.URLField(
        'URL Base',
        help_text='URL base para este ambiente'
    )
    
    url_pdf = models.URLField(
        'URL PDF',
        blank=True,
        null=True,
        help_text='URL para descargar PDFs'
    )
    
    url_xml = models.URLField(
        'URL XML',
        blank=True,
        null=True,
        help_text='URL para descargar XMLs'
    )
    
    # Configuración de empresa en proveedor
    logo_empresa_url = models.URLField(
        'Logo Empresa URL',
        blank=True,
        null=True,
        help_text='URL del logo de la empresa'
    )
    
    datos_empresa_json = models.TextField(
        'Datos Empresa JSON',
        blank=True,
        null=True,
        help_text='Datos de la empresa en formato JSON'
    )
    
    # Configuración de formato
    formato_pdf = models.CharField(
        'Formato PDF',
        max_length=20,
        choices=[
            ('a4', 'A4'),
            ('ticket', 'Ticket 80mm'),
            ('ticket_50', 'Ticket 50mm'),
        ],
        default='a4',
        help_text='Formato de impresión PDF'
    )
    
    incluir_qr = models.BooleanField(
        'Incluir QR',
        default=True,
        help_text='Si incluir código QR en documentos'
    )
    
    # Configuración de validación
    validar_receptor = models.BooleanField(
        'Validar Receptor',
        default=True,
        help_text='Si validar datos del receptor'
    )
    
    enviar_email = models.BooleanField(
        'Enviar Email',
        default=True,
        help_text='Si enviar documentos por email'
    )
    
    # Estado de configuración
    configuracion_valida = models.BooleanField(
        'Configuración Válida',
        default=False,
        help_text='Si la configuración ha sido validada'
    )
    
    fecha_validacion = models.DateTimeField(
        'Fecha Validación',
        blank=True,
        null=True,
        help_text='Fecha de última validación'
    )
    
    mensaje_validacion = models.TextField(
        'Mensaje Validación',
        blank=True,
        null=True,
        help_text='Mensaje del resultado de validación'
    )
    
    # Configuración avanzada
    configuracion_avanzada_json = models.TextField(
        'Configuración Avanzada',
        blank=True,
        null=True,
        help_text='Configuración adicional en formato JSON'
    )
    
    class Meta:
        db_table = 'integraciones_configuracion_integracion'
        verbose_name = 'Configuración de Integración'
        verbose_name_plural = 'Configuraciones de Integración'
        unique_together = [['proveedor', 'ambiente']]
        indexes = [
            models.Index(fields=['proveedor'], name='idx_int_config_proveedor'),
            models.Index(fields=['ambiente'], name='idx_int_config_ambiente'),
            models.Index(fields=['ruc_empresa'], name='idx_int_config_ruc'),
            models.Index(fields=['configuracion_valida'], name='idx_int_config_valida'),
            models.Index(fields=['activo'], name='idx_int_config_activo'),
        ]
    
    def __str__(self):
        return f"{self.proveedor.nombre} - {self.ambiente}"
    
    def validar_configuracion(self):
        """Valida la configuración con el proveedor"""
        try:
            # Implementar validación específica por proveedor
            if self.proveedor.tipo == 'nubefact':
                return self._validar_nubefact()
            else:
                return False, "Proveedor no soportado"
        
        except Exception as e:
            return False, f"Error en validación: {str(e)}"
    
    def _validar_nubefact(self):
        """Validación específica para Nubefact"""
        if not self.token:
            return False, "Token requerido para Nubefact"
        
        if not self.ruc_empresa:
            return False, "RUC de empresa requerido"
        
        # Aquí se implementaría la llamada real a Nubefact
        # Por ahora retornamos True para desarrollo
        self.configuracion_valida = True
        self.fecha_validacion = timezone.now()
        self.mensaje_validacion = "Configuración válida"
        self.save(update_fields=['configuracion_valida', 'fecha_validacion', 'mensaje_validacion'])
        
        return True, "Configuración válida"
    
    def obtener_datos_empresa(self):
        """Retorna los datos de la empresa como diccionario"""
        if self.datos_empresa_json:
            try:
                return json.loads(self.datos_empresa_json)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def establecer_datos_empresa(self, datos):
        """Establece los datos de la empresa como JSON"""
        self.datos_empresa_json = json.dumps(datos, ensure_ascii=False, indent=2)
        self.save(update_fields=['datos_empresa_json'])


class LogIntegracion(ModeloBase):
    """
    Modelo para logs de integración
    Registra todos los intentos de comunicación con proveedores
    """
    
    TIPOS_OPERACION = [
        ('emision', 'Emisión'),
        ('consulta', 'Consulta'),
        ('anulacion', 'Anulación'),
        ('comunicacion_baja', 'Comunicación de Baja'),
        ('validacion', 'Validación'),
    ]
    
    ESTADOS_LOG = [
        ('enviando', 'Enviando'),
        ('exitoso', 'Exitoso'),
        ('error', 'Error'),
        ('timeout', 'Timeout'),
        ('reintentando', 'Reintentando'),
    ]
    
    # Identificación única
    uuid = models.UUIDField(
        'UUID',
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text='Identificador único universal'
    )
    
    proveedor = models.ForeignKey(
        ProveedorIntegracion,
        on_delete=models.PROTECT,
        related_name='logs',
        verbose_name='Proveedor'
    )
    
    configuracion = models.ForeignKey(
        ConfiguracionIntegracion,
        on_delete=models.PROTECT,
        related_name='logs',
        verbose_name='Configuración'
    )
    
    # Documento relacionado
    documento_electronico = models.ForeignKey(
        'facturacion.DocumentoElectronico',
        on_delete=models.PROTECT,
        related_name='logs_integracion',
        verbose_name='Documento Electrónico',
        blank=True,
        null=True
    )
    
    # Información de la operación
    tipo_operacion = models.CharField(
        'Tipo de Operación',
        max_length=20,
        choices=TIPOS_OPERACION,
        db_index=True,
        help_text='Tipo de operación realizada'
    )
    
    estado = models.CharField(
        'Estado',
        max_length=20,
        choices=ESTADOS_LOG,
        default='enviando',
        db_index=True,
        help_text='Estado de la operación'
    )
    
    # Fechas y tiempos
    fecha_envio = models.DateTimeField(
        'Fecha Envío',
        default=timezone.now,
        db_index=True,
        help_text='Fecha y hora del envío'
    )
    
    fecha_respuesta = models.DateTimeField(
        'Fecha Respuesta',
        blank=True,
        null=True,
        help_text='Fecha y hora de la respuesta'
    )
    
    tiempo_respuesta_ms = models.PositiveIntegerField(
        'Tiempo Respuesta (ms)',
        blank=True,
        null=True,
        help_text='Tiempo de respuesta en milisegundos'
    )
    
    # Datos de la petición
    endpoint_utilizado = models.CharField(
        'Endpoint Utilizado',
        max_length=200,
        help_text='Endpoint específico utilizado'
    )
    
    metodo_http = models.CharField(
        'Método HTTP',
        max_length=10,
        choices=[
            ('GET', 'GET'),
            ('POST', 'POST'),
            ('PUT', 'PUT'),
            ('DELETE', 'DELETE'),
        ],
        default='POST',
        help_text='Método HTTP utilizado'
    )
    
    headers_envio = models.TextField(
        'Headers Envío',
        blank=True,
        null=True,
        help_text='Headers enviados en formato JSON'
    )
    
    payload_envio = models.TextField(
        'Payload Envío',
        blank=True,
        null=True,
        help_text='Datos enviados al proveedor'
    )
    
    # Datos de la respuesta
    codigo_respuesta_http = models.PositiveIntegerField(
        'Código Respuesta HTTP',
        blank=True,
        null=True,
        help_text='Código de respuesta HTTP'
    )
    
    headers_respuesta = models.TextField(
        'Headers Respuesta',
        blank=True,
        null=True,
        help_text='Headers de respuesta en formato JSON'
    )
    
    payload_respuesta = models.TextField(
        'Payload Respuesta',
        blank=True,
        null=True,
        help_text='Respuesta del proveedor'
    )
    
    # Información de resultado
    exitoso = models.BooleanField(
        'Exitoso',
        default=False,
        db_index=True,
        help_text='Si la operación fue exitosa'
    )
    
    codigo_error = models.CharField(
        'Código Error',
        max_length=50,
        blank=True,
        null=True,
        help_text='Código de error del proveedor'
    )
    
    mensaje_error = models.TextField(
        'Mensaje Error',
        blank=True,
        null=True,
        help_text='Mensaje de error detallado'
    )
    
    # Información SUNAT
    hash_sunat = models.CharField(
        'Hash SUNAT',
        max_length=100,
        blank=True,
        null=True,
        help_text='Hash retornado por SUNAT'
    )
    
    codigo_qr = models.TextField(
        'Código QR',
        blank=True,
        null=True,
        help_text='Datos del código QR'
    )
    
    enlace_pdf = models.URLField(
        'Enlace PDF',
        blank=True,
        null=True,
        help_text='Enlace al PDF generado'
    )
    
    enlace_xml = models.URLField(
        'Enlace XML',
        blank=True,
        null=True,
        help_text='Enlace al XML generado'
    )
    
    enlace_cdr = models.URLField(
        'Enlace CDR',
        blank=True,
        null=True,
        help_text='Enlace al CDR de SUNAT'
    )
    
    # Control de reintentos
    numero_intento = models.PositiveIntegerField(
        'Número Intento',
        default=1,
        help_text='Número del intento actual'
    )
    
    reintento_de = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='reintentos',
        verbose_name='Reintento De',
        help_text='Log original del cual es reintento'
    )
    
    # Información adicional
    ip_origen = models.GenericIPAddressField(
        'IP Origen',
        blank=True,
        null=True,
        help_text='IP desde donde se realizó la petición'
    )
    
    user_agent = models.TextField(
        'User Agent',
        blank=True,
        null=True,
        help_text='User Agent de la petición'
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones adicionales'
    )
    
    class Meta:
        db_table = 'integraciones_log_integracion'
        verbose_name = 'Log de Integración'
        verbose_name_plural = 'Logs de Integración'
        indexes = [
            models.Index(fields=['proveedor'], name='idx_log_proveedor'),
            models.Index(fields=['documento_electronico'], name='idx_log_documento'),
            models.Index(fields=['tipo_operacion'], name='idx_log_operacion'),
            models.Index(fields=['estado'], name='idx_log_estado'),
            models.Index(fields=['fecha_envio'], name='idx_log_fecha_envio'),
            models.Index(fields=['exitoso'], name='idx_log_exitoso'),
            models.Index(fields=['codigo_respuesta_http'], name='idx_log_codigo_http'),
            models.Index(fields=['numero_intento'], name='idx_log_intento'),
            models.Index(fields=['activo'], name='idx_log_activo'),
        ]
        ordering = ['-fecha_envio']
    
    def __str__(self):
        documento = f" - {self.documento_electronico.numero_completo}" if self.documento_electronico else ""
        return f"{self.proveedor.codigo} - {self.tipo_operacion}{documento}"
    
    def marcar_exitoso(self, respuesta_data=None):
        """Marca el log como exitoso"""
        self.estado = 'exitoso'
        self.exitoso = True
        self.fecha_respuesta = timezone.now()
        
        if respuesta_data:
            self.payload_respuesta = json.dumps(respuesta_data, ensure_ascii=False)
            
            # Extraer información específica de Nubefact
            if isinstance(respuesta_data, dict):
                self.hash_sunat = respuesta_data.get('hash')
                self.codigo_qr = respuesta_data.get('qr')
                self.enlace_pdf = respuesta_data.get('enlace_del_pdf')
                self.enlace_xml = respuesta_data.get('enlace_del_xml')
                self.enlace_cdr = respuesta_data.get('enlace_del_cdr')
        
        self._calcular_tiempo_respuesta()
        self.save()
        
        # Actualizar estadísticas del proveedor
        self.proveedor.actualizar_estadisticas(exitoso=True)
    
    def marcar_error(self, codigo_error=None, mensaje_error=None, codigo_http=None):
        """Marca el log como error"""
        self.estado = 'error'
        self.exitoso = False
        self.fecha_respuesta = timezone.now()
        self.codigo_error = codigo_error
        self.mensaje_error = mensaje_error
        self.codigo_respuesta_http = codigo_http
        
        self._calcular_tiempo_respuesta()
        self.save()
        
        # Actualizar estadísticas del proveedor
        self.proveedor.actualizar_estadisticas(exitoso=False)
    
    def marcar_timeout(self):
        """Marca el log como timeout"""
        self.estado = 'timeout'
        self.exitoso = False
        self.fecha_respuesta = timezone.now()
        self.mensaje_error = 'Timeout en la comunicación'
        
        self._calcular_tiempo_respuesta()
        self.save()
        
        # Actualizar estadísticas del proveedor
        self.proveedor.actualizar_estadisticas(exitoso=False)
    
    def _calcular_tiempo_respuesta(self):
        """Calcula el tiempo de respuesta en milisegundos"""
        if self.fecha_respuesta and self.fecha_envio:
            delta = self.fecha_respuesta - self.fecha_envio
            self.tiempo_respuesta_ms = int(delta.total_seconds() * 1000)
    
    def puede_reintentar(self):
        """Verifica si se puede reintentar la operación"""
        if self.exitoso:
            return False, "Operación ya exitosa"
        
        if self.numero_intento >= self.proveedor.reintentos_maximos:
            return False, f"Máximo de reintentos alcanzado ({self.proveedor.reintentos_maximos})"
        
        return True, "Puede reintentar"
    
    def crear_reintento(self):
        """Crea un nuevo log para reintento"""
        puede, mensaje = self.puede_reintentar()
        if not puede:
            raise ValidationError(mensaje)
        
        nuevo_log = LogIntegracion.objects.create(
            proveedor=self.proveedor,
            configuracion=self.configuracion,
            documento_electronico=self.documento_electronico,
            tipo_operacion=self.tipo_operacion,
            endpoint_utilizado=self.endpoint_utilizado,
            metodo_http=self.metodo_http,
            payload_envio=self.payload_envio,
            numero_intento=self.numero_intento + 1,
            reintento_de=self,
            estado='reintentando'
        )
        
        return nuevo_log


class WebhookIntegracion(ModeloBase):
    """
    Modelo para webhooks de integración
    Recibe notificaciones de proveedores
    """
    
    TIPOS_WEBHOOK = [
        ('documento_procesado', 'Documento Procesado'),
        ('documento_rechazado', 'Documento Rechazado'),
        ('respuesta_sunat', 'Respuesta SUNAT'),
        ('estado_cambio', 'Cambio de Estado'),
        ('notificacion_general', 'Notificación General'),
    ]
    
    ESTADOS_WEBHOOK = [
        ('recibido', 'Recibido'),
        ('procesado', 'Procesado'),
        ('error', 'Error'),
        ('ignorado', 'Ignorado'),
    ]
    
    # Identificación
    uuid = models.UUIDField(
        'UUID',
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text='Identificador único universal'
    )
    
    proveedor = models.ForeignKey(
        ProveedorIntegracion,
        on_delete=models.PROTECT,
        related_name='webhooks',
        verbose_name='Proveedor'
    )
    
    # Información del webhook
    tipo_webhook = models.CharField(
        'Tipo Webhook',
        max_length=30,
        choices=TIPOS_WEBHOOK,
        db_index=True,
        help_text='Tipo de webhook recibido'
    )
    
    estado = models.CharField(
        'Estado',
        max_length=20,
        choices=ESTADOS_WEBHOOK,
        default='recibido',
        db_index=True,
        help_text='Estado del procesamiento'
    )
    
    fecha_recepcion = models.DateTimeField(
        'Fecha Recepción',
        default=timezone.now,
        db_index=True,
        help_text='Fecha de recepción del webhook'
    )
    
    fecha_procesamiento = models.DateTimeField(
        'Fecha Procesamiento',
        blank=True,
        null=True,
        help_text='Fecha de procesamiento del webhook'
    )
    
    # Datos del webhook
    headers_recibidos = models.TextField(
        'Headers Recibidos',
        blank=True,
        null=True,
        help_text='Headers recibidos en formato JSON'
    )
    
    payload_recibido = models.TextField(
        'Payload Recibido',
        help_text='Datos recibidos del webhook'
    )
    
    # Información relacionada
    documento_referencia = models.CharField(
        'Documento Referencia',
        max_length=50,
        blank=True,
        null=True,
        help_text='Documento de referencia en el webhook'
    )
    
    documento_electronico = models.ForeignKey(
        'facturacion.DocumentoElectronico',
        on_delete=models.PROTECT,
        related_name='webhooks_recibidos',
        verbose_name='Documento Electrónico',
        blank=True,
        null=True
    )
    
    # Información de procesamiento
    mensaje_procesamiento = models.TextField(
        'Mensaje Procesamiento',
        blank=True,
        null=True,
        help_text='Mensaje del resultado del procesamiento'
    )
    
    error_procesamiento = models.TextField(
        'Error Procesamiento',
        blank=True,
        null=True,
        help_text='Error ocurrido durante el procesamiento'
    )
    
    # Información de red
    ip_origen = models.GenericIPAddressField(
        'IP Origen',
        help_text='IP desde donde se recibió el webhook'
    )
    
    user_agent = models.TextField(
        'User Agent',
        blank=True,
        null=True,
        help_text='User Agent del webhook'
    )
    
    # Validación de seguridad
    signature_header = models.CharField(
        'Signature Header',
        max_length=200,
        blank=True,
        null=True,
        help_text='Header de firma de seguridad'
    )
    
    signature_valida = models.BooleanField(
        'Signature Válida',
        default=False,
        help_text='Si la firma de seguridad es válida'
    )
    
    class Meta:
        db_table = 'integraciones_webhook_integracion'
        verbose_name = 'Webhook de Integración'
        verbose_name_plural = 'Webhooks de Integración'
        indexes = [
            models.Index(fields=['proveedor'], name='idx_webhook_proveedor'),
            models.Index(fields=['tipo_webhook'], name='idx_webhook_tipo'),
            models.Index(fields=['estado'], name='idx_webhook_estado'),
            models.Index(fields=['fecha_recepcion'], name='idx_webhook_fecha'),
            models.Index(fields=['documento_electronico'], name='idx_webhook_documento'),
            models.Index(fields=['ip_origen'], name='idx_webhook_ip'),
            models.Index(fields=['activo'], name='idx_webhook_activo'),
        ]
        ordering = ['-fecha_recepcion']
    
    def __str__(self):
        return f"{self.proveedor.codigo} - {self.tipo_webhook} - {self.fecha_recepcion}"
    
    def procesar(self):
        """Procesa el webhook recibido"""
        try:
            # Validar signature si es necesario
            if not self._validar_signature():
                self.estado = 'error'
                self.error_procesamiento = 'Signature inválida'
                self.save()
                return False
            
            # Procesar según tipo
            if self.tipo_webhook == 'documento_procesado':
                self._procesar_documento_procesado()
            elif self.tipo_webhook == 'documento_rechazado':
                self._procesar_documento_rechazado()
            elif self.tipo_webhook == 'respuesta_sunat':
                self._procesar_respuesta_sunat()
            else:
                self._procesar_generico()
            
            self.estado = 'procesado'
            self.fecha_procesamiento = timezone.now()
            self.save()
            
            return True
        
        except Exception as e:
            self.estado = 'error'
            self.error_procesamiento = str(e)
            self.fecha_procesamiento = timezone.now()
            self.save()
            return False
    
    def _validar_signature(self):
        """Valida la firma del webhook"""
        # Implementar validación específica por proveedor
        return True
    
    def _procesar_documento_procesado(self):
        """Procesa webhook de documento procesado"""
        try:
            payload = json.loads(self.payload_recibido)
            if self.documento_electronico:
                self.documento_electronico.estado = 'aceptado_sunat'
                self.documento_electronico.save()
                self.mensaje_procesamiento = "Documento actualizado a aceptado"
        except json.JSONDecodeError:
            raise ValueError("Payload inválido")
    
    def _procesar_documento_rechazado(self):
        """Procesa webhook de documento rechazado"""
        try:
            payload = json.loads(self.payload_recibido)
            if self.documento_electronico:
                self.documento_electronico.estado = 'rechazado_sunat'
                self.documento_electronico.save()
                self.mensaje_procesamiento = "Documento actualizado a rechazado"
        except json.JSONDecodeError:
            raise ValueError("Payload inválido")
    
    def _procesar_respuesta_sunat(self):
        """Procesa webhook de respuesta SUNAT"""
        try:
            payload = json.loads(self.payload_recibido)
            if self.documento_electronico:
                # Actualizar información SUNAT
                if 'hash' in payload:
                    self.documento_electronico.hash_documento = payload['hash']
                if 'qr' in payload:
                    self.documento_electronico.codigo_qr = payload['qr']
                
                self.documento_electronico.save()
                self.mensaje_procesamiento = "Información SUNAT actualizada"
        except json.JSONDecodeError:
            raise ValueError("Payload inválido")
    
    def _procesar_generico(self):
        """Procesamiento genérico de webhook"""
        self.mensaje_procesamiento = "Webhook recibido y registrado"