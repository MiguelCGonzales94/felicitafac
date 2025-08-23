"""URLs de Facturación - FELICITAFAC"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class TipoDocumentoElectronicoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        return Response([{'codigo': '01', 'descripcion': 'Factura'}])

class SerieDocumentoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        return Response([{'id': 1, 'codigo': 'F001', 'descripcion': 'Serie Facturas'}])

class DocumentoElectronicoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        return Response([])

class FormaPagoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request):
        return Response([{'codigo': 'Contado', 'descripcion': 'Contado'}])

app_name = 'facturacion'

router = DefaultRouter()
router.register('tipos-documento', TipoDocumentoElectronicoViewSet, basename='tipodocumento')
router.register('series-documento', SerieDocumentoViewSet, basename='serie')
router.register('documentos', DocumentoElectronicoViewSet, basename='documento')
router.register('facturas', DocumentoElectronicoViewSet, basename='factura')
router.register('formas-pago', FormaPagoViewSet, basename='formapago')

urlpatterns = [
    path('', include(router.urls)),
]
