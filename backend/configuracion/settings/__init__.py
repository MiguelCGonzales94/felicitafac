"""
FELICITAFAC - Configuraciones del sistema
Importa automáticamente la configuración apropiada según el entorno
"""

import os

# Detectar entorno y cargar configuración apropiada
if os.environ.get('DJANGO_SETTINGS_MODULE') is None:
    if os.environ.get('DEBUG', 'True').lower() == 'true':
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.local')
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.produccion')