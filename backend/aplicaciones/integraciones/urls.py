"""
URLs de Integraciones - FELICITAFAC
Rutas API REST para integración con Nubefact y SUNAT
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProveedorIntegracionViewSet, ConfiguracionIntegracionViewSet,
    LogIntegracionViewSet, WebhookIntegracionViewSet, IntegracionApiView
)

app_name = 'integraciones'

# Router para ViewSets
router = DefaultRouter()
router.register('proveedores', ProveedorIntegracionViewSet, basename='proveedor')
router.register('configuraciones', ConfiguracionIntegracionViewSet, basename='configuracion')
router.register('logs', LogIntegracionViewSet, basename='log')
router.register('webhooks', WebhookIntegracionViewSet, basename='webhook')
router.register('api', IntegracionApiView, basename='api')

# URLs principales
urlpatterns = [
    path('', include(router.urls)),
]