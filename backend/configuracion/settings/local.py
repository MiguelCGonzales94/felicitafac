"""
Configuración para desarrollo local - FELICITAFAC
MySQL Server nativo sin Docker
"""

from .base import *
from decouple import config

# Configuración de debug para desarrollo
DEBUG = True

# Hosts permitidos en desarrollo
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
]

# Base de datos MySQL local
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='felicitafac_local'),
        'USER': config('DB_USER', default='felicitafac'),
        'PASSWORD': config('DB_PASSWORD', default='felicitafac123'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'autocommit': True,
            # Configuraciones específicas para desarrollo local
            'read_default_file': '/etc/mysql/my.cnf',
        },
        'TEST': {
            'NAME': 'test_felicitafac_local',
            'CHARSET': 'utf8mb4',
            'COLLATION': 'utf8mb4_unicode_ci',
        }
    }
}

# Configuración de conexión MySQL para desarrollo
# Optimizada para MySQL local con mejores timeouts
DATABASES['default']['OPTIONS'].update({
    'connect_timeout': 60,
    'read_timeout': 120,
    'write_timeout': 120,
    'isolation_level': 'read committed',
})

# CORS más permisivo para desarrollo
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Headers adicionales permitidos en desarrollo
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Cache deshabilitado en desarrollo
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Email backend para desarrollo (consola)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Configuración de archivos estáticos para desarrollo
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Logging más detallado para desarrollo
LOGGING['loggers'].update({
    'django.db.backends': {
        'level': 'DEBUG',
        'handlers': ['console'],
        'propagate': False,
    },
    'aplicaciones': {
        'level': 'DEBUG',
        'handlers': ['console', 'file'],
        'propagate': False,
    },
})

# Configuración específica para MySQL en desarrollo local
# Crear directorio de logs si no existe
import os
logs_dir = BASE_DIR / 'logs'
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)

# Configuración de sesiones para desarrollo
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# Configuración de desarrollo para Nubefact (sandbox)
CONFIGURACION_SUNAT.update({
    'NUBEFACT_URL_BASE': 'https://api.nubefact.com',  # URL de testing
    'MODO_DESARROLLO': True,
    'DEBUG_FACTURAS': True,
})

# Configuración adicional para debugging MySQL
if DEBUG:
    # Mostrar queries SQL en consola (solo en desarrollo)
    LOGGING['loggers']['django.db.backends'] = {
        'level': 'DEBUG',
        'handlers': ['console'],
        'propagate': False,
    }

# Configuración específica para desarrollo con React
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",  # Vite dev server
]

# Configuración de Django Extensions (si está instalado)
try:
    import django_extensions
    INSTALLED_APPS += ['django_extensions']
except ImportError:
    pass

# Configuración de Django Debug Toolbar (si está instalado)
#if DEBUG:
#    try:
#        import debug_toolbar
#        INSTALLED_APPS += ['debug_toolbar']
#        MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
#        INTERNAL_IPS = ['127.0.0.1', 'localhost']
#        
#        DEBUG_TOOLBAR_CONFIG = {
#            'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
#        }
#    except ImportError:
#        pass

# Configuración de directorios adicionales para desarrollo
MEDIA_ROOT = BASE_DIR / 'media'

# Configuración para manejo de archivos en desarrollo
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Configuración específica de timezone para Perú
USE_TZ = True
TIME_ZONE = 'America/Lima'

# Configuración de datos de prueba para desarrollo
DATOS_EMPRESA_DEFECTO.update({
    'razon_social': 'FELICITAFAC DESARROLLO SAC',
    'ruc': '20123456789',
    'direccion': 'Av. Desarrollo 123, Lima',
    'ubigeo': '150101',
    'telefono': '01-1234567',
    'email': 'desarrollo@felicitafac.com',
})

print("🔧 Configuración LOCAL cargada - MySQL Desarrollo")
print(f"📊 Base de datos: {DATABASES['default']['NAME']}")
print(f"🏠 Host: {DATABASES['default']['HOST']}:{DATABASES['default']['PORT']}")
print(f"🌐 CORS habilitado para: {CORS_ALLOWED_ORIGINS}")