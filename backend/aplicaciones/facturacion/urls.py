"""
URLs de Facturación - FELICITAFAC
Rutas API REST para documentos electrónicos SUNAT
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TipoDocumentoElectronicoViewSet, SerieDocumentoViewSet,
    DocumentoElectronicoViewSet, FormaPagoViewSet
)

app_name = 'facturacion'

# Router para ViewSets
router = DefaultRouter()
router.register('tipos-documento', TipoDocumentoElectronicoViewSet, basename='tipodocumento')
router.register('series', SerieDocumentoViewSet, basename='serie')
router.register('documentos', DocumentoElectronicoViewSet, basename='documento')
router.register('facturas', DocumentoElectronicoViewSet, basename='factura')
router.register('formas-pago', FormaPagoViewSet, basename='formapago')

# URLs principales
urlpatterns = [
    path('', include(router.urls)),
]