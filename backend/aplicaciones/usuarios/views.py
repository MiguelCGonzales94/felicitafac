"""
Views de Usuarios - FELICITAFAC
Sistema de Facturación Electrónica para Perú
API REST con autenticación JWT
"""

from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import logout
from django.utils import timezone
from django.db.models import Q, Count
from django.core.exceptions import ValidationError
from datetime import timedelta
import logging

from .models import Usuario, Rol, PerfilUsuario, SesionUsuario
from .serializers import (
    UsuarioSerializer, UsuarioResumenSerializer, RolSerializer,
    PerfilUsuarioSerializer, TokenPersonalizadoSerializer,
    RegistroUsuarioSerializer, CambiarPasswordSerializer,
    SesionUsuarioSerializer, ActualizarPerfilSerializer
)
from aplicaciones.core.permissions import EsAdministrador, EsContadorOAdministrador

# Configurar logger
logger = logging.getLogger(__name__)


class LoginPersonalizadoView(TokenObtainPairView):
    """
    Vista personalizada para login con JWT
    Maneja autenticación y creación de sesiones
    """
    serializer_class = TokenPersonalizadoSerializer
    
    def post(self, request, *args, **kwargs):
        """Procesar login y crear sesión"""
        try:
            response = super().post(request, *args, **kwargs)
            
            if response.status_code == 200:
                # Obtener datos del usuario desde el response
                usuario_data = response.data.get('usuario', {})
                email = usuario_data.get('email')
                
                if email:
                    try:
                        usuario = Usuario.objects.get(email=email)
                        
                        # Crear sesión de usuario
                        self._crear_sesion_usuario(request, usuario, response.data['access'])
                        
                        logger.info(f"Login exitoso para usuario: {email}")
                        
                        # Agregar información adicional al response
                        response.data.update({
                            'mensaje': 'Login exitoso',
                            'fecha_login': timezone.now().isoformat(),
                            'expires_in': 3600  # 1 hora
                        })
                        
                    except Usuario.DoesNotExist:
                        logger.error(f"Usuario no encontrado después del login: {email}")
            
            return response
            
        except Exception as e:
            logger.error(f"Error en login: {str(e)}")
            return Response({
                'error': 'Error interno del servidor',
                'mensaje': 'Intente nuevamente más tarde'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _crear_sesion_usuario(self, request, usuario, token):
        """Crear registro de sesión del usuario"""
        try:
            # Obtener información del request
            ip_address = self._get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Crear sesión
            SesionUsuario.objects.create(
                usuario=usuario,
                token_sesion=token[:50],  # Solo los primeros 50 caracteres
                ip_address=ip_address,
                user_agent=user_agent,
                fecha_expiracion=timezone.now() + timedelta(hours=24)
            )
            
            # Limpiar sesiones expiradas del usuario
            self._limpiar_sesiones_expiradas(usuario)
            
        except Exception as e:
            logger.error(f"Error creando sesión: {str(e)}")
    
    def _get_client_ip(self, request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
        return ip
    
    def _limpiar_sesiones_expiradas(self, usuario):
        """Limpiar sesiones expiradas del usuario"""
        SesionUsuario.objects.filter(
            usuario=usuario,
            fecha_expiracion__lt=timezone.now()
        ).update(activa=False)


class LogoutView(APIView):
    """
    Vista para logout de usuario
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Procesar logout"""
        try:
            # Obtener token del header
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
                
                # Cerrar sesión en la base de datos
                SesionUsuario.objects.filter(
                    usuario=request.user,
                    token_sesion__startswith=token[:50],
                    activa=True
                ).update(activa=False)
            
            # Blacklist del refresh token si se proporciona
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception as e:
                    logger.warning(f"Error blacklisting token: {str(e)}")
            
            logger.info(f"Logout exitoso para usuario: {request.user.email}")
            
            return Response({
                'mensaje': 'Logout exitoso',
                'fecha_logout': timezone.now().isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error en logout: {str(e)}")
            return Response({
                'error': 'Error procesando logout'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegistroUsuarioView(generics.CreateAPIView):
    """
    Vista para registro de nuevos usuarios (clientes)
    """
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Crear nuevo usuario registrado"""
        try:
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                usuario = serializer.save()
                
                logger.info(f"Usuario registrado exitosamente: {usuario.email}")
                
                return Response({
                    'mensaje': 'Usuario registrado exitosamente',
                    'usuario': {
                        'id': usuario.id,
                        'email': usuario.email,
                        'nombre_completo': usuario.get_nombre_completo()
                    },
                    'proximo_paso': 'Inicie sesión con sus credenciales'
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'errores': serializer.errors,
                'mensaje': 'Error en los datos proporcionados'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error en registro: {str(e)}")
            return Response({
                'error': 'Error interno del servidor',
                'mensaje': 'Intente nuevamente más tarde'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PerfilUsuarioView(generics.RetrieveUpdateAPIView):
    """
    Vista para obtener y actualizar perfil del usuario autenticado
    """
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Obtener usuario autenticado"""
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        """Obtener perfil del usuario"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            
            # Agregar estadísticas adicionales
            data = serializer.data
            data.update({
                'estadisticas': self._get_estadisticas_usuario(instance),
                'sesiones_activas': self._get_sesiones_activas(instance)
            })
            
            return Response(data)
            
        except Exception as e:
            logger.error(f"Error obteniendo perfil: {str(e)}")
            return Response({
                'error': 'Error obteniendo perfil de usuario'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_estadisticas_usuario(self, usuario):
        """Obtener estadísticas del usuario"""
        try:
            return {
                'total_sesiones': usuario.sesiones.count(),
                'sesiones_activas': usuario.sesiones.filter(activa=True).count(),
                'ultimo_login': usuario.fecha_ultimo_login.isoformat() if usuario.fecha_ultimo_login else None,
                'dias_registrado': (timezone.now() - usuario.fecha_creacion).days,
                'intentos_fallidos': usuario.intentos_login_fallidos
            }
        except:
            return {}
    
    def _get_sesiones_activas(self, usuario):
        """Obtener sesiones activas del usuario"""
        try:
            sesiones = usuario.sesiones.filter(
                activa=True,
                fecha_expiracion__gt=timezone.now()
            ).order_by('-fecha_ultimo_uso')[:5]
            
            return SesionUsuarioSerializer(sesiones, many=True).data
        except:
            return []


class ActualizarPerfilView(generics.UpdateAPIView):
    """
    Vista para actualizar perfil extendido del usuario
    """
    serializer_class = ActualizarPerfilSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Obtener perfil del usuario autenticado"""
        perfil, created = PerfilUsuario.objects.get_or_create(
            usuario=self.request.user
        )
        return perfil
    
    def update(self, request, *args, **kwargs):
        """Actualizar perfil del usuario"""
        try:
            partial = kwargs.pop('partial', True)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                
                logger.info(f"Perfil actualizado para usuario: {request.user.email}")
                
                return Response({
                    'mensaje': 'Perfil actualizado exitosamente',
                    'perfil': serializer.data
                })
            
            return Response({
                'errores': serializer.errors,
                'mensaje': 'Error en los datos del perfil'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error actualizando perfil: {str(e)}")
            return Response({
                'error': 'Error actualizando perfil'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CambiarPasswordView(APIView):
    """
    Vista para cambiar contraseña del usuario
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Cambiar contraseña del usuario"""
        try:
            serializer = CambiarPasswordSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                
                logger.info(f"Contraseña cambiada para usuario: {request.user.email}")
                
                return Response({
                    'mensaje': 'Contraseña cambiada exitosamente',
                    'fecha_cambio': timezone.now().isoformat()
                })
            
            return Response({
                'errores': serializer.errors,
                'mensaje': 'Error en los datos proporcionados'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error cambiando contraseña: {str(e)}")
            return Response({
                'error': 'Error cambiando contraseña'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ListaUsuariosView(generics.ListAPIView):
    """
    Vista para listar usuarios (solo administradores y contadores)
    """
    serializer_class = UsuarioResumenSerializer
    permission_classes = [EsContadorOAdministrador]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado_usuario', 'rol__codigo', 'is_active']
    search_fields = ['nombres', 'apellidos', 'email', 'numero_documento']
    ordering_fields = ['nombres', 'apellidos', 'fecha_creacion', 'fecha_ultimo_login']
    ordering = ['nombres', 'apellidos']
    
    def get_queryset(self):
        """Obtener queryset de usuarios"""
        return Usuario.objects.select_related('rol').filter(
            activo=True
        )
    
    def list(self, request, *args, **kwargs):
        """Listar usuarios con estadísticas"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            
            # Agregar estadísticas generales
            estadisticas = self._get_estadisticas_generales(queryset)
            
            return Response({
                'usuarios': serializer.data,
                'estadisticas': estadisticas
            })
            
        except Exception as e:
            logger.error(f"Error listando usuarios: {str(e)}")
            return Response({
                'error': 'Error obteniendo lista de usuarios'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_estadisticas_generales(self, queryset):
        """Obtener estadísticas generales de usuarios"""
        try:
            total = queryset.count()
            activos = queryset.filter(estado_usuario='activo', is_active=True).count()
            
            # Usuarios por rol
            por_rol = queryset.values('rol__nombre').annotate(
                cantidad=Count('id')
            ).order_by('rol__nombre')
            
            return {
                'total_usuarios': total,
                'usuarios_activos': activos,
                'usuarios_inactivos': total - activos,
                'distribucion_por_rol': list(por_rol)
            }
        except:
            return {}


class DetalleUsuarioView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar usuario específico
    Solo administradores
    """
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdministrador]
    lookup_field = 'id'
    
    def get_queryset(self):
        """Obtener queryset de usuarios"""
        return Usuario.objects.select_related('rol').prefetch_related(
            'perfil', 'sesiones'
        )
    
    def destroy(self, request, *args, **kwargs):
        """Desactivar usuario en lugar de eliminar"""
        try:
            instance = self.get_object()
            instance.activo = False
            instance.is_active = False
            instance.estado_usuario = 'inactivo'
            instance.save()
            
            logger.info(f"Usuario desactivado: {instance.email}")
            
            return Response({
                'mensaje': 'Usuario desactivado exitosamente'
            })
            
        except Exception as e:
            logger.error(f"Error desactivando usuario: {str(e)}")
            return Response({
                'error': 'Error desactivando usuario'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CrearUsuarioView(generics.CreateAPIView):
    """
    Vista para crear nuevos usuarios (solo administradores)
    """
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdministrador]
    
    def create(self, request, *args, **kwargs):
        """Crear nuevo usuario"""
        try:
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                usuario = serializer.save()
                
                logger.info(f"Usuario creado por admin: {usuario.email}")
                
                return Response({
                    'mensaje': 'Usuario creado exitosamente',
                    'usuario': UsuarioSerializer(usuario).data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'errores': serializer.errors,
                'mensaje': 'Error en los datos del usuario'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creando usuario: {str(e)}")
            return Response({
                'error': 'Error creando usuario'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ListaRolesView(generics.ListAPIView):
    """
    Vista para listar roles disponibles
    """
    serializer_class = RolSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Obtener roles activos"""
        return Rol.objects.filter(activo=True).order_by('nivel_acceso')


class EstadisticasUsuariosView(APIView):
    """
    Vista para obtener estadísticas de usuarios
    Solo administradores y contadores
    """
    permission_classes = [EsContadorOAdministrador]
    
    def get(self, request):
        """Obtener estadísticas completas de usuarios"""
        try:
            stats = self._calcular_estadisticas()
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error calculando estadísticas: {str(e)}")
            return Response({
                'error': 'Error calculando estadísticas'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calcular_estadisticas(self):
        """Calcular estadísticas detalladas"""
        usuarios = Usuario.objects.select_related('rol')
        
        # Estadísticas básicas
        total = usuarios.count()
        activos = usuarios.filter(estado_usuario='activo', is_active=True).count()
        
        # Por estado
        por_estado = usuarios.values('estado_usuario').annotate(
            cantidad=Count('id')
        )
        
        # Por rol
        por_rol = usuarios.values('rol__nombre', 'rol__codigo').annotate(
            cantidad=Count('id')
        ).order_by('rol__nivel_acceso')
        
        # Usuarios con login reciente (última semana)
        hace_semana = timezone.now() - timedelta(days=7)
        con_login_reciente = usuarios.filter(
            fecha_ultimo_login__gte=hace_semana
        ).count()
        
        # Sesiones activas
        sesiones_activas = SesionUsuario.objects.filter(
            activa=True,
            fecha_expiracion__gt=timezone.now()
        ).count()
        
        return {
            'resumen': {
                'total_usuarios': total,
                'usuarios_activos': activos,
                'usuarios_inactivos': total - activos,
                'con_login_reciente': con_login_reciente,
                'sesiones_activas': sesiones_activas
            },
            'distribucion_por_estado': list(por_estado),
            'distribucion_por_rol': list(por_rol),
            'fecha_calculo': timezone.now().isoformat()
        }


# Vistas basadas en funciones para casos específicos

@api_view(['POST'])
@permission_classes([EsAdministrador])
def resetear_password_usuario(request, usuario_id):
    """
    Resetear contraseña de un usuario específico
    """
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        
        # Generar nueva contraseña temporal
        nueva_password = f"temporal{usuario_id}{timezone.now().strftime('%d%m')}"
        
        usuario.set_password(nueva_password)
        usuario.debe_cambiar_password = True
        usuario.fecha_cambio_password = timezone.now()
        usuario.save()
        
        logger.info(f"Password reseteada para usuario: {usuario.email}")
        
        return Response({
            'mensaje': 'Contraseña reseteada exitosamente',
            'password_temporal': nueva_password,
            'nota': 'El usuario debe cambiar la contraseña en el próximo login'
        })
        
    except Usuario.DoesNotExist:
        return Response({
            'error': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error reseteando password: {str(e)}")
        return Response({
            'error': 'Error reseteando contraseña'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([EsAdministrador])
def bloquear_usuario(request, usuario_id):
    """
    Bloquear/desbloquear usuario
    """
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        accion = request.data.get('accion', 'bloquear')
        
        if accion == 'bloquear':
            usuario.bloquear_usuario("Bloqueado por administrador")
            mensaje = 'Usuario bloqueado exitosamente'
        else:
            usuario.desbloquear_usuario()
            mensaje = 'Usuario desbloqueado exitosamente'
        
        logger.info(f"Usuario {accion}: {usuario.email}")
        
        return Response({
            'mensaje': mensaje,
            'usuario_estado': usuario.estado_usuario
        })
        
    except Usuario.DoesNotExist:
        return Response({
            'error': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error {accion} usuario: {str(e)}")
        return Response({
            'error': f'Error {accion} usuario'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def validar_token(request):
    """
    Validar si el token JWT es válido
    """
    try:
        return Response({
            'valido': True,
            'usuario': {
                'id': request.user.id,
                'email': request.user.email,
                'nombre_completo': request.user.get_nombre_completo(),
                'rol': request.user.rol.codigo if request.user.rol else None
            },
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return Response({
            'valido': False,
            'error': str(e)
        }, status=status.HTTP_401_UNAUTHORIZED)