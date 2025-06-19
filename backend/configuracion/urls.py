"""
Configuración principal de URLs - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Optimizado para MySQL y hosting compartido
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.authtoken.views import obtain_auth_token


def api_root_view(request):
    """
    Vista raíz de la API que proporciona información básica
    """
    return JsonResponse({
        'mensaje': '¡Bienvenido a FELICITAFAC API!',
        'sistema': 'Sistema de Facturación Electrónica para Perú',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'auth': '/api/auth/',
            'docs': '/api/docs/',
            'usuarios': '/api/usuarios/',
            'clientes': '/api/clientes/',
            'productos': '/api/productos/',
            'facturacion': '/api/facturacion/',
            'inventario': '/api/inventario/',
            'contabilidad': '/api/contabilidad/',
            'reportes': '/api/reportes/',
        },
        'configuracion': {
            'timezone': settings.TIME_ZONE,
            'language': settings.LANGUAGE_CODE,
            'debug': settings.DEBUG,
        }
    })


def health_check_view(request):
    """
    Vista de health check para monitoreo
    """
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'ok',
            'database': 'connected',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=500)


# Configuración principal de URLs
urlpatterns = [
    # Panel de administración Django
    path('admin/', admin.site.urls),
    
    # API raíz
    path('', api_root_view, name='api-root'),
    path('api/', api_root_view, name='api-root-alt'),
    
    # Health check
    path('health/', health_check_view, name='health-check'),
    path('api/health/', health_check_view, name='api-health-check'),
    
    # Autenticación
    path('api/auth/token/', obtain_auth_token, name='api-token-auth'),
    path('api/auth/', include('rest_framework.urls')),
    
    # APIs de aplicaciones (solo las implementadas en Fase 1)
    path('api/core/', include('aplicaciones.core.urls')),
    path('api/usuarios/', include('aplicaciones.usuarios.urls')),
    
    # TODO: Las siguientes URLs se habilitarán en las próximas fases
    # path('api/clientes/', include('aplicaciones.clientes.urls')),      # Fase 2-3
    # path('api/productos/', include('aplicaciones.productos.urls')),    # Fase 3-4
    # path('api/facturacion/', include('aplicaciones.facturacion.urls')), # Fase 3-4
    # path('api/inventario/', include('aplicaciones.inventario.urls')),   # Fase 5
    # path('api/contabilidad/', include('aplicaciones.contabilidad.urls')), # Fase 6
    # path('api/reportes/', include('aplicaciones.reportes.urls')),       # Fase 7
]

# Configuración para archivos estáticos y multimedia en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Django Debug Toolbar (si está instalado)
    try:
        import debug_toolbar
        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]
    except ImportError:
        pass

# Configuración del panel de administración
admin.site.site_header = 'FELICITAFAC Administración'
admin.site.site_title = 'FELICITAFAC'
admin.site.index_title = 'Sistema de Facturación Electrónica'

# Handler de errores personalizados
handler404 = 'configuracion.views.error_404'
handler500 = 'configuracion.views.error_500'