# ================================================================
# CORRECCIÓN 2: URLS FALTANTES BACKEND - FELICITAFAC
# ================================================================

# 1. ACTUALIZAR backend/aplicaciones/facturacion/urls.py
"""
URLs de Facturación - FELICITAFAC - CORREGIDO
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

# ✅ CORREGIDO: Agregar endpoint series-documento
router.register('series-documento', SerieDocumentoViewSet, basename='serie')

router.register('documentos', DocumentoElectronicoViewSet, basename='documento')
router.register('facturas', DocumentoElectronicoViewSet, basename='factura')

# ✅ CORREGIDO: Agregar endpoint formas-pago
router.register('formas-pago', FormaPagoViewSet, basename='formapago')

# URLs principales
urlpatterns = [
    path('', include(router.urls)),
]

# ================================================================
# 2. ACTUALIZAR backend/aplicaciones/productos/urls.py
"""
URLs de Productos - FELICITAFAC - CORREGIDO
Rutas API REST para gestión de productos e inventarios
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TipoProductoViewSet, CategoriaViewSet, ProductoViewSet, 
    ProductoProveedorViewSet, UnidadMedidaViewSet  # ✅ AGREGAR
)

app_name = 'productos'

# Router para ViewSets
router = DefaultRouter()
router.register('tipos-producto', TipoProductoViewSet, basename='tipoproducto')
router.register('categorias', CategoriaViewSet, basename='categoria')
router.register('productos', ProductoViewSet, basename='producto')
router.register('producto-proveedores', ProductoProveedorViewSet, basename='productoproveedor')

# ✅ CORREGIDO: Agregar endpoint unidades-medida
router.register('unidades-medida', UnidadMedidaViewSet, basename='unidadmedida')

# URLs principales
urlpatterns = [
    path('', include(router.urls)),
]

# ================================================================
# 3. ACTUALIZAR backend/aplicaciones/inventario/urls.py
"""
URLs de Inventario - FELICITAFAC - CORREGIDO
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

# ✅ CORREGIDO: Endpoint tipos-movimiento debe existir
router.register('tipos-movimiento', TipoMovimientoViewSet, basename='tipomovimiento')

# ✅ CORREGIDO: Endpoint almacenes debe existir
router.register('almacenes', AlmacenViewSet, basename='almacen')

router.register('stocks', StockProductoViewSet, basename='stock')
router.register('lotes', LoteProductoViewSet, basename='lote')
router.register('movimientos', MovimientoInventarioViewSet, basename='movimiento')

# URLs principales
urlpatterns = [
    path('', include(router.urls)),
]