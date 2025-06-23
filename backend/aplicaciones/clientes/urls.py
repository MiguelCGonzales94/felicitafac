"""
URLs de Clientes - FELICITAFAC
Rutas API REST para gestión de clientes
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TipoDocumentoViewSet, ClienteViewSet, ContactoClienteViewSet

app_name = 'clientes'

# Router para ViewSets
router = DefaultRouter()
router.register('tipos-documento', TipoDocumentoViewSet, basename='tipodocumento')
router.register('clientes', ClienteViewSet, basename='cliente')
router.register('contactos', ContactoClienteViewSet, basename='contacto')

# URLs principales
urlpatterns = [
    path('', include(router.urls)),
]

# URLs adicionales específicas si es necesario
urlpatterns += [
    # Endpoints personalizados adicionales pueden ir aquí
]