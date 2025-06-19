"""
Signals de la aplicación Core - FELICITAFAC
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Empresa, Sucursal
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Empresa)
def empresa_post_save(sender, instance, created, **kwargs):
    """
    Signal ejecutado después de guardar una empresa
    """
    if created:
        logger.info(f"Nueva empresa creada: {instance.razon_social} ({instance.ruc})")
        
        # Crear sucursal principal automáticamente
        if not instance.sucursales.exists():
            Sucursal.objects.create(
                empresa=instance,
                codigo='PRIN01',
                nombre='Sucursal Principal',
                direccion=instance.direccion,
                telefono=instance.telefono,
                email=instance.email,
                es_principal=True
            )
            logger.info(f"Sucursal principal creada automáticamente para {instance.razon_social}")


@receiver(pre_save, sender=Sucursal)
def sucursal_pre_save(sender, instance, **kwargs):
    """
    Signal ejecutado antes de guardar una sucursal
    """
    if instance.es_principal:
        # Asegurar que solo haya una sucursal principal por empresa
        Sucursal.objects.filter(
            empresa=instance.empresa,
            es_principal=True
        ).exclude(pk=instance.pk).update(es_principal=False)


@receiver(post_save, sender=Sucursal)
def sucursal_post_save(sender, instance, created, **kwargs):
    """
    Signal ejecutado después de guardar una sucursal
    """
    if created:
        logger.info(f"Nueva sucursal creada: {instance.nombre} ({instance.codigo}) para {instance.empresa.razon_social}")