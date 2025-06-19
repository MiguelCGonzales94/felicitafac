#!/usr/bin/env python
"""
FELICITAFAC - Sistema de Facturación Electrónica para Perú
Utilidad de línea de comandos para tareas administrativas Django
Configurado para MySQL y hosting compartido
"""

import os
import sys
from pathlib import Path

if __name__ == '__main__':
    # Configurar la ruta base del proyecto
    BASE_DIR = Path(__file__).resolve().parent
    
    # Agregar el directorio del proyecto al path
    sys.path.insert(0, str(BASE_DIR))
    
    # Configurar el módulo de settings por defecto
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'configuracion.settings.local')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "No se pudo importar Django. ¿Estás seguro de que está instalado y "
            "disponible en tu variable de entorno PYTHONPATH? ¿Olvidaste "
            "activar un entorno virtual?"
        ) from exc
    
    # Verificar la configuración de MySQL antes de ejecutar comandos
    if len(sys.argv) > 1:
        comando = sys.argv[1]
        
        # Comandos que requieren verificación de base de datos
        comandos_bd = [
            'migrate',
            'makemigrations', 
            'runserver',
            'shell',
            'createsuperuser',
            'loaddata',
            'dumpdata'
        ]
        
        if comando in comandos_bd:
            try:
                # Importar settings para verificar configuración
                from django.conf import settings
                
                # Verificar configuración MySQL
                db_config = settings.DATABASES['default']
                if db_config['ENGINE'] != 'django.db.backends.mysql':
                    print("⚠️  ADVERTENCIA: El motor de base de datos no es MySQL")
                
                # Mostrar información de conexión
                print(f"🔧 Usando configuración: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
                print(f"📊 Base de datos: {db_config['NAME']} en {db_config['HOST']}:{db_config['PORT']}")
                
            except Exception as e:
                print(f"❌ Error al verificar configuración: {e}")
                print("💡 Asegúrate de que el archivo .env esté configurado correctamente")
    
    # Ejecutar el comando Django
    execute_from_command_line(sys.argv)