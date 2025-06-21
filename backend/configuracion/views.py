"""
Vistas de configuración principal - FELICITAFAC
Sistema de Facturación Electrónica para Perú
"""

from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.conf import settings


def api_root_view(request):
    """
    Vista raíz de la API que proporciona información básica
    """
    return JsonResponse({
        'mensaje': '¡Bienvenido a FELICITAFAC API!',
        'sistema': 'Sistema de Facturación Electrónica para Perú',
        'version': '1.0.0',
        'estado': 'Activo',
        'fase_actual': 'Fase 1: Configuración MySQL y Arquitectura Base',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'auth': '/api/auth/',
            'docs': '/api/docs/',
            'health': '/api/health/',
            'usuarios': '/api/usuarios/',
            'clientes': '/api/clientes/',
            'productos': '/api/productos/',
            'facturacion': '/api/facturacion/',
            'inventario': '/api/inventario/',
            'contabilidad': '/api/contabilidad/',
            'reportes': '/api/reportes/',
            'core': '/api/core/',
        },
        'configuracion': {
            'timezone': settings.TIME_ZONE,
            'language': settings.LANGUAGE_CODE,
            'debug': settings.DEBUG,
            'database': {
                'engine': settings.DATABASES['default']['ENGINE'],
                'name': settings.DATABASES['default']['NAME'],
                'host': settings.DATABASES['default']['HOST'],
                'port': settings.DATABASES['default']['PORT'],
            }
        },
        'timestamp': timezone.now().isoformat(),
        'autor': 'FELICITAFAC Team',
        'licencia': 'Propietario'
    })


def health_check_view(request):
    """
    Vista de health check para monitoreo del sistema
    """
    try:
        # Verificar conexión a base de datos
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = 'connected'
        
        # Verificar configuración básica
        config_status = 'ok'
        if not settings.SECRET_KEY:
            config_status = 'warning - no secret key'
        
        # Verificar aplicaciones
        apps_status = 'ok'
        try:
            from aplicaciones.core.models import Empresa
            # Intentar una consulta básica
            empresa_count = Empresa.objects.count()
            apps_status = f'ok - {empresa_count} empresas'
        except Exception as e:
            apps_status = f'warning - {str(e)}'
        
        response_data = {
            'status': 'ok',
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0',
            'services': {
                'database': db_status,
                'configuration': config_status,
                'applications': apps_status,
            },
            'uptime': timezone.now().isoformat(),
            'environment': 'development' if settings.DEBUG else 'production'
        }
        
        return JsonResponse(response_data)
        
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0',
            'error': str(e),
            'services': {
                'database': 'disconnected',
                'configuration': 'error',
                'applications': 'error',
            }
        }, status=500)


def info_sistema_view(request):
    """
    Vista de información detallada del sistema
    """
    try:
        from aplicaciones.core.models import Empresa, Sucursal, ConfiguracionSistema
        
        # Estadísticas básicas
        empresas_count = Empresa.objects.filter(activo=True).count()
        sucursales_count = Sucursal.objects.filter(activo=True).count()
        configuraciones_count = ConfiguracionSistema.objects.filter(activo=True).count()
        
        return JsonResponse({
            'sistema': {
                'nombre': 'FELICITAFAC',
                'version': '1.0.0',
                'descripcion': 'Sistema de Facturación Electrónica para Perú',
                'fase_actual': 'Fase 1: Configuración MySQL y Arquitectura Base',
            },
            'estadisticas': {
                'empresas_activas': empresas_count,
                'sucursales_activas': sucursales_count,
                'configuraciones': configuraciones_count,
            },
            'configuracion': {
                'debug': settings.DEBUG,
                'timezone': settings.TIME_ZONE,
                'language': settings.LANGUAGE_CODE,
                'allowed_hosts': settings.ALLOWED_HOSTS,
            },
            'base_datos': {
                'engine': settings.DATABASES['default']['ENGINE'],
                'name': settings.DATABASES['default']['NAME'],
                'host': settings.DATABASES['default']['HOST'],
                'port': settings.DATABASES['default']['PORT'],
            },
            'timestamp': timezone.now().isoformat(),
        })
        
    except Exception as e:
        return JsonResponse({
            'error': 'No se pudo obtener información del sistema',
            'detalle': str(e),
            'timestamp': timezone.now().isoformat(),
        }, status=500)


def error_404(request, exception):
    """
    Vista personalizada para error 404
    """
    if request.path.startswith('/api/'):
        # Para peticiones API, devolver JSON
        return JsonResponse({
            'error': 'Endpoint no encontrado',
            'codigo': 404,
            'mensaje': 'La URL solicitada no existe en FELICITAFAC API',
            'path': request.path,
            'method': request.method,
            'timestamp': timezone.now().isoformat(),
            'sugerencias': [
                'Verifica la URL y el método HTTP',
                'Consulta la documentación de la API',
                'Verifica que el endpoint esté implementado'
            ]
        }, status=404)
    else:
        # Para peticiones web, devolver template HTML
        context = {
            'titulo': 'Página no encontrada',
            'mensaje': 'La página que buscas no existe',
            'codigo': 404
        }
        return render(request, '404.html', context, status=404)


def error_500(request):
    """
    Vista personalizada para error 500
    """
    if request.path.startswith('/api/'):
        # Para peticiones API, devolver JSON
        return JsonResponse({
            'error': 'Error interno del servidor',
            'codigo': 500,
            'mensaje': 'Ha ocurrido un error interno en FELICITAFAC',
            'path': request.path,
            'method': request.method,
            'timestamp': timezone.now().isoformat(),
            'sugerencias': [
                'Revisa los logs del servidor',
                'Verifica la configuración de la base de datos',
                'Contacta al administrador del sistema'
            ]
        }, status=500)
    else:
        # Para peticiones web, devolver template HTML
        context = {
            'titulo': 'Error interno',
            'mensaje': 'Ha ocurrido un error interno en el servidor',
            'codigo': 500
        }
        return render(request, '500.html', context, status=500)


def error_403(request, exception):
    """
    Vista personalizada para error 403 (Forbidden)
    """
    if request.path.startswith('/api/'):
        return JsonResponse({
            'error': 'Acceso prohibido',
            'codigo': 403,
            'mensaje': 'No tienes permisos para acceder a este recurso',
            'path': request.path,
            'method': request.method,
            'timestamp': timezone.now().isoformat(),
        }, status=403)
    else:
        context = {
            'titulo': 'Acceso prohibido',
            'mensaje': 'No tienes permisos para acceder a esta página',
            'codigo': 403
        }
        return render(request, '403.html', context, status=403)


def error_400(request, exception):
    """
    Vista personalizada para error 400 (Bad Request)
    """
    if request.path.startswith('/api/'):
        return JsonResponse({
            'error': 'Petición incorrecta',
            'codigo': 400,
            'mensaje': 'La petición enviada no es válida',
            'path': request.path,
            'method': request.method,
            'timestamp': timezone.now().isoformat(),
        }, status=400)
    else:
        context = {
            'titulo': 'Petición incorrecta',
            'mensaje': 'La petición enviada no es válida',
            'codigo': 400
        }
        return render(request, '400.html', context, status=400)