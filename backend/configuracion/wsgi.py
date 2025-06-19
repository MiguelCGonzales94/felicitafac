"""
Configuración WSGI para FELICITAFAC
Sistema de Facturación Electrónica para Perú
Optimizado para hosting compartido con cPanel
"""

import os
import sys
from pathlib import Path
from django.core.wsgi import get_wsgi_application

# Configurar la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Configurar el módulo de settings por defecto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.local')

# Configuración específica para hosting compartido
def setup_hosting_compartido():
    """
    Configuración específica para hosting compartido
    """
    try:
        # Detectar si estamos en hosting compartido
        if 'public_html' in str(BASE_DIR):
            # Configuraciones específicas para cPanel/hosting compartido
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.produccion')
            
            # Agregar rutas específicas del hosting
            hosting_paths = [
                str(BASE_DIR),
                str(BASE_DIR.parent),
                str(BASE_DIR / 'aplicaciones'),
            ]
            
            for path in hosting_paths:
                if path not in sys.path:
                    sys.path.insert(0, path)
                    
        else:
            # Configuración para desarrollo local
            os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.local')
            
    except Exception as e:
        # En caso de error, usar configuración por defecto
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.base')

# Configurar rutas
setup_hosting_compartido()

# Obtener la aplicación WSGI
application = get_wsgi_application()