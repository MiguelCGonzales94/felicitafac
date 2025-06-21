"""
Modelos de Usuario - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Autenticación y roles optimizados para MySQL
"""

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from django.utils import timezone
from aplicaciones.core.models import ModeloBase


class GestorUsuarioPersonalizado(BaseUserManager):
    """
    Gestor personalizado para el modelo Usuario
    Maneja creación de usuarios y superusuarios
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """Crear usuario normal"""
        if not email:
            raise ValueError('El usuario debe tener un email válido')
        
        email = self.normalize_email(email)
        usuario = self.model(email=email, **extra_fields)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Crear superusuario"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('estado_usuario', 'activo')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superusuario debe tener is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class Rol(ModeloBase):
    """
    Modelo de Roles del sistema
    Define los diferentes tipos de usuarios
    """
    
    TIPOS_ROL = [
        ('administrador', 'Administrador'),
        ('contador', 'Contador'),
        ('vendedor', 'Vendedor'),
        ('cliente', 'Cliente'),
    ]
    
    nombre = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Nombre del Rol',
        help_text='Nombre único del rol en el sistema'
    )
    codigo = models.CharField(
        max_length=20,
        choices=TIPOS_ROL,
        unique=True,
        verbose_name='Código del Rol',
        help_text='Código interno del rol'
    )
    descripcion = models.TextField(
        verbose_name='Descripción',
        help_text='Descripción detallada del rol y sus permisos'
    )
    nivel_acceso = models.PositiveIntegerField(
        default=1,
        verbose_name='Nivel de Acceso',
        help_text='Nivel numérico de acceso (mayor número = más permisos)'
    )
    permisos_especiales = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Permisos Especiales',
        help_text='Configuración JSON de permisos específicos'
    )
    
    class Meta:
        db_table = 'usuarios_rol'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        ordering = ['nivel_acceso', 'nombre']
        indexes = [
            models.Index(fields=['codigo'], name='idx_rol_codigo'),
            models.Index(fields=['nivel_acceso'], name='idx_rol_nivel'),
        ]
    
    def __str__(self):
        return f"{self.nombre} ({self.codigo})"
    
    def tiene_permiso(self, permiso):
        """Verificar si el rol tiene un permiso específico"""
        return self.permisos_especiales.get(permiso, False)


class Usuario(AbstractBaseUser, PermissionsMixin, ModeloBase):
    """
    Modelo personalizado de Usuario
    Extiende AbstractBaseUser para autenticación completa
    Optimizado para MySQL y hosting compartido
    """
    
    ESTADOS_USUARIO = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('suspendido', 'Suspendido'),
        ('bloqueado', 'Bloqueado'),
    ]
    
    TIPOS_DOCUMENTO = [
        ('dni', 'DNI'),
        ('ruc', 'RUC'),
        ('carnet_extranjeria', 'Carnet de Extranjería'),
        ('pasaporte', 'Pasaporte'),
    ]
    
    # Campos básicos de autenticación
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator()],
        verbose_name='Email',
        help_text='Email único para login'
    )
    
    # Información personal
    nombres = models.CharField(
        max_length=100,
        verbose_name='Nombres',
        help_text='Nombres completos del usuario'
    )
    apellidos = models.CharField(
        max_length=100,
        verbose_name='Apellidos',
        help_text='Apellidos completos del usuario'
    )
    tipo_documento = models.CharField(
        max_length=20,
        choices=TIPOS_DOCUMENTO,
        default='dni',
        verbose_name='Tipo de Documento'
    )
    numero_documento = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Número de Documento',
        validators=[
            RegexValidator(
                regex=r'^[0-9A-Z]{8,20}$',
                message='Formato de documento inválido'
            )
        ]
    )
    telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Teléfono',
        validators=[
            RegexValidator(
                regex=r'^\+?[0-9\s\-\(\)]{7,20}$',
                message='Formato de teléfono inválido'
            )
        ]
    )
    
    # Configuración de cuenta
    estado_usuario = models.CharField(
        max_length=20,
        choices=ESTADOS_USUARIO,
        default='activo',
        verbose_name='Estado del Usuario'
    )
    rol = models.ForeignKey(
        Rol,
        on_delete=models.PROTECT,
        verbose_name='Rol del Usuario',
        help_text='Rol asignado que define permisos'
    )
    
    # Campos Django Auth
    is_staff = models.BooleanField(
        default=False,
        verbose_name='Es Staff',
        help_text='Puede acceder al panel de administración'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Usuario Activo',
        help_text='Usuario puede hacer login'
    )
    
    # Campos de seguridad
    fecha_ultimo_login = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Último Login'
    )
    intentos_login_fallidos = models.PositiveIntegerField(
        default=0,
        verbose_name='Intentos de Login Fallidos'
    )
    fecha_bloqueo = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Bloqueo'
    )
    debe_cambiar_password = models.BooleanField(
        default=False,
        verbose_name='Debe Cambiar Contraseña'
    )
    fecha_cambio_password = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Última Cambio de Contraseña'
    )
    
    # Configuración de notificaciones
    notificaciones_email = models.BooleanField(
        default=True,
        verbose_name='Recibir Notificaciones por Email'
    )
    notificaciones_sistema = models.BooleanField(
        default=True,
        verbose_name='Mostrar Notificaciones en Sistema'
    )
    
    # Manager personalizado
    objects = GestorUsuarioPersonalizado()
    
    # Configuración de autenticación
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombres', 'apellidos', 'numero_documento']
    
    class Meta:
        db_table = 'usuarios_usuario'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['nombres', 'apellidos']
        indexes = [
            models.Index(fields=['email'], name='idx_usuario_email'),
            models.Index(fields=['numero_documento'], name='idx_usuario_documento'),
            models.Index(fields=['estado_usuario'], name='idx_usuario_estado'),
            models.Index(fields=['rol'], name='idx_usuario_rol'),
            models.Index(fields=['is_active'], name='idx_usuario_activo'),
        ]
    
    def __str__(self):
        return f"{self.get_nombre_completo()} ({self.email})"
    
    def get_nombre_completo(self):
        """Obtener nombre completo del usuario"""
        return f"{self.nombres} {self.apellidos}".strip()
    
    def get_nombre_corto(self):
        """Obtener nombre corto del usuario"""
        return self.nombres
    
    def puede_hacer_login(self):
        """Verificar si el usuario puede hacer login"""
        return (
            self.is_active and 
            self.estado_usuario == 'activo' and
            self.intentos_login_fallidos < 5
        )
    
    def bloquear_usuario(self, razon="Demasiados intentos fallidos"):
        """Bloquear usuario temporalmente"""
        self.estado_usuario = 'bloqueado'
        self.fecha_bloqueo = timezone.now()
        self.save(update_fields=['estado_usuario', 'fecha_bloqueo'])
    
    def desbloquear_usuario(self):
        """Desbloquear usuario"""
        self.estado_usuario = 'activo'
        self.fecha_bloqueo = None
        self.intentos_login_fallidos = 0
        self.save(update_fields=['estado_usuario', 'fecha_bloqueo', 'intentos_login_fallidos'])
    
    def incrementar_intentos_fallidos(self):
        """Incrementar contador de intentos fallidos"""
        self.intentos_login_fallidos += 1
        if self.intentos_login_fallidos >= 5:
            self.bloquear_usuario()
        else:
            self.save(update_fields=['intentos_login_fallidos'])
    
    def resetear_intentos_fallidos(self):
        """Resetear contador de intentos fallidos"""
        self.intentos_login_fallidos = 0
        self.fecha_ultimo_login = timezone.now()
        self.save(update_fields=['intentos_login_fallidos', 'fecha_ultimo_login'])
    
    def tiene_permiso_modulo(self, modulo):
        """Verificar si tiene permiso para un módulo específico"""
        if not self.rol:
            return False
        return self.rol.tiene_permiso(modulo)
    
    def es_administrador(self):
        """Verificar si es administrador"""
        return self.rol and self.rol.codigo == 'administrador'
    
    def es_contador(self):
        """Verificar si es contador"""
        return self.rol and self.rol.codigo == 'contador'
    
    def es_vendedor(self):
        """Verificar si es vendedor"""
        return self.rol and self.rol.codigo == 'vendedor'
    
    def es_cliente(self):
        """Verificar si es cliente"""
        return self.rol and self.rol.codigo == 'cliente'


class PerfilUsuario(ModeloBase):
    """
    Perfil extendido del usuario
    Información adicional no crítica para autenticación
    """
    
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name='perfil',
        verbose_name='Usuario'
    )
    
    # Información adicional
    fecha_nacimiento = models.DateField(
        null=True,
        blank=True,
        verbose_name='Fecha de Nacimiento'
    )
    direccion = models.TextField(
        blank=True,
        verbose_name='Dirección'
    )
    ciudad = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Ciudad'
    )
    pais = models.CharField(
        max_length=50,
        default='Perú',
        verbose_name='País'
    )
    
    # Configuración de interfaz
    tema_oscuro = models.BooleanField(
        default=False,
        verbose_name='Tema Oscuro'
    )
    idioma = models.CharField(
        max_length=10,
        default='es',
        choices=[
            ('es', 'Español'),
            ('en', 'English'),
        ],
        verbose_name='Idioma'
    )
    timezone = models.CharField(
        max_length=50,
        default='America/Lima',
        verbose_name='Zona Horaria'
    )
    
    # Configuraciones de dashboard
    configuracion_dashboard = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Configuración Dashboard',
        help_text='Configuración personalizada del dashboard'
    )
    
    # Información profesional
    cargo = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Cargo'
    )
    empresa = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Empresa'
    )
    biografia = models.TextField(
        blank=True,
        verbose_name='Biografía'
    )
    
    # Avatar y archivos
    avatar = models.ImageField(
        upload_to='usuarios/avatars/',
        null=True,
        blank=True,
        verbose_name='Avatar'
    )
    
    class Meta:
        db_table = 'usuarios_perfil'
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuario'
    
    def __str__(self):
        return f"Perfil de {self.usuario.get_nombre_completo()}"
    
    def get_edad(self):
        """Calcular edad del usuario"""
        if not self.fecha_nacimiento:
            return None
        
        from datetime import date
        today = date.today()
        return today.year - self.fecha_nacimiento.year - (
            (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )


class SesionUsuario(ModeloBase):
    """
    Modelo para rastrear sesiones de usuario
    Útil para seguridad y analytics
    """
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='sesiones',
        verbose_name='Usuario'
    )
    token_sesion = models.CharField(
        max_length=255,
        unique=True,
        verbose_name='Token de Sesión'
    )
    ip_address = models.GenericIPAddressField(
        verbose_name='Dirección IP'
    )
    user_agent = models.TextField(
        verbose_name='User Agent'
    )
    fecha_inicio = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Inicio'
    )
    fecha_ultimo_uso = models.DateTimeField(
        auto_now=True,
        verbose_name='Último Uso'
    )
    activa = models.BooleanField(
        default=True,
        verbose_name='Sesión Activa'
    )
    fecha_expiracion = models.DateTimeField(
        verbose_name='Fecha de Expiración'
    )
    
    class Meta:
        db_table = 'usuarios_sesion'
        verbose_name = 'Sesión de Usuario'
        verbose_name_plural = 'Sesiones de Usuario'
        ordering = ['-fecha_ultimo_uso']
        indexes = [
            models.Index(fields=['usuario'], name='idx_sesion_usuario'),
            models.Index(fields=['token_sesion'], name='idx_sesion_token'),
            models.Index(fields=['activa'], name='idx_sesion_activa'),
            models.Index(fields=['fecha_expiracion'], name='idx_sesion_expiracion'),
        ]
    
    def __str__(self):
        return f"Sesión de {self.usuario.email} desde {self.ip_address}"
    
    def esta_expirada(self):
        """Verificar si la sesión está expirada"""
        return timezone.now() > self.fecha_expiracion
    
    def cerrar_sesion(self):
        """Cerrar la sesión"""
        self.activa = False
        self.save(update_fields=['activa'])