"""
Serializers de Usuarios - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Serializers para API REST con JWT
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from .models import Usuario, Rol, PerfilUsuario, SesionUsuario


class RolSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Rol
    """
    cantidad_usuarios = serializers.SerializerMethodField()
    
    class Meta:
        model = Rol
        fields = [
            'id', 'nombre', 'codigo', 'descripcion', 'nivel_acceso',
            'permisos_especiales', 'cantidad_usuarios', 'activo',
            'fecha_creacion'
        ]
        read_only_fields = ['fecha_creacion', 'cantidad_usuarios']
    
    def get_cantidad_usuarios(self, obj):
        """Obtener cantidad de usuarios con este rol"""
        return obj.usuario_set.count()


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para el perfil del usuario
    """
    edad = serializers.SerializerMethodField()
    
    class Meta:
        model = PerfilUsuario
        fields = [
            'fecha_nacimiento', 'direccion', 'ciudad', 'pais',
            'tema_oscuro', 'idioma', 'timezone', 'configuracion_dashboard',
            'cargo', 'empresa', 'biografia', 'avatar', 'edad'
        ]
    
    def get_edad(self, obj):
        """Calcular edad del usuario"""
        return obj.get_edad()


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer principal para el modelo Usuario
    """
    perfil = PerfilUsuarioSerializer(read_only=True)
    rol_detalle = RolSerializer(source='rol', read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    puede_login = serializers.SerializerMethodField()
    tiempo_sin_login = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    confirmar_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombres', 'apellidos', 'nombre_completo',
            'tipo_documento', 'numero_documento', 'telefono',
            'estado_usuario', 'rol', 'rol_detalle', 'perfil',
            'is_active', 'is_staff', 'fecha_ultimo_login',
            'intentos_login_fallidos', 'debe_cambiar_password',
            'notificaciones_email', 'notificaciones_sistema',
            'puede_login', 'tiempo_sin_login', 'fecha_creacion',
            'password', 'confirmar_password'
        ]
        read_only_fields = [
            'fecha_ultimo_login', 'intentos_login_fallidos',
            'fecha_creacion', 'nombre_completo', 'puede_login',
            'tiempo_sin_login'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8},
            'email': {'required': True},
            'nombres': {'required': True},
            'apellidos': {'required': True},
            'numero_documento': {'required': True},
            'rol': {'required': True}
        }
    
    def get_nombre_completo(self, obj):
        """Obtener nombre completo del usuario"""
        return obj.get_nombre_completo()
    
    def get_puede_login(self, obj):
        """Verificar si el usuario puede hacer login"""
        return obj.puede_hacer_login()
    
    def get_tiempo_sin_login(self, obj):
        """Calcular tiempo sin login"""
        if not obj.fecha_ultimo_login:
            return "Nunca"
        
        delta = timezone.now() - obj.fecha_ultimo_login
        if delta.days > 0:
            return f"{delta.days} días"
        elif delta.seconds > 3600:
            horas = delta.seconds // 3600
            return f"{horas} horas"
        else:
            minutos = delta.seconds // 60
            return f"{minutos} minutos"
    
    def validate_email(self, value):
        """Validar email único"""
        if self.instance and self.instance.email == value:
            return value
        
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este email."
            )
        
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Email no válido.")
        
        return value
    
    def validate_numero_documento(self, value):
        """Validar número de documento único"""
        if self.instance and self.instance.numero_documento == value:
            return value
        
        if Usuario.objects.filter(numero_documento=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este número de documento."
            )
        
        return value
    
    def validate(self, attrs):
        """Validaciones generales"""
        # Validar contraseñas
        password = attrs.get('password')
        confirmar_password = attrs.get('confirmar_password')
        
        if password and confirmar_password:
            if password != confirmar_password:
                raise serializers.ValidationError({
                    'confirmar_password': 'Las contraseñas no coinciden.'
                })
        
        # Validar tipo y número de documento
        tipo_documento = attrs.get('tipo_documento', 
            self.instance.tipo_documento if self.instance else None
        )
        numero_documento = attrs.get('numero_documento',
            self.instance.numero_documento if self.instance else None
        )
        
        if tipo_documento == 'dni' and numero_documento:
            if len(numero_documento) != 8 or not numero_documento.isdigit():
                raise serializers.ValidationError({
                    'numero_documento': 'DNI debe tener 8 dígitos.'
                })
        elif tipo_documento == 'ruc' and numero_documento:
            if len(numero_documento) != 11 or not numero_documento.isdigit():
                raise serializers.ValidationError({
                    'numero_documento': 'RUC debe tener 11 dígitos.'
                })
        
        return attrs
    
    def create(self, validated_data):
        """Crear nuevo usuario"""
        password = validated_data.pop('password', None)
        validated_data.pop('confirmar_password', None)
        
        usuario = Usuario.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Crear perfil automáticamente
        PerfilUsuario.objects.create(usuario=usuario)
        
        return usuario
    
    def update(self, instance, validated_data):
        """Actualizar usuario existente"""
        password = validated_data.pop('password', None)
        validated_data.pop('confirmar_password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
            instance.debe_cambiar_password = False
            instance.fecha_cambio_password = timezone.now()
        
        instance.save()
        return instance


class UsuarioResumenSerializer(serializers.ModelSerializer):
    """
    Serializer resumido para listados
    """
    nombre_completo = serializers.SerializerMethodField()
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombre_completo', 'rol_nombre',
            'estado_usuario', 'is_active', 'fecha_ultimo_login'
        ]
    
    def get_nombre_completo(self, obj):
        return obj.get_nombre_completo()


class TokenPersonalizadoSerializer(TokenObtainPairSerializer):
    """
    Serializer personalizado para JWT tokens
    Incluye información adicional del usuario en el token
    """
    
    def validate(self, attrs):
        """Validar credenciales y agregar información extra"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(
                'Email y contraseña son requeridos.'
            )
        
        try:
            usuario = Usuario.objects.select_related('rol').get(email=email)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError(
                'Credenciales inválidas.'
            )
        
        # Verificar si puede hacer login
        if not usuario.puede_hacer_login():
            if usuario.estado_usuario == 'bloqueado':
                raise serializers.ValidationError(
                    'Usuario bloqueado. Contacte al administrador.'
                )
            elif usuario.estado_usuario == 'suspendido':
                raise serializers.ValidationError(
                    'Usuario suspendido temporalmente.'
                )
            elif not usuario.is_active:
                raise serializers.ValidationError(
                    'Usuario desactivado.'
                )
            else:
                raise serializers.ValidationError(
                    'Usuario no puede acceder al sistema.'
                )
        
        # Autenticar usuario
        usuario_autenticado = authenticate(email=email, password=password)
        
        if not usuario_autenticado:
            # Incrementar intentos fallidos
            usuario.incrementar_intentos_fallidos()
            raise serializers.ValidationError(
                'Credenciales inválidas.'
            )
        
        # Reset intentos fallidos en login exitoso
        usuario.resetear_intentos_fallidos()
        
        # Obtener tokens
        data = super().validate(attrs)
        
        # Agregar información del usuario al response
        data.update({
            'usuario': {
                'id': usuario.id,
                'email': usuario.email,
                'nombres': usuario.nombres,
                'apellidos': usuario.apellidos,
                'nombre_completo': usuario.get_nombre_completo(),
                'rol': {
                    'id': usuario.rol.id,
                    'nombre': usuario.rol.nombre,
                    'codigo': usuario.rol.codigo,
                    'nivel_acceso': usuario.rol.nivel_acceso
                },
                'estado_usuario': usuario.estado_usuario,
                'debe_cambiar_password': usuario.debe_cambiar_password,
                'notificaciones_email': usuario.notificaciones_email,
                'perfil': {
                    'tema_oscuro': usuario.perfil.tema_oscuro if hasattr(usuario, 'perfil') else False,
                    'idioma': usuario.perfil.idioma if hasattr(usuario, 'perfil') else 'es'
                }
            }
        })
        
        return data
    
    @classmethod
    def get_token(cls, user):
        """Personalizar claims del token"""
        token = super().get_token(user)
        
        # Agregar claims personalizados
        token['email'] = user.email
        token['nombres'] = user.nombres
        token['apellidos'] = user.apellidos
        token['rol_codigo'] = user.rol.codigo if user.rol else None
        token['nivel_acceso'] = user.rol.nivel_acceso if user.rol else 1
        token['estado_usuario'] = user.estado_usuario
        
        return token


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de nuevos usuarios
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    confirmar_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    acepta_terminos = serializers.BooleanField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'email', 'password', 'confirmar_password',
            'nombres', 'apellidos', 'tipo_documento',
            'numero_documento', 'telefono', 'acepta_terminos'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'nombres': {'required': True},
            'apellidos': {'required': True},
            'numero_documento': {'required': True}
        }
    
    def validate_acepta_terminos(self, value):
        """Validar que acepta términos y condiciones"""
        if not value:
            raise serializers.ValidationError(
                'Debe aceptar los términos y condiciones.'
            )
        return value
    
    def validate(self, attrs):
        """Validaciones para registro"""
        # Validar contraseñas
        if attrs['password'] != attrs['confirmar_password']:
            raise serializers.ValidationError({
                'confirmar_password': 'Las contraseñas no coinciden.'
            })
        
        # Validar email único
        if Usuario.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                'email': 'Ya existe un usuario con este email.'
            })
        
        # Validar documento único
        if Usuario.objects.filter(numero_documento=attrs['numero_documento']).exists():
            raise serializers.ValidationError({
                'numero_documento': 'Ya existe un usuario con este documento.'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Crear usuario registrado"""
        validated_data.pop('confirmar_password')
        validated_data.pop('acepta_terminos')
        
        # Asignar rol de cliente por defecto
        rol_cliente = Rol.objects.get(codigo='cliente')
        validated_data['rol'] = rol_cliente
        validated_data['estado_usuario'] = 'activo'
        
        usuario = Usuario.objects.create_user(**validated_data)
        
        # Crear perfil
        PerfilUsuario.objects.create(usuario=usuario)
        
        return usuario


class CambiarPasswordSerializer(serializers.Serializer):
    """
    Serializer para cambio de contraseña
    """
    password_actual = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    password_nueva = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    confirmar_password_nueva = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_password_actual(self, value):
        """Validar contraseña actual"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                'Contraseña actual incorrecta.'
            )
        return value
    
    def validate(self, attrs):
        """Validar que las nuevas contraseñas coincidan"""
        if attrs['password_nueva'] != attrs['confirmar_password_nueva']:
            raise serializers.ValidationError({
                'confirmar_password_nueva': 'Las contraseñas no coinciden.'
            })
        return attrs
    
    def save(self):
        """Cambiar contraseña del usuario"""
        user = self.context['request'].user
        user.set_password(self.validated_data['password_nueva'])
        user.debe_cambiar_password = False
        user.fecha_cambio_password = timezone.now()
        user.save(update_fields=[
            'password', 'debe_cambiar_password', 'fecha_cambio_password'
        ])
        return user


class SesionUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para sesiones de usuario
    """
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)
    tiempo_activa = serializers.SerializerMethodField()
    esta_expirada = serializers.SerializerMethodField()
    
    class Meta:
        model = SesionUsuario
        fields = [
            'id', 'usuario_email', 'ip_address', 'user_agent',
            'fecha_inicio', 'fecha_ultimo_uso', 'activa',
            'fecha_expiracion', 'tiempo_activa', 'esta_expirada'
        ]
        read_only_fields = [
            'token_sesion', 'fecha_inicio', 'usuario_email',
            'tiempo_activa', 'esta_expirada'
        ]
    
    def get_tiempo_activa(self, obj):
        """Calcular tiempo que la sesión ha estado activa"""
        if obj.activa:
            delta = timezone.now() - obj.fecha_inicio
        else:
            delta = obj.fecha_ultimo_uso - obj.fecha_inicio
        
        return int(delta.total_seconds() / 60)  # minutos
    
    def get_esta_expirada(self, obj):
        """Verificar si la sesión está expirada"""
        return obj.esta_expirada()


class ActualizarPerfilSerializer(serializers.ModelSerializer):
    """
    Serializer para actualizar perfil de usuario
    """
    class Meta:
        model = PerfilUsuario
        fields = [
            'fecha_nacimiento', 'direccion', 'ciudad', 'pais',
            'tema_oscuro', 'idioma', 'timezone',
            'cargo', 'empresa', 'biografia', 'avatar',
            'configuracion_dashboard'
        ]
    
    def update(self, instance, validated_data):
        """Actualizar perfil"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance