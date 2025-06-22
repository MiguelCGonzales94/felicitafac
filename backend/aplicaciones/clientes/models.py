"""
Modelos de Clientes - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Optimizado para MySQL y hosting compartido
"""

from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.core.exceptions import ValidationError
from aplicaciones.core.models import ModeloBase


class TipoDocumento(ModeloBase):
    """
    Modelo para tipos de documentos de identidad
    Según normativa SUNAT Perú
    """
    
    TIPOS_DOCUMENTO = [
        ('1', 'DNI - Documento Nacional de Identidad'),
        ('4', 'Carnet de Extranjería'),
        ('6', 'RUC - Registro Único de Contribuyentes'),
        ('7', 'Pasaporte'),
        ('11', 'Partida de Nacimiento'),
        ('12', 'Tarjeta de Identidad de FF.AA.'),
        ('0', 'Otros'),
    ]
    
    codigo = models.CharField(
        'Código SUNAT',
        max_length=2,
        choices=TIPOS_DOCUMENTO,
        unique=True,
        db_index=True,
        help_text='Código según tabla 2 SUNAT'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre del tipo de documento'
    )
    
    longitud_minima = models.PositiveIntegerField(
        'Longitud Mínima',
        default=8,
        help_text='Número mínimo de caracteres'
    )
    
    longitud_maxima = models.PositiveIntegerField(
        'Longitud Máxima',
        default=11,
        help_text='Número máximo de caracteres'
    )
    
    solo_numeros = models.BooleanField(
        'Solo Números',
        default=True,
        help_text='Si el documento solo acepta números'
    )
    
    requiere_validacion = models.BooleanField(
        'Requiere Validación',
        default=False,
        help_text='Si requiere validación con algoritmo'
    )
    
    class Meta:
        db_table = 'clientes_tipo_documento'
        verbose_name = 'Tipo de Documento'
        verbose_name_plural = 'Tipos de Documento'
        indexes = [
            models.Index(fields=['codigo'], name='idx_tipo_doc_codigo'),
            models.Index(fields=['activo'], name='idx_tipo_doc_activo'),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class Cliente(ModeloBase):
    """
    Modelo principal de Clientes
    Maneja personas naturales y jurídicas según SUNAT
    """
    
    TIPOS_CLIENTE = [
        ('persona_natural', 'Persona Natural'),
        ('persona_juridica', 'Persona Jurídica'),
        ('extranjero', 'Extranjero'),
    ]
    
    # Validadores personalizados
    validador_dni = RegexValidator(
        regex=r'^\d{8}$',
        message='DNI debe tener exactamente 8 dígitos'
    )
    
    validador_ruc = RegexValidator(
        regex=r'^\d{11}$',
        message='RUC debe tener exactamente 11 dígitos'
    )
    
    validador_telefono = RegexValidator(
        regex=r'^(\+51)?[0-9]{9,12}$',
        message='Formato de teléfono inválido'
    )
    
    # Campos principales
    tipo_cliente = models.CharField(
        'Tipo de Cliente',
        max_length=20,
        choices=TIPOS_CLIENTE,
        default='persona_natural',
        db_index=True,
        help_text='Tipo de cliente según SUNAT'
    )
    
    tipo_documento = models.ForeignKey(
        TipoDocumento,
        on_delete=models.PROTECT,
        related_name='clientes',
        verbose_name='Tipo de Documento',
        help_text='Tipo de documento de identidad'
    )
    
    numero_documento = models.CharField(
        'Número de Documento',
        max_length=15,
        db_index=True,
        help_text='Número de documento (DNI, RUC, etc.)'
    )
    
    razon_social = models.CharField(
        'Razón Social',
        max_length=200,
        help_text='Razón social o nombres completos'
    )
    
    nombre_comercial = models.CharField(
        'Nombre Comercial',
        max_length=150,
        blank=True,
        null=True,
        help_text='Nombre comercial (opcional)'
    )
    
    # Campos de contacto
    email = models.EmailField(
        'Email',
        blank=True,
        null=True,
        validators=[EmailValidator()],
        help_text='Correo electrónico'
    )
    
    telefono = models.CharField(
        'Teléfono',
        max_length=15,
        blank=True,
        null=True,
        validators=[validador_telefono],
        help_text='Número de teléfono'
    )
    
    celular = models.CharField(
        'Celular',
        max_length=15,
        blank=True,
        null=True,
        validators=[validador_telefono],
        help_text='Número de celular'
    )
    
    # Dirección fiscal
    direccion = models.TextField(
        'Dirección',
        max_length=300,
        help_text='Dirección fiscal completa'
    )
    
    ubigeo = models.CharField(
        'Ubigeo',
        max_length=6,
        validators=[RegexValidator(
            regex=r'^\d{6}$',
            message='Ubigeo debe tener 6 dígitos'
        )],
        help_text='Código de ubigeo (6 dígitos)'
    )
    
    departamento = models.CharField(
        'Departamento',
        max_length=50,
        help_text='Departamento según ubigeo'
    )
    
    provincia = models.CharField(
        'Provincia',
        max_length=50,
        help_text='Provincia según ubigeo'
    )
    
    distrito = models.CharField(
        'Distrito',
        max_length=50,
        help_text='Distrito según ubigeo'
    )
    
    # Configuración comercial
    descuento_maximo = models.DecimalField(
        'Descuento Máximo (%)',
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text='Descuento máximo permitido'
    )
    
    credito_limite = models.DecimalField(
        'Límite de Crédito',
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text='Límite de crédito en soles'
    )
    
    dias_credito = models.PositiveIntegerField(
        'Días de Crédito',
        default=0,
        help_text='Días de crédito otorgados'
    )
    
    es_agente_retencion = models.BooleanField(
        'Es Agente de Retención',
        default=False,
        help_text='Si es agente de retención IGV'
    )
    
    es_buen_contribuyente = models.BooleanField(
        'Buen Contribuyente',
        default=False,
        help_text='Si está en régimen de buen contribuyente'
    )
    
    # Control comercial
    bloqueado = models.BooleanField(
        'Bloqueado',
        default=False,
        help_text='Si el cliente está bloqueado para ventas'
    )
    
    motivo_bloqueo = models.TextField(
        'Motivo de Bloqueo',
        blank=True,
        null=True,
        help_text='Razón del bloqueo'
    )
    
    # Campos de auditoría adicionales
    fecha_primer_compra = models.DateTimeField(
        'Fecha Primera Compra',
        blank=True,
        null=True,
        help_text='Fecha de primera compra'
    )
    
    fecha_ultima_compra = models.DateTimeField(
        'Fecha Última Compra',
        blank=True,
        null=True,
        help_text='Fecha de última compra'
    )
    
    total_compras = models.DecimalField(
        'Total Compras',
        max_digits=12,
        decimal_places=2,
        default=0.00,
        help_text='Total acumulado de compras'
    )
    
    numero_compras = models.PositiveIntegerField(
        'Número de Compras',
        default=0,
        help_text='Cantidad total de compras'
    )
    
    # Campos de validación
    validado_sunat = models.BooleanField(
        'Validado SUNAT',
        default=False,
        help_text='Si fue validado con servicios SUNAT'
    )
    
    fecha_validacion_sunat = models.DateTimeField(
        'Fecha Validación SUNAT',
        blank=True,
        null=True,
        help_text='Fecha de última validación SUNAT'
    )
    
    estado_sunat = models.CharField(
        'Estado SUNAT',
        max_length=20,
        blank=True,
        null=True,
        help_text='Estado según consulta SUNAT'
    )
    
    condicion_sunat = models.CharField(
        'Condición SUNAT',
        max_length=50,
        blank=True,
        null=True,
        help_text='Condición según consulta SUNAT'
    )
    
    class Meta:
        db_table = 'clientes_cliente'
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        unique_together = [['tipo_documento', 'numero_documento']]
        indexes = [
            models.Index(fields=['numero_documento'], name='idx_cliente_numero_doc'),
            models.Index(fields=['tipo_cliente'], name='idx_cliente_tipo'),
            models.Index(fields=['activo'], name='idx_cliente_activo'),
            models.Index(fields=['fecha_creacion'], name='idx_cliente_fecha'),
            models.Index(fields=['razon_social'], name='idx_cliente_razon_social'),
            models.Index(fields=['ubigeo'], name='idx_cliente_ubigeo'),
            models.Index(fields=['validado_sunat'], name='idx_cliente_validado'),
            models.Index(fields=['bloqueado'], name='idx_cliente_bloqueado'),
        ]
    
    def __str__(self):
        return f"{self.numero_documento} - {self.razon_social}"
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar documento según tipo
        if self.tipo_documento and self.numero_documento:
            if self.tipo_documento.codigo == '1':  # DNI
                if len(self.numero_documento) != 8 or not self.numero_documento.isdigit():
                    raise ValidationError({'numero_documento': 'DNI debe tener 8 dígitos'})
            elif self.tipo_documento.codigo == '6':  # RUC
                if len(self.numero_documento) != 11 or not self.numero_documento.isdigit():
                    raise ValidationError({'numero_documento': 'RUC debe tener 11 dígitos'})
                if not self._validar_ruc(self.numero_documento):
                    raise ValidationError({'numero_documento': 'RUC inválido según algoritmo'})
    
    def _validar_ruc(self, ruc):
        """Validación de RUC según algoritmo SUNAT"""
        if len(ruc) != 11 or not ruc.isdigit():
            return False
        
        # Factores de multiplicación
        factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
        suma = sum(int(ruc[i]) * factores[i] for i in range(10))
        resto = suma % 11
        digito_verificador = 11 - resto if resto > 1 else resto
        
        return int(ruc[10]) == digito_verificador
    
    def save(self, *args, **kwargs):
        """Override save para validaciones adicionales"""
        # Convertir tipo_cliente a persona_juridica si es RUC
        if self.tipo_documento and self.tipo_documento.codigo == '6':
            self.tipo_cliente = 'persona_juridica'
        
        # Normalizar texto
        self.razon_social = self.razon_social.strip().upper()
        if self.nombre_comercial:
            self.nombre_comercial = self.nombre_comercial.strip().upper()
        
        super().save(*args, **kwargs)
    
    def obtener_nombre_completo(self):
        """Retorna el nombre completo del cliente"""
        if self.tipo_cliente == 'persona_juridica':
            return self.nombre_comercial or self.razon_social
        return self.razon_social
    
    def obtener_datos_facturacion(self):
        """Retorna datos formateados para facturación"""
        return {
            'tipo_documento': self.tipo_documento.codigo,
            'numero_documento': self.numero_documento,
            'razon_social': self.razon_social,
            'nombre_comercial': self.nombre_comercial,
            'direccion': self.direccion,
            'email': self.email,
            'telefono': self.telefono or self.celular,
            'ubigeo': self.ubigeo,
            'departamento': self.departamento,
            'provincia': self.provincia,
            'distrito': self.distrito,
        }
    
    def puede_comprar(self):
        """Verifica si el cliente puede realizar compras"""
        if not self.activo or self.bloqueado:
            return False, "Cliente inactivo o bloqueado"
        
        return True, "Cliente habilitado para compras"
    
    def actualizar_estadisticas_compra(self, monto):
        """Actualiza estadísticas de compra del cliente"""
        from django.utils import timezone
        
        self.total_compras += monto
        self.numero_compras += 1
        self.fecha_ultima_compra = timezone.now()
        
        if not self.fecha_primer_compra:
            self.fecha_primer_compra = timezone.now()
        
        self.save(update_fields=[
            'total_compras', 'numero_compras', 
            'fecha_ultima_compra', 'fecha_primer_compra'
        ])


class ContactoCliente(ModeloBase):
    """
    Modelo para contactos adicionales del cliente
    Permite múltiples contactos por cliente
    """
    
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='contactos',
        verbose_name='Cliente'
    )
    
    nombres = models.CharField(
        'Nombres',
        max_length=100,
        help_text='Nombres del contacto'
    )
    
    apellidos = models.CharField(
        'Apellidos',
        max_length=100,
        help_text='Apellidos del contacto'
    )
    
    cargo = models.CharField(
        'Cargo',
        max_length=80,
        blank=True,
        null=True,
        help_text='Cargo en la empresa'
    )
    
    email = models.EmailField(
        'Email',
        blank=True,
        null=True,
        help_text='Email del contacto'
    )
    
    telefono = models.CharField(
        'Teléfono',
        max_length=15,
        blank=True,
        null=True,
        help_text='Teléfono del contacto'
    )
    
    es_principal = models.BooleanField(
        'Es Principal',
        default=False,
        help_text='Si es el contacto principal'
    )
    
    recibe_facturas = models.BooleanField(
        'Recibe Facturas',
        default=True,
        help_text='Si recibe copias de facturas'
    )
    
    notas = models.TextField(
        'Notas',
        blank=True,
        null=True,
        help_text='Notas adicionales del contacto'
    )
    
    class Meta:
        db_table = 'clientes_contacto_cliente'
        verbose_name = 'Contacto de Cliente'
        verbose_name_plural = 'Contactos de Clientes'
        indexes = [
            models.Index(fields=['cliente'], name='idx_contacto_cliente'),
            models.Index(fields=['es_principal'], name='idx_contacto_principal'),
            models.Index(fields=['activo'], name='idx_contacto_activo'),
        ]
    
    def __str__(self):
        return f"{self.nombres} {self.apellidos} - {self.cliente.razon_social}"
    
    def obtener_nombre_completo(self):
        """Retorna el nombre completo del contacto"""
        return f"{self.nombres} {self.apellidos}".strip()