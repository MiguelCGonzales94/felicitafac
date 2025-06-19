"""
Modelos de usuarios - FELICITAFAC
Sistema de autenticación personalizado para facturación electrónica
Optimizado para MySQL y hosting compartido
"""

from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.core.validators import RegexValidator, MinLengthValidator
from django.utils import timezone
from aplicaciones.core.models import ModeloBase, Empresa, Sucursal


class Usuario(AbstractUser, ModeloBase):
    """
    Modelo de usuario personalizado para FELICITAFAC
    Extiende AbstractUser con campos específicos para facturación
    """
    
    # Validadores personalizados
    validador_dni = RegexValidator(
        regex=r'^\d{8}$',
        message='El DNI debe tener exactamente 8 dígitos'
    )
    
    validador_telefono = RegexValidator(
        regex=r'^[\d\s\-\+\(\)]{7,15}$',
        message='Formato de teléfono inválido'
    )
    
    # Redefinir campos base con configuración específica
    email = models.EmailField(
        'Email',
        unique=True,
        db_index=True,
        help_text='Email único del usuario (será usado para login)'
    )
    
    first_name = models.CharField(
        'Nombres',
        max_length=100,
        validators=[MinLengthValidator(2)],
        help_text='Nombres del usuario'
    )
    
    last_name = models.CharField(
        'Apellidos',
        max_length=100,
        validators=[MinLengthValidator(2)],
        help_text='Apellidos del usuario'
    )
    
    # Campos adicionales específicos para Perú
    dni = models.CharField(
        'DNI',
        max_length=8,
        unique=True,
        validators=[validador_dni],
        db_index=True,
        help_text='Documento Nacional de Identidad (8 dígitos)'
    )
    
    telefono = models.CharField(
        'Teléfono',
        max_length=15,
        blank=True,
        null=True,
        validators=[validador_telefono],
        help_text='Número de teléfono'
    )
    
    telefono_emergencia = models.CharField(
        'Teléfono de Emergencia',
        max_length=15,
        blank=True,
        null=True,
        validators=[validador_telefono],
        help_text='Teléfono de contacto de emergencia'
    )
    
    direccion = models.TextField(
        'Dirección',
        max_length=300,
        blank=True,
        null=True,
        help_text='Dirección del usuario'
    )
    
    fecha_nacimiento = models.DateField(
        'Fecha de Nacimiento',
        blank=True,
        null=True,
        help_text='Fecha de nacimiento'
    )
    
    # Campos de configuración profesional
    cargo = models.CharField(
        'Cargo',
        max_length=100,
        blank=True,
        null=True,
        help_text='Cargo del usuario en la empresa'
    )
    
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='usuarios',
        verbose_name='Empresa',
        null=True,  # Temporalmente opcional para migración
        blank=True,  # Temporalmente opcional para migración
        help_text='Empresa a la que pertenece el usuario'
    )
    
    sucursales = models.ManyToManyField(
        Sucursal,
        through='UsuarioSucursal',
        through_fields=('usuario', 'sucursal'),
        related_name='usuarios',
        verbose_name='Sucursales',
        help_text='Sucursales a las que tiene acceso el usuario'
    )
    
    # Avatar y configuración visual
    avatar = models.ImageField(
        'Avatar',
        upload_to='avatars/',
        blank=True,
        null=True,
        help_text='Foto de perfil del usuario'
    )
    
    # Configuración de acceso
    requiere_cambio_password = models.BooleanField(
        'Requiere Cambio de Password',
        default=True,
        help_text='Indica si debe cambiar la contraseña en el próximo login'
    )
    
    intentos_login_fallidos = models.PositiveIntegerField(
        'Intentos de Login Fallidos',
        default=0,
        help_text='Contador de intentos fallidos de login'
    )
    
    fecha_ultimo_login_fallido = models.DateTimeField(
        'Fecha Último Login Fallido',
        blank=True,
        null=True,
        help_text='Fecha del último intento fallido de login'
    )
    
    cuenta_bloqueada_hasta = models.DateTimeField(
        'Cuenta Bloqueada Hasta',
        blank=True,
        null=True,
        help_text='Fecha hasta la cual la cuenta está bloqueada'
    )
    
    # Configuración de notificaciones
    notificar_email = models.BooleanField(
        'Notificar por Email',
        default=True,
        help_text='Recibir notificaciones por email'
    )
    
    notificar_facturas = models.BooleanField(
        'Notificar Facturas',
        default=True,
        help_text='Recibir notificaciones de facturas emitidas'
    )
    
    notificar_reportes = models.BooleanField(
        'Notificar Reportes',
        default=False,
        help_text='Recibir notificaciones de reportes generados'
    )
    
    # Configuración de zona horaria
    zona_horaria = models.CharField(
        'Zona Horaria',
        max_length=50,
        default='America/Lima',
        help_text='Zona horaria del usuario'
    )
    
    # Configuración de interfaz
    tema_interfaz = models.CharField(
        'Tema de Interfaz',
        max_length=20,
        choices=[
            ('claro', 'Claro'),
            ('oscuro', 'Oscuro'),
            ('auto', 'Automático'),
        ],
        default='claro',
        help_text='Tema preferido para la interfaz'
    )
    
    idioma = models.CharField(
        'Idioma',
        max_length=10,
        choices=[
            ('es', 'Español'),
            ('en', 'English'),
        ],
        default='es',
        help_text='Idioma preferido'
    )
    
    # Campos de auditoría adicionales
    creado_por = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='usuarios_creados',
        verbose_name='Creado Por',
        help_text='Usuario que creó este registro'
    )
    
    ultima_actividad = models.DateTimeField(
        'Última Actividad',
        blank=True,
        null=True,
        db_index=True,
        help_text='Fecha y hora de la última actividad del usuario'
    )
    
    # Configuración para autenticación por email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'dni']
    
    class Meta:
        db_table = 'usuarios_usuario'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        indexes = [
            models.Index(fields=['email'], name='idx_usuario_email'),
            models.Index(fields=['dni'], name='idx_usuario_dni'),
            models.Index(fields=['empresa'], name='idx_usuario_empresa'),
            models.Index(fields=['is_active'], name='idx_usuario_activo'),
            models.Index(fields=['ultima_actividad'], name='idx_usuario_actividad'),
            models.Index(fields=['cuenta_bloqueada_hasta'], name='idx_usuario_bloqueado'),
        ]
        
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def clean(self):
        """Validaciones personalizadas"""
        from django.core.exceptions import ValidationError
        
        # Validar DNI con algoritmo
        if self.dni and not self._validar_dni(self.dni):
            raise ValidationError({'dni': 'DNI inválido según algoritmo RENIEC'})
        
        # Validar fecha de nacimiento
        if self.fecha_nacimiento and self.fecha_nacimiento > timezone.now().date():
            raise ValidationError({'fecha_nacimiento': 'La fecha de nacimiento no puede ser futura'})
    
    def _validar_dni(self, dni):
        """Validación básica de DNI peruano"""
        if len(dni) != 8 or not dni.isdigit():
            return False
        
        # Validación básica: DNI no puede empezar con 0
        if dni.startswith('0'):
            return False
        
        return True
    
    def get_full_name(self):
        """Retorna el nombre completo del usuario"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        """Retorna el nombre corto del usuario"""
        return self.first_name
    
    def esta_bloqueado(self):
        """Verifica si la cuenta está bloqueada"""
        if self.cuenta_bloqueada_hasta:
            return timezone.now() < self.cuenta_bloqueada_hasta
        return False
    
    def bloquear_cuenta(self, minutos=30):
        """Bloquea la cuenta por un tiempo determinado"""
        self.cuenta_bloqueada_hasta = timezone.now() + timezone.timedelta(minutes=minutos)
        self.save(update_fields=['cuenta_bloqueada_hasta'])
    
    def desbloquear_cuenta(self):
        """Desbloquea la cuenta"""
        self.cuenta_bloqueada_hasta = None
        self.intentos_login_fallidos = 0
        self.save(update_fields=['cuenta_bloqueada_hasta', 'intentos_login_fallidos'])
    
    def registrar_intento_fallido(self):
        """Registra un intento de login fallido"""
        self.intentos_login_fallidos += 1
        self.fecha_ultimo_login_fallido = timezone.now()
        
        # Bloquear cuenta después de 5 intentos fallidos
        if self.intentos_login_fallidos >= 5:
            self.bloquear_cuenta()
        
        self.save(update_fields=[
            'intentos_login_fallidos',
            'fecha_ultimo_login_fallido',
            'cuenta_bloqueada_hasta'
        ])
    
    def registrar_login_exitoso(self):
        """Registra un login exitoso"""
        self.last_login = timezone.now()
        self.ultima_actividad = timezone.now()
        self.intentos_login_fallidos = 0
        self.fecha_ultimo_login_fallido = None
        self.cuenta_bloqueada_hasta = None
        
        self.save(update_fields=[
            'last_login',
            'ultima_actividad',
            'intentos_login_fallidos',
            'fecha_ultimo_login_fallido',
            'cuenta_bloqueada_hasta'
        ])
    
    def actualizar_actividad(self):
        """Actualiza la fecha de última actividad"""
        self.ultima_actividad = timezone.now()
        self.save(update_fields=['ultima_actividad'])
    
    def obtener_sucursales_acceso(self):
        """Retorna las sucursales a las que tiene acceso el usuario"""
        return self.sucursales.filter(
            usuariosucursal__activo=True,
            activo=True
        )
    
    def tiene_acceso_sucursal(self, sucursal):
        """Verifica si el usuario tiene acceso a una sucursal específica"""
        return self.usuariosucursal_set.filter(
            sucursal=sucursal,
            activo=True
        ).exists()
    
    def obtener_permisos_efectivos(self):
        """Retorna todos los permisos efectivos del usuario"""
        permisos = set()
        
        # Permisos directos del usuario
        permisos.update(self.user_permissions.all())
        
        # Permisos de los grupos del usuario
        for group in self.groups.all():
            permisos.update(group.permissions.all())
        
        return permisos


class UsuarioSucursal(ModeloBase):
    """
    Relación many-to-many entre Usuario y Sucursal con campos adicionales
    """
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        verbose_name='Usuario'
    )
    
    sucursal = models.ForeignKey(
        Sucursal,
        on_delete=models.CASCADE,
        verbose_name='Sucursal'
    )
    
    es_principal = models.BooleanField(
        'Es Sucursal Principal',
        default=False,
        help_text='Indica si es la sucursal principal del usuario'
    )
    
    permisos_especiales = models.JSONField(
        'Permisos Especiales',
        default=dict,
        blank=True,
        help_text='Permisos específicos para esta sucursal'
    )
    
    fecha_asignacion = models.DateTimeField(
        'Fecha de Asignación',
        auto_now_add=True,
        help_text='Fecha de asignación a la sucursal'
    )
    
    asignado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='asignaciones_realizadas',
        verbose_name='Asignado Por',
        help_text='Usuario que realizó la asignación'
    )
    
    class Meta:
        db_table = 'usuarios_usuario_sucursal'
        verbose_name = 'Usuario Sucursal'
        verbose_name_plural = 'Usuario Sucursales'
        unique_together = [('usuario', 'sucursal')]
        indexes = [
            models.Index(fields=['usuario', 'sucursal'], name='idx_usuario_sucursal'),
            models.Index(fields=['es_principal'], name='idx_usuario_sucursal_principal'),
            models.Index(fields=['activo'], name='idx_usuario_sucursal_activo'),
        ]
        
    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.sucursal.nombre}"
    
    def save(self, *args, **kwargs):
        """Validar que solo haya una sucursal principal por usuario"""
        if self.es_principal:
            UsuarioSucursal.objects.filter(
                usuario=self.usuario,
                es_principal=True
            ).exclude(pk=self.pk).update(es_principal=False)
        super().save(*args, **kwargs)


class SesionUsuario(models.Model):
    """
    Modelo para rastrear sesiones de usuarios
    """
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='sesiones',
        verbose_name='Usuario'
    )
    
    session_key = models.CharField(
        'Clave de Sesión',
        max_length=40,
        unique=True,
        db_index=True
    )
    
    ip_address = models.GenericIPAddressField(
        'Dirección IP',
        help_text='Dirección IP desde la cual se conectó'
    )
    
    user_agent = models.TextField(
        'User Agent',
        help_text='Información del navegador'
    )
    
    fecha_inicio = models.DateTimeField(
        'Fecha de Inicio',
        auto_now_add=True,
        help_text='Fecha y hora de inicio de sesión'
    )
    
    fecha_fin = models.DateTimeField(
        'Fecha de Fin',
        blank=True,
        null=True,
        help_text='Fecha y hora de cierre de sesión'
    )
    
    activa = models.BooleanField(
        'Activa',
        default=True,
        db_index=True,
        help_text='Indica si la sesión está activa'
    )
    
    class Meta:
        db_table = 'usuarios_sesion_usuario'
        verbose_name = 'Sesión de Usuario'
        verbose_name_plural = 'Sesiones de Usuarios'
        indexes = [
            models.Index(fields=['usuario', 'activa'], name='idx_sesion_usuario_activa'),
            models.Index(fields=['session_key'], name='idx_sesion_key'),
            models.Index(fields=['fecha_inicio'], name='idx_sesion_inicio'),
        ]
        
    def __str__(self):
        return f"Sesión de {self.usuario.get_full_name()} - {self.fecha_inicio}"
    
    def cerrar_sesion(self):
        """Cierra la sesión"""
        self.fecha_fin = timezone.now()
        self.activa = False
        self.save(update_fields=['fecha_fin', 'activa'])
    
    def duracion(self):
        """Retorna la duración de la sesión"""
        if self.fecha_fin:
            return self.fecha_fin - self.fecha_inicio
        else:
            return timezone.now() - self.fecha_inicio