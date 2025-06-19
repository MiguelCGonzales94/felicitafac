"""
Configuración ASGI para FELICITAFAC
Sistema de Facturación Electrónica para Perú
Soporte para WebSockets y async (futuro)
"""

import os
import sys
from pathlib import Path
from django.core.asgi import get_asgi_application

# Configurar la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Configurar el módulo de settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.local')

# Obtener la aplicación ASGI
django_asgi_app = get_asgi_application()

# Aplicación ASGI principal
application = django_asgi_app

# Configuración futura para WebSockets (cuando se implemente)
"""
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import aplicaciones.notificaciones.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            aplicaciones.notificaciones.routing.websocket_urlpatterns
        )
    ),
})
"""