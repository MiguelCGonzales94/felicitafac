"""
Signals de Usuarios - FELICITAFAC CORREGIDO
Sistema de Facturación Electrónica para Perú
Signals para modelo Usuario con métodos correctos
"""

import logging
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.utils import timezone
from .models import Usuario, PerfilUsuario

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Usuario)
def usuario_post_save(sender, instance, created, **kwargs):
    """
    Signal ejecutado después de guardar un usuario
    """
    if created:
        # Usuario recién creado
        logger.info(f"Nuevo usuario creado: {instance.get_nombre_completo()} ({instance.email})")
        
        # Crear perfil automáticamente si no existe
        if not hasattr(instance, 'perfil'):
            try:
                PerfilUsuario.objects.create(
                    usuario=instance,
                    ciudad='Lima',
                    pais='Perú',
                    cargo=instance.nombres,
                    empresa='FELICITAFAC'
                )
                logger.info(f"Perfil creado automáticamente para {instance.email}")
            except Exception as e:
                logger.error(f"Error creando perfil para {instance.email}: {e}")
    else:
        # Usuario actualizado
        logger.info(f"Usuario actualizado: {instance.get_nombre_completo()} ({instance.email})")


@receiver(pre_delete, sender=Usuario)
def usuario_pre_delete(sender, instance, **kwargs):
    """
    Signal ejecutado antes de eliminar un usuario
    """
    logger.warning(f"Usuario eliminado: {instance.get_nombre_completo()} ({instance.email})")


@receiver(user_logged_in)
def usuario_logged_in(sender, user, request, **kwargs):
    """
    Signal ejecutado cuando un usuario inicia sesión
    """
    if hasattr(user, 'get_nombre_completo'):
        logger.info(f"Usuario inició sesión: {user.get_nombre_completo()} ({user.email})")
        
        # Actualizar fecha de último login
        user.fecha_ultimo_login = timezone.now()
        user.intentos_login_fallidos = 0
        user.save(update_fields=['fecha_ultimo_login', 'intentos_login_fallidos'])


@receiver(user_logged_out)
def usuario_logged_out(sender, user, request, **kwargs):
    """
    Signal ejecutado cuando un usuario cierra sesión
    """
    if user and hasattr(user, 'get_nombre_completo'):
        logger.info(f"Usuario cerró sesión: {user.get_nombre_completo()} ({user.email})")


@receiver(post_save, sender=PerfilUsuario)
def perfil_post_save(sender, instance, created, **kwargs):
    """
    Signal ejecutado después de guardar un perfil
    """
    if created:
        logger.info(f"Perfil creado para usuario: {instance.usuario.get_nombre_completo()}")
    else:
        logger.info(f"Perfil actualizado para usuario: {instance.usuario.get_nombre_completo()}")