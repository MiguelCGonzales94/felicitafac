"""
Vistas de la aplicación Core - FELICITAFAC
Sistema de Facturación Electrónica para Perú
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import connection
from .models import Empresa, Sucursal, ConfiguracionSistema
from .serializers import EmpresaSerializer, SucursalSerializer, ConfiguracionSistemaSerializer


class EmpresaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de empresas
    """
    queryset = Empresa.objects.filter(activo=True)
    serializer_class = EmpresaSerializer
    
    def get_queryset(self):
        """Filtrar empresas activas"""
        return Empresa.objects.filter(activo=True)
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """Activar empresa"""
        empresa = self.get_object()
        empresa.activo = True
        empresa.save()
        return Response({'mensaje': 'Empresa activada exitosamente'})
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """Desactivar empresa (soft delete)"""
        empresa = self.get_object()
        empresa.soft_delete()
        return Response({'mensaje': 'Empresa desactivada exitosamente'})
    
    @action(detail=True, methods=['get'])
    def datos_facturacion(self, request, pk=None):
        """Obtener datos para facturación"""
        empresa = self.get_object()
        datos = empresa.obtener_datos_facturacion()
        return Response(datos)


class SucursalViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de sucursales
    """
    queryset = Sucursal.objects.filter(activo=True)
    serializer_class = SucursalSerializer
    
    def get_queryset(self):
        """Filtrar sucursales activas"""
        queryset = Sucursal.objects.filter(activo=True)
        empresa_id = self.request.query_params.get('empresa', None)
        if empresa_id is not None:
            queryset = queryset.filter(empresa_id=empresa_id)
        return queryset
    
    @action(detail=True, methods=['post'])
    def siguiente_numero(self, request, pk=None):
        """Obtener siguiente número de documento"""
        sucursal = self.get_object()
        tipo_documento = request.data.get('tipo_documento')
        
        try:
            numero = sucursal.obtener_siguiente_numero(tipo_documento)
            return Response({
                'numero': numero,
                'mensaje': f'Siguiente número para {tipo_documento}: {numero}'
            })
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def establecer_principal(self, request, pk=None):
        """Establecer sucursal como principal"""
        sucursal = self.get_object()
        sucursal.es_principal = True
        sucursal.save()
        return Response({'mensaje': 'Sucursal establecida como principal'})


class ConfiguracionSistemaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para configuraciones del sistema
    """
    queryset = ConfiguracionSistema.objects.filter(activo=True)
    serializer_class = ConfiguracionSistemaSerializer
    
    def get_queryset(self):
        """Filtrar configuraciones activas"""
        return ConfiguracionSistema.objects.filter(activo=True)
    
    @action(detail=False, methods=['get'])
    def obtener_por_clave(self, request):
        """Obtener configuración por clave"""
        clave = request.query_params.get('clave')
        if not clave:
            return Response({
                'error': 'Parámetro clave es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            config = ConfiguracionSistema.objects.get(clave=clave, activo=True)
            return Response({
                'clave': config.clave,
                'valor': config.obtener_valor(),
                'descripcion': config.descripcion
            })
        except ConfiguracionSistema.DoesNotExist:
            return Response({
                'error': 'Configuración no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def actualizar_configuracion(self, request):
        """Actualizar valor de configuración"""
        clave = request.data.get('clave')
        valor = request.data.get('valor')
        
        if not clave or valor is None:
            return Response({
                'error': 'Clave y valor son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            config = ConfiguracionSistema.objects.get(clave=clave, activo=True)
            config.valor = str(valor)
            config.save()
            return Response({
                'mensaje': 'Configuración actualizada exitosamente',
                'clave': clave,
                'valor': config.obtener_valor()
            })
        except ConfiguracionSistema.DoesNotExist:
            return Response({
                'error': 'Configuración no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)


class InfoSistemaView(APIView):
    """
    Vista para información general del sistema
    """
    
    def get(self, request):
        """Obtener información del sistema"""
        from django.conf import settings
        
        return Response({
            'sistema': 'FELICITAFAC',
            'version': '1.0.0',
            'descripcion': 'Sistema de Facturación Electrónica para Perú',
            'fase_actual': 'Fase 1: Configuración MySQL y Arquitectura Base',
            'estado': 'Activo',
            'timestamp': timezone.now(),
            'configuracion': {
                'debug': settings.DEBUG,
                'timezone': settings.TIME_ZONE,
                'language': settings.LANGUAGE_CODE,
                'database': settings.DATABASES['default']['ENGINE'],
            },
            'estadisticas': {
                'empresas_activas': Empresa.objects.filter(activo=True).count(),
                'sucursales_activas': Sucursal.objects.filter(activo=True).count(),
                'configuraciones': ConfiguracionSistema.objects.filter(activo=True).count(),
            }
        })


class SaludSistemaView(APIView):
    """
    Vista de health check del sistema
    """
    
    def get(self, request):
        """Verificar salud del sistema"""
        try:
            # Verificar conexión a base de datos
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
            
            # Verificar que hay configuraciones base
            config_count = ConfiguracionSistema.objects.filter(activo=True).count()
            
            if config_count == 0:
                return Response({
                    'status': 'warning',
                    'database': 'connected',
                    'configuraciones': 'no_data',
                    'mensaje': 'Base de datos conectada pero sin configuraciones',
                    'timestamp': timezone.now()
                }, status=status.HTTP_200_OK)
            
            return Response({
                'status': 'healthy',
                'database': 'connected',
                'configuraciones': 'loaded',
                'timestamp': timezone.now(),
                'detalles': {
                    'empresas': Empresa.objects.filter(activo=True).count(),
                    'sucursales': Sucursal.objects.filter(activo=True).count(),
                    'configuraciones': config_count
                }
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'database': 'disconnected',
                'error': str(e),
                'timestamp': timezone.now()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)