"""
Configuración base para FELICITAFAC
Sistema de Facturación Electrónica para Perú
Optimizado para MySQL y hosting compartido
"""

import os
from pathlib import Path
from decouple import config
from datetime import timedelta
from datetime import timedelta

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Configuración de seguridad
SECRET_KEY = config('SECRET_KEY', default='felicitafac-desarrollo-key-cambiar-en-produccion')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Aplicaciones instaladas
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
]

FELICITAFAC_APPS = [
    'aplicaciones.core',
    'aplicaciones.usuarios',
    'aplicaciones.clientes',
    'aplicaciones.productos',
    'aplicaciones.facturacion',
    'aplicaciones.inventario',
    'aplicaciones.integraciones',  
    'aplicaciones.contabilidad',
    'aplicaciones.reportes',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + FELICITAFAC_APPS

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'configuracion.urls'

# Configuración de plantillas
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'configuracion.wsgi.application'
ASGI_APPLICATION = 'configuracion.asgi.application'

# Configuración de base de datos MySQL (sobrescrita en local.py y produccion.py)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='felicitafac_db'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'autocommit': True,
        }
    }
}

# Configuración de usuario personalizado
AUTH_USER_MODEL = 'usuarios.Usuario'

# Configuración Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'login': '10/minute',
    },
    'EXCEPTION_HANDLER': 'aplicaciones.core.exceptions.custom_exception_handler',
    'DATETIME_FORMAT': '%d/%m/%Y %H:%M:%S',
    'DATE_FORMAT': '%d/%m/%Y',
    'TIME_FORMAT': '%H:%M:%S',
}

# Configuración JWT Simple
SIMPLE_JWT = {
    # Tiempos de vida de los tokens
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    # Configuración de algoritmos
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': 'felicitafac-api',
    'JSON_ENCODER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    
    # Claims del token
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    
    # Configuración de token
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    
    # Claims adicionales
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(hours=1),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=7),
    
    # Headers del token
    'TOKEN_OBTAIN_SERIALIZER': 'aplicaciones.usuarios.serializers.TokenPersonalizadoSerializer',
    'TOKEN_REFRESH_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenRefreshSerializer',
    'TOKEN_VERIFY_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenVerifySerializer',
    'TOKEN_BLACKLIST_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenBlacklistSerializer',
    'SLIDING_TOKEN_OBTAIN_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer',
    'SLIDING_TOKEN_REFRESH_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer',
}

# =======================================================
# CONFIGURACIÓN DE CORS (REACT FRONTEND)
# =======================================================

# CORS para desarrollo con React
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=True, cast=bool)

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_CREDENTIALS = True

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

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# =======================================================
# CONFIGURACIÓN DE SEGURIDAD
# =======================================================

# Configuración de sesiones
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 86400  # 24 horas
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_SAVE_EVERY_REQUEST = True

# Configuración de cookies
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# Configuración de contraseñas
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        'OPTIONS': {
            'user_attributes': ('email', 'nombres', 'apellidos'),
            'max_similarity': 0.7,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'aplicaciones.core.validators.PasswordComplexityValidator',
    },
]

# Configuración de login
LOGIN_URL = '/admin/login/'
LOGIN_REDIRECT_URL = '/admin/'
LOGOUT_REDIRECT_URL = '/'

# Rate limiting para autenticación
AUTHENTICATION_RATE_LIMIT = {
    'LOGIN_ATTEMPTS_LIMIT': 5,
    'LOGIN_ATTEMPTS_TIMEOUT': 300,  # 5 minutos
    'PASSWORD_RESET_LIMIT': 3,
    'PASSWORD_RESET_TIMEOUT': 3600,  # 1 hora
}

# =======================================================
# CONFIGURACIÓN DE LOGGING
# =======================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'json': {
            'format': '{"level": "%(levelname)s", "time": "%(asctime)s", "module": "%(module)s", "message": "%(message)s"}',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'felicitafac.log',
            'formatter': 'verbose',
        },
        'auth_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'auth.log',
            'formatter': 'json',
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['mail_admins', 'file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'aplicaciones.usuarios': {
            'handlers': ['console', 'auth_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'rest_framework': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Crear directorio de logs si no existe
import os
log_dir = BASE_DIR / 'logs'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# =======================================================
# CONFIGURACIÓN DE CACHE
# =======================================================

# Cache con Redis para hosting compartido
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'felicitafac',
        'TIMEOUT': 300,  # 5 minutos
    }
}

# Configuración de cache para sesiones
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# =======================================================
# CONFIGURACIÓN DE EMAIL
# =======================================================

# Configuración de email para notificaciones
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)

# Templates de email
EMAIL_TEMPLATES = {
    'BIENVENIDA': 'emails/bienvenida.html',
    'RESET_PASSWORD': 'emails/reset_password.html',
    'USUARIO_BLOQUEADO': 'emails/usuario_bloqueado.html',
    'NUEVO_LOGIN': 'emails/nuevo_login.html',
}

# =======================================================
# CONFIGURACIÓN DE ARCHIVOS MULTIMEDIA
# =======================================================

# Configuración para archivos estáticos y multimedia
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Configuración para subida de archivos
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_PERMISSIONS = 0o644

# Tipos de archivo permitidos para avatars
ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2MB

# =======================================================
# CONFIGURACIÓN ESPECÍFICA MYSQL
# =======================================================

# Configuración optimizada para MySQL en hosting compartido
DATABASES['default'].update({
    'OPTIONS': {
        'charset': 'utf8mb4',
        'init_command': (
            "SET sql_mode='STRICT_TRANS_TABLES';"
            "SET innodb_strict_mode=1;"
            "SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;"
        ),
        'read_timeout': 20,
        'write_timeout': 20,
    },
    'CONN_MAX_AGE': 60,  # Reutilizar conexiones por 60 segundos
    'CONN_HEALTH_CHECKS': True,
})

# =======================================================
# CONFIGURACIÓN DE TIMEZONE Y LOCALIZACIÓN
# =======================================================

# Configuración de zona horaria para Perú
TIME_ZONE = 'America/Lima'
USE_TZ = True

# Configuración de idioma
LANGUAGE_CODE = 'es-pe'
USE_I18N = True
USE_L10N = True

# Formatos de fecha y hora para Perú
DATE_FORMAT = 'd/m/Y'
DATETIME_FORMAT = 'd/m/Y H:i:s'
TIME_FORMAT = 'H:i:s'

# Configuración de moneda
USE_THOUSAND_SEPARATOR = True
THOUSAND_SEPARATOR = ','
DECIMAL_SEPARATOR = '.'

# =======================================================
# CONFIGURACIÓN DE DEBUG Y DESARROLLO
# =======================================================

# Debug toolbar solo en desarrollo
if DEBUG:
    try:
        import debug_toolbar
        INSTALLED_APPS.append('debug_toolbar')
        MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
        
        DEBUG_TOOLBAR_CONFIG = {
            'SHOW_TEMPLATE_CONTEXT': True,
            'ENABLE_STACKTRACES': True,
        }
        
        INTERNAL_IPS = [
            '127.0.0.1',
            'localhost',
        ]
    except ImportError:
        pass

# Configuración para desarrollo
if DEBUG:
    # Permitir todos los hosts en desarrollo
    ALLOWED_HOSTS = ['*']
    
    # Email en consola para desarrollo
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    
    # Desactivar HTTPS en desarrollo
    SECURE_SSL_REDIRECT = False
    SECURE_PROXY_SSL_HEADER = None

# =======================================================
# CONFIGURACIÓN DE PERFORMANCE
# =======================================================

# Configuración de performance para hosting compartido
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Configuración de compresión
USE_GZIP = True
GZIP_CONTENT_TYPES = [
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'text/xml',
    'application/xml',
    'application/xml+rss',
    'text/plain',
    'image/svg+xml',
]

# Configuración CORS (para desarrollo con React)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=True, cast=bool)

# Internacionalización para Perú
LANGUAGE_CODE = 'es-pe'
TIME_ZONE = 'America/Lima'
USE_I18N = True
USE_TZ = True

# Configuración de archivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Configuración de archivos multimedia
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Campo de clave primaria por defecto
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuración de logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'felicitafac.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'felicitafac': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# Configuración específica para hosting compartido
# (Optimizaciones de performance)
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 86400  # 24 horas
SESSION_SAVE_EVERY_REQUEST = True

# Cache (configurar según hosting)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'felicitafac_cache_table',
    }
}

# Configuración de email (para notificaciones)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# Configuración específica SUNAT Perú
CONFIGURACION_SUNAT = {
    'IGV_RATE': 0.18,  # 18% IGV en Perú
    'MONEDA_NACIONAL': 'PEN',  # Soles peruanos
    'TIPO_DOCUMENTO_RUC': '6',
    'TIPO_DOCUMENTO_DNI': '1',
    'NUBEFACT_TOKEN': config('NUBEFACT_TOKEN', default=''),
    'NUBEFACT_URL_BASE': config('NUBEFACT_URL_BASE', default='https://api.nubefact.com'),
}

# Configuración de datos fiscales de la empresa
DATOS_EMPRESA_DEFECTO = {
    'razon_social': config('EMPRESA_RAZON_SOCIAL', default='Tu Empresa SAC'),
    'ruc': config('EMPRESA_RUC', default='20123456789'),
    'direccion': config('EMPRESA_DIRECCION', default='Dirección de tu empresa'),
    'ubigeo': config('EMPRESA_UBIGEO', default='150101'),  # Lima-Lima-Lima por defecto
}