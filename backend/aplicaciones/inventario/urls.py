"""
URLs de Inventario - FELICITAFAC
Rutas API REST para movimientos PEPS y control de stock
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TipoMovimientoViewSet, AlmacenViewSet, StockProductoViewSet,
    LoteProductoViewSet, MovimientoInventarioViewSet
)

app_name = 'inventario'

# Router para ViewSets
router = DefaultRouter()
router.register('tipos-movimiento', TipoMovimientoViewSet, basename='tipomovimiento')
router.register('almacenes', AlmacenViewSet, basename='almacen')
router.register('stocks', StockProductoViewSet, basename='stock')
router.register('lotes', LoteProductoViewSet, basename='lote')
router.register('movimientos', MovimientoInventarioViewSet, basename='movimiento')

# URLs principales
urlpatterns = [
    path('', include(router.urls)),
]