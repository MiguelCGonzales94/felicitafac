"""
Admin de Usuarios - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Panel de administración optimizado para MySQL
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django import forms

from .models import Usuario, Rol, PerfilUsuario, SesionUsuario


class FormularioCrearUsuario(forms.ModelForm):
    """
    Formulario para crear nuevos usuarios
    """
    password1 = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput,
        help_text='Mínimo 8 caracteres'
    )
    password2 = forms.CharField(
        label='Confirmar Contraseña',
        widget=forms.PasswordInput,
        help_text='Ingrese la misma contraseña'
    )

    class Meta:
        model = Usuario
        fields = (
            'email', 'nombres', 'apellidos', 'tipo_documento', 
            'numero_documento', 'telefono', 'rol', 'estado_usuario'
        )

    def clean_password2(self):
        """Validar que las contraseñas coincidan"""
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Las contraseñas no coinciden")
        return password2

    def save(self, commit=True):
        """Guardar usuario con contraseña encriptada"""
        usuario = super().save(commit=False)
        usuario.set_password(self.cleaned_data["password1"])
        if commit:
            usuario.save()
        return usuario


class FormularioCambiarUsuario(forms.ModelForm):
    """
    Formulario para editar usuarios existentes
    """
    password = ReadOnlyPasswordHashField(
        label="Contraseña",
        help_text=(
            "Las contraseñas no se almacenan en texto plano, por lo que no hay "
            "forma de ver la contraseña de este usuario, pero puede cambiarla "
            "usando <a href=\"../password/\">este formulario</a>."
        )
    )

    class Meta:
        model = Usuario
        fields = (
            'email', 'password', 'nombres', 'apellidos', 'tipo_documento',
            'numero_documento', 'telefono', 'rol', 'estado_usuario',
            'is_active', 'is_staff', 'is_superuser'
        )

    def clean_password(self):
        """Retornar valor inicial de password"""
        return self.initial["password"]


class PerfilUsuarioInline(admin.StackedInline):
    """
    Inline para el perfil de usuario
    """
    model = PerfilUsuario
    can_delete = False
    verbose_name = 'Perfil'
    verbose_name_plural = 'Perfil'
    fields = (
        ('fecha_nacimiento', 'telefono'),
        'direccion',
        ('ciudad', 'pais'),
        ('tema_oscuro', 'idioma', 'timezone'),
        ('cargo', 'empresa'),
        'biografia',
        'avatar'
    )
    extra = 0


class SesionUsuarioInline(admin.TabularInline):
    """
    Inline para sesiones de usuario
    """
    model = SesionUsuario
    extra = 0
    readonly_fields = (
        'token_sesion', 'ip_address', 'user_agent',
        'fecha_inicio', 'fecha_ultimo_uso', 'estado_sesion'
    )
    fields = (
        'ip_address', 'fecha_inicio', 'fecha_ultimo_uso',
        'estado_sesion', 'fecha_expiracion'
    )
    
    def estado_sesion(self, obj):
        """Mostrar estado de la sesión con colores"""
        if obj.activa and not obj.esta_expirada():
            return format_html(
                '<span style="color: green; font-weight: bold;">●</span> Activa'
            )
        elif obj.esta_expirada():
            return format_html(
                '<span style="color: red; font-weight: bold;">●</span> Expirada'
            )
        else:
            return format_html(
                '<span style="color: gray; font-weight: bold;">●</span> Cerrada'
            )
    estado_sesion.short_description = 'Estado'


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    """
    Admin para el modelo Rol
    """
    list_display = (
        'nombre', 'codigo', 'nivel_acceso', 'cantidad_usuarios', 
        'fecha_creacion', 'activo'
    )
    list_filter = ('codigo', 'nivel_acceso', 'activo', 'fecha_creacion')
    search_fields = ('nombre', 'codigo', 'descripcion')
    ordering = ('nivel_acceso', 'nombre')
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'codigo', 'descripcion')
        }),
        ('Configuración', {
            'fields': ('nivel_acceso', 'permisos_especiales', 'activo')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        })
    )
    
    def cantidad_usuarios(self, obj):
        """Mostrar cantidad de usuarios con este rol"""
        cantidad = obj.usuario_set.count()
        url = reverse('admin:usuarios_usuario_changelist') + f'?rol__id__exact={obj.id}'
        return format_html(
            '<a href="{}" title="Ver usuarios con este rol">{} usuarios</a>',
            url, cantidad
        )
    cantidad_usuarios.short_description = 'Usuarios'
    
    def get_queryset(self, request):
        """Optimizar consulta con prefetch"""
        queryset = super().get_queryset(request)
        return queryset.prefetch_related('usuario_set')


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """
    Admin personalizado para el modelo Usuario
    """
    form = FormularioCambiarUsuario
    add_form = FormularioCrearUsuario
    
    # Listado principal
    list_display = (
        'email', 'nombre_completo', 'rol', 'estado_usuario',
        'ultimo_login_formateado', 'fecha_registro', 'badge_activo'
    )
    list_filter = (
        'estado_usuario', 'rol', 'is_active', 'is_staff',
        'fecha_creacion', 'tipo_documento'
    )
    search_fields = ('email', 'nombres', 'apellidos', 'numero_documento')
    ordering = ('nombres', 'apellidos')
    filter_horizontal = ('groups', 'user_permissions')
    
    # Campos readonly
    readonly_fields = (
        'fecha_creacion', 'fecha_actualizacion', 'fecha_ultimo_login',
        'intentos_login_fallidos', 'fecha_cambio_password'
    )
    
    # Fieldsets para edición
    fieldsets = (
        ('Credenciales', {
            'fields': ('email', 'password')
        }),
        ('Información Personal', {
            'fields': (
                ('nombres', 'apellidos'),
                ('tipo_documento', 'numero_documento'),
                'telefono'
            )
        }),
        ('Configuración de Cuenta', {
            'fields': (
                'rol', 'estado_usuario',
                ('is_active', 'is_staff', 'is_superuser')
            )
        }),
        ('Notificaciones', {
            'fields': ('notificaciones_email', 'notificaciones_sistema'),
            'classes': ('collapse',)
        }),
        ('Seguridad', {
            'fields': (
                'fecha_ultimo_login', 'intentos_login_fallidos',
                'fecha_bloqueo', 'debe_cambiar_password',
                'fecha_cambio_password'
            ),
            'classes': ('collapse',)
        }),
        ('Permisos', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Fechas Importantes', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        })
    )
    
    # Fieldsets para creación
    add_fieldsets = (
        ('Crear Nuevo Usuario', {
            'classes': ('wide',),
            'fields': (
                'email', 'password1', 'password2',
                ('nombres', 'apellidos'),
                ('tipo_documento', 'numero_documento'),
                'telefono', 'rol'
            )
        }),
    )
    
    # Inlines
    inlines = [PerfilUsuarioInline, SesionUsuarioInline]
    
    # Métodos personalizados para el listado
    def nombre_completo(self, obj):
        """Mostrar nombre completo del usuario"""
        return obj.get_nombre_completo()
    nombre_completo.short_description = 'Nombre Completo'
    nombre_completo.admin_order_field = 'nombres'
    
    def ultimo_login_formateado(self, obj):
        """Mostrar último login formateado"""
        if obj.fecha_ultimo_login:
            tiempo_transcurrido = timezone.now() - obj.fecha_ultimo_login
            if tiempo_transcurrido.days > 30:
                return format_html(
                    '<span style="color: red;" title="{}">{} días</span>',
                    obj.fecha_ultimo_login.strftime('%d/%m/%Y %H:%M'),
                    tiempo_transcurrido.days
                )
            elif tiempo_transcurrido.days > 7:
                return format_html(
                    '<span style="color: orange;" title="{}">{} días</span>',
                    obj.fecha_ultimo_login.strftime('%d/%m/%Y %H:%M'),
                    tiempo_transcurrido.days
                )
            else:
                return format_html(
                    '<span style="color: green;" title="{}">{} días</span>',
                    obj.fecha_ultimo_login.strftime('%d/%m/%Y %H:%M'),
                    tiempo_transcurrido.days
                )
        return "Nunca"
    ultimo_login_formateado.short_description = 'Último Login'
    ultimo_login_formateado.admin_order_field = 'fecha_ultimo_login'
    
    def fecha_registro(self, obj):
        """Mostrar fecha de registro formateada"""
        return obj.fecha_creacion.strftime('%d/%m/%Y')
    fecha_registro.short_description = 'Registro'
    fecha_registro.admin_order_field = 'fecha_creacion'
    
    def badge_activo(self, obj):
        """Badge visual para estado activo"""
        if obj.is_active and obj.estado_usuario == 'activo':
            return format_html(
                '<span class="badge" style="background-color: #28a745; color: white; '
                'padding: 3px 8px; border-radius: 12px; font-size: 11px;">Activo</span>'
            )
        elif obj.estado_usuario == 'suspendido':
            return format_html(
                '<span class="badge" style="background-color: #ffc107; color: black; '
                'padding: 3px 8px; border-radius: 12px; font-size: 11px;">Suspendido</span>'
            )
        elif obj.estado_usuario == 'bloqueado':
            return format_html(
                '<span class="badge" style="background-color: #dc3545; color: white; '
                'padding: 3px 8px; border-radius: 12px; font-size: 11px;">Bloqueado</span>'
            )
        else:
            return format_html(
                '<span class="badge" style="background-color: #6c757d; color: white; '
                'padding: 3px 8px; border-radius: 12px; font-size: 11px;">Inactivo</span>'
            )
    badge_activo.short_description = 'Estado'
    badge_activo.admin_order_field = 'estado_usuario'
    
    # Actions personalizadas
    actions = ['activar_usuarios', 'desactivar_usuarios', 'resetear_intentos_login']
    
    def activar_usuarios(self, request, queryset):
        """Activar usuarios seleccionados"""
        cantidad = queryset.update(
            estado_usuario='activo',
            is_active=True,
            intentos_login_fallidos=0,
            fecha_bloqueo=None
        )
        self.message_user(
            request,
            f'{cantidad} usuario(s) activado(s) exitosamente.'
        )
    activar_usuarios.short_description = "Activar usuarios seleccionados"
    
    def desactivar_usuarios(self, request, queryset):
        """Desactivar usuarios seleccionados"""
        cantidad = queryset.update(
            estado_usuario='inactivo',
            is_active=False
        )
        self.message_user(
            request,
            f'{cantidad} usuario(s) desactivado(s) exitosamente.'
        )
    desactivar_usuarios.short_description = "Desactivar usuarios seleccionados"
    
    def resetear_intentos_login(self, request, queryset):
        """Resetear intentos de login fallidos"""
        cantidad = queryset.update(
            intentos_login_fallidos=0,
            fecha_bloqueo=None
        )
        # Si estaban bloqueados, activarlos
        queryset.filter(estado_usuario='bloqueado').update(
            estado_usuario='activo'
        )
        self.message_user(
            request,
            f'Intentos de login reseteados para {cantidad} usuario(s).'
        )
    resetear_intentos_login.short_description = "Resetear intentos de login"
    
    def get_queryset(self, request):
        """Optimizar consultas con select_related"""
        queryset = super().get_queryset(request)
        return queryset.select_related('rol').prefetch_related('perfil', 'sesiones')


@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    """
    Admin para el modelo PerfilUsuario
    """
    list_display = (
        'usuario_email', 'nombre_completo', 'edad', 'ciudad',
        'cargo', 'empresa', 'tema_oscuro'
    )
    list_filter = ('tema_oscuro', 'idioma', 'pais', 'fecha_creacion')
    search_fields = (
        'usuario__email', 'usuario__nombres', 'usuario__apellidos',
        'ciudad', 'cargo', 'empresa'
    )
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        ('Usuario', {
            'fields': ('usuario',)
        }),
        ('Información Personal', {
            'fields': (
                'fecha_nacimiento', 'direccion',
                ('ciudad', 'pais')
            )
        }),
        ('Información Profesional', {
            'fields': (
                ('cargo', 'empresa'),
                'biografia'
            )
        }),
        ('Configuración de Interfaz', {
            'fields': (
                ('tema_oscuro', 'idioma', 'timezone'),
                'configuracion_dashboard'
            )
        }),
        ('Avatar', {
            'fields': ('avatar',)
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        })
    )
    
    def usuario_email(self, obj):
        """Mostrar email del usuario"""
        return obj.usuario.email
    usuario_email.short_description = 'Email'
    usuario_email.admin_order_field = 'usuario__email'
    
    def nombre_completo(self, obj):
        """Mostrar nombre completo"""
        return obj.usuario.get_nombre_completo()
    nombre_completo.short_description = 'Nombre'
    nombre_completo.admin_order_field = 'usuario__nombres'
    
    def edad(self, obj):
        """Mostrar edad calculada"""
        edad = obj.get_edad()
        return f"{edad} años" if edad else "No especificada"
    edad.short_description = 'Edad'


@admin.register(SesionUsuario)
class SesionUsuarioAdmin(admin.ModelAdmin):
    """
    Admin para el modelo SesionUsuario
    """
    list_display = (
        'usuario_email', 'ip_address', 'fecha_inicio',
        'fecha_ultimo_uso', 'estado_visual', 'tiempo_activa'
    )
    list_filter = ('activa', 'fecha_inicio', 'fecha_expiracion')
    search_fields = ('usuario__email', 'ip_address', 'user_agent')
    readonly_fields = (
        'token_sesion', 'fecha_creacion', 'fecha_actualizacion',
        'tiempo_activa'
    )
    date_hierarchy = 'fecha_inicio'
    
    fieldsets = (
        ('Sesión', {
            'fields': ('usuario', 'token_sesion', 'activa')
        }),
        ('Información de Conexión', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Fechas', {
            'fields': (
                'fecha_inicio', 'fecha_ultimo_uso',
                'fecha_expiracion', 'tiempo_activa'
            )
        })
    )
    
    def usuario_email(self, obj):
        """Mostrar email del usuario"""
        return obj.usuario.email
    usuario_email.short_description = 'Usuario'
    usuario_email.admin_order_field = 'usuario__email'
    
    def estado_visual(self, obj):
        """Estado visual de la sesión"""
        if obj.activa and not obj.esta_expirada():
            return format_html(
                '<span style="color: green; font-weight: bold;">● Activa</span>'
            )
        elif obj.esta_expirada():
            return format_html(
                '<span style="color: red; font-weight: bold;">● Expirada</span>'
            )
        else:
            return format_html(
                '<span style="color: gray; font-weight: bold;">● Cerrada</span>'
            )
    estado_visual.short_description = 'Estado'
    
    def tiempo_activa(self, obj):
        """Calcular tiempo que la sesión ha estado activa"""
        if obj.activa:
            delta = timezone.now() - obj.fecha_inicio
        else:
            delta = obj.fecha_ultimo_uso - obj.fecha_inicio
        
        dias = delta.days
        horas = delta.seconds // 3600
        minutos = (delta.seconds % 3600) // 60
        
        if dias > 0:
            return f"{dias}d {horas}h {minutos}m"
        elif horas > 0:
            return f"{horas}h {minutos}m"
        else:
            return f"{minutos}m"
    tiempo_activa.short_description = 'Tiempo Activa'
    
    actions = ['cerrar_sesiones']
    
    def cerrar_sesiones(self, request, queryset):
        """Cerrar sesiones seleccionadas"""
        cantidad = 0
        for sesion in queryset:
            if sesion.activa:
                sesion.cerrar_sesion()
                cantidad += 1
        
        self.message_user(
            request,
            f'{cantidad} sesión(es) cerrada(s) exitosamente.'
        )
    cerrar_sesiones.short_description = "Cerrar sesiones seleccionadas"


# Personalización del panel de administración
admin.site.site_header = 'FELICITAFAC - Administración'
admin.site.site_title = 'FELICITAFAC Admin'
admin.site.index_title = 'Panel de Administración del Sistema'