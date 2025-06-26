"""
Configuración de la aplicación Integraciones - FELICITAFAC
"""

from django.apps import AppConfig


class IntegracionesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aplicaciones.integraciones'
    verbose_name = 'Integraciones Externas'