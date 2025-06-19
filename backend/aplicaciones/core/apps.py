"""
Configuración de la aplicación Core - FELICITAFAC
"""

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aplicaciones.core'
    verbose_name = 'Core del Sistema'
    
    def ready(self):
        """Configuración al inicializar la aplicación"""
        import aplicaciones.core.signals