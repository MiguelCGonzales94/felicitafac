"""
Configuración de la aplicación Usuarios - FELICITAFAC
"""

from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aplicaciones.usuarios'
    verbose_name = 'Gestión de Usuarios'
    
    def ready(self):
        """Configuración al inicializar la aplicación"""
        import aplicaciones.usuarios.signals