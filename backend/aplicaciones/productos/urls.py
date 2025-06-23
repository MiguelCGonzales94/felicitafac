"""
URLs de Productos - FELICITAFAC
Rutas API REST para gestión de productos e inventarios
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TipoProductoViewSet, CategoriaViewSet, ProductoViewSet, 
    ProductoProveedorViewSet
)

app_name = 'productos'

# Router para ViewSets
router = DefaultRouter()
router.register('tipos-producto', TipoProductoViewSet, basename='tipoproducto')
router.register('categorias', CategoriaViewSet, basename='categoria')
router.register('productos', ProductoViewSet, basename='producto')
router.register('producto-proveedores', ProductoProveedorViewSet, basename='productoproveedor')

# URLs principales
urlpatterns = [
    path('', include(router.urls)),
]