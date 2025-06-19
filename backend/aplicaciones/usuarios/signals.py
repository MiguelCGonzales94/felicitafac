"""
Signals de la aplicación Usuarios - FELICITAFAC
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from rest_framework.authtoken.models import Token
from .models import Usuario, SesionUsuario
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Usuario)
def usuario_post_save(sender, instance, created, **kwargs):
    """
    Signal ejecutado después de guardar un usuario
    """
    if created:
        # Crear token de autenticación automáticamente
        Token.objects.get_or_create(user=instance)
        logger.info(f"Nuevo usuario creado: {instance.get_full_name()} ({instance.email})")


@receiver(user_logged_in)
def usuario_login_exitoso(sender, request, user, **kwargs):
    """
    Signal ejecutado cuando un usuario hace login exitoso
    """
    if hasattr(user, 'registrar_login_exitoso'):
        user.registrar_login_exitoso()
    
    # Crear sesión de usuario
    if request:
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        session_key = request.session.session_key
        
        SesionUsuario.objects.create(
            usuario=user,
            session_key=session_key or '',
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    logger.info(f"Login exitoso: {user.get_full_name()} ({user.email})")


@receiver(user_logged_out)
def usuario_logout(sender, request, user, **kwargs):
    """
    Signal ejecutado cuando un usuario hace logout
    """
    if user and request:
        session_key = request.session.session_key
        if session_key:
            SesionUsuario.objects.filter(
                usuario=user,
                session_key=session_key,
                activa=True
            ).update(activa=False)
    
    logger.info(f"Logout: {user.get_full_name() if user else 'Usuario anónimo'}")


@receiver(user_login_failed)
def usuario_login_fallido(sender, credentials, request, **kwargs):
    """
    Signal ejecutado cuando falla un login
    """
    email = credentials.get('email') or credentials.get('username')
    
    if email:
        try:
            user = Usuario.objects.get(email=email)
            if hasattr(user, 'registrar_intento_fallido'):
                user.registrar_intento_fallido()
            logger.warning(f"Login fallido para: {email}")
        except Usuario.DoesNotExist:
            logger.warning(f"Intento de login con email inexistente: {email}")
    
    # Log de IP para seguridad
    if request:
        ip_address = get_client_ip(request)
        logger.warning(f"Login fallido desde IP: {ip_address}")


def get_client_ip(request):
    """
    Obtener la IP real del cliente
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip