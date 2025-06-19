"""
Configuración para producción - FELICITAFAC
Optimizada para hosting compartido con cPanel y MySQL
"""

from .base import *
from decouple import config
import os

# Configuración de seguridad para producción
DEBUG = False
SECRET_KEY = config('SECRET_KEY')

# Hosts permitidos en producción
ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v: [s.strip() for s in v.split(',')])

# Base de datos MySQL para hosting compartido
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'autocommit': True,
            # Optimizaciones para hosting compartido
            'connect_timeout': 20,
            'read_timeout': 30,
            'write_timeout': 30,
            'isolation_level': 'read committed',
        }
    }
}

# Configuración de conexión optimizada para hosting compartido
DATABASES['default']['CONN_MAX_AGE'] = 60  # Reutilizar conexiones
DATABASES['default']['OPTIONS']['sql_mode'] = 'STRICT_TRANS_TABLES'

# Configuración de seguridad para producción
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=True, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=True, cast=bool)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Configuración de cookies
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 86400  # 24 horas
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# CORS configuración para producción
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='',
    cast=lambda v: [s.strip() for s in v.split(',') if s.strip()]
)

# Configuración de archivos estáticos para producción
STATIC_URL = '/static/'
STATIC_ROOT = config('STATIC_ROOT', default=str(BASE_DIR / 'public_html' / 'static'))

# Configuración de archivos multimedia para producción
MEDIA_URL = '/media/'
MEDIA_ROOT = config('MEDIA_ROOT', default=str(BASE_DIR / 'public_html' / 'media'))

# Cache para producción (base de datos)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'felicitafac_cache_table',
        'TIMEOUT': 300,
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
            'CULL_FREQUENCY': 3,
        }
    }
}

# Configuración de email para producción
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT', cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)

# Configuración de logging para producción
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': config('LOG_FILE_PATH', default=str(BASE_DIR / 'logs' / 'felicitafac.log')),
            'maxBytes': 1024*1024*5,  # 5 MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': config('ERROR_LOG_PATH', default=str(BASE_DIR / 'logs' / 'felicitafac_errors.log')),
            'maxBytes': 1024*1024*5,  # 5 MB
            'backupCount': 3,
            'formatter': 'verbose',
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'mail_admins'],
            'level': 'INFO',
            'propagate': True,
        },
        'felicitafac': {
            'handlers': ['file', 'error_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'aplicaciones': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Configuración de administradores para notificaciones
ADMINS = config('ADMINS', default='', cast=lambda v: [
    tuple(admin.split(':')) for admin in v.split(',') if ':' in admin
])

# Configuración específica para hosting compartido
# Optimizaciones de performance
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'

# Configuración de compresión de archivos estáticos
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'

# Configuración de middleware optimizada para hosting compartido
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.cache.UpdateCacheMiddleware',  # Cache
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',  # Cache
]

# Configuración de Django REST Framework para producción
REST_FRAMEWORK.update({
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    },
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ]
})

# Configuración SUNAT para producción
CONFIGURACION_SUNAT.update({
    'NUBEFACT_TOKEN': config('NUBEFACT_TOKEN'),
    'NUBEFACT_URL_BASE': config('NUBEFACT_URL_BASE', default='https://api.nubefact.com'),
    'MODO_DESARROLLO': False,
    'DEBUG_FACTURAS': False,
    'TIMEOUT_CONEXION': 30,
    'REINTENTOS_MAXIMOS': 3,
})

# Configuración de datos de la empresa en producción
DATOS_EMPRESA_DEFECTO.update({
    'razon_social': config('EMPRESA_RAZON_SOCIAL'),
    'ruc': config('EMPRESA_RUC'),
    'direccion': config('EMPRESA_DIRECCION'),
    'ubigeo': config('EMPRESA_UBIGEO'),
    'telefono': config('EMPRESA_TELEFONO', default=''),
    'email': config('EMPRESA_EMAIL', default=''),
})

# Configuración de directorios para hosting compartido
# Crear directorios necesarios si no existen
for directorio in [STATIC_ROOT, MEDIA_ROOT, os.path.dirname(LOGGING['handlers']['file']['filename'])]:
    if not os.path.exists(directorio):
        try:
            os.makedirs(directorio, exist_ok=True)
        except OSError:
            pass

# Configuración de límites para hosting compartido
FILE_UPLOAD_MAX_MEMORY_SIZE = 2621440  # 2.5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 2621440  # 2.5MB

# Configuración de timeout para hosting compartido
CONN_MAX_AGE = 300  # 5 minutos

# Configuración de backup automático (si está disponible)
BACKUP_MYSQL = {
    'ENABLED': config('BACKUP_ENABLED', default=True, cast=bool),
    'BACKUP_PATH': config('BACKUP_PATH', default=str(BASE_DIR / 'backups')),
    'RETENTION_DAYS': config('BACKUP_RETENTION_DAYS', default=7, cast=int),
}

print("🚀 Configuración PRODUCCIÓN cargada - Hosting Compartido")
print(f"📊 Base de datos: {DATABASES['default']['NAME']}")
print(f"🌐 Hosts permitidos: {ALLOWED_HOSTS}")
print(f"🔒 SSL: {'Habilitado' if SECURE_SSL_REDIRECT else 'Deshabilitado'}")