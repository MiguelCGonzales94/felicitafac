"""
Views de Inventario - FELICITAFAC
Sistema de Facturación Electrónica para Perú
API REST para movimientos PEPS y control de stock
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, F, Avg
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import logging

# from .models import (
#     TipoMovimiento, Almacen, StockProducto, LoteProducto, 
#     MovimientoInventario
# )
# from .serializers import (
#     TipoMovimientoSerializer, AlmacenSerializer, StockProductoSerializer,
#     LoteProductoSerializer, MovimientoInventarioSerializer
# )
from aplicaciones.core.permissions import (
    EsContadorOAdministrador, PuedeGestionarInventario
)
from aplicaciones.core.pagination import PaginacionEstandar

logger = logging.getLogger(__name__)


class TipoMovimientoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para tipos de movimiento de inventario
    Catálogo de tipos de movimientos PEPS
    """
    permission_classes = [IsAuthenticated]
    pagination_class = None
    
    def list(self, request):
        """
        Lista de tipos de movimiento de inventario
        Basado en metodología PEPS (FIFO)
        """
        tipos = [
            {
                'id': 1,
                'codigo': 'INGRESO_COMPRA',
                'nombre': 'Ingreso por Compra',
                'descripcion': 'Ingreso de mercadería por compra a proveedores',
                'tipo': 'ingreso',
                'afecta_costo': True,
                'requiere_documento': True,
                'activo': True
            },
            {
                'id': 2,
                'codigo': 'SALIDA_VENTA',
                'nombre': 'Salida por Venta',
                'descripcion': 'Salida de mercadería por venta a clientes',
                'tipo': 'salida',
                'afecta_costo': False,
                'requiere_documento': True,
                'activo': True
            },
            {
                'id': 3,
                'codigo': 'AJUSTE_POSITIVO',
                'nombre': 'Ajuste Positivo',
                'descripcion': 'Ajuste positivo de inventario por diferencias',
                'tipo': 'ingreso',
                'afecta_costo': False,
                'requiere_documento': False,
                'activo': True
            },
            {
                'id': 4,
                'codigo': 'AJUSTE_NEGATIVO',
                'nombre': 'Ajuste Negativo',
                'descripcion': 'Ajuste negativo de inventario por diferencias',
                'tipo': 'salida',
                'afecta_costo': False,
                'requiere_documento': False,
                'activo': True
            },
            {
                'id': 5,
                'codigo': 'TRASLADO_ENTRADA',
                'nombre': 'Traslado - Entrada',
                'descripcion': 'Entrada por traslado entre almacenes',
                'tipo': 'ingreso',
                'afecta_costo': False,
                'requiere_documento': True,
                'activo': True
            },
            {
                'id': 6,
                'codigo': 'TRASLADO_SALIDA',
                'nombre': 'Traslado - Salida',
                'descripcion': 'Salida por traslado entre almacenes',
                'tipo': 'salida',
                'afecta_costo': False,
                'requiere_documento': True,
                'activo': True
            },
            {
                'id': 7,
                'codigo': 'DEVOLUCION_CLIENTE',
                'nombre': 'Devolución de Cliente',
                'descripcion': 'Ingreso por devolución de mercadería de clientes',
                'tipo': 'ingreso',
                'afecta_costo': False,
                'requiere_documento': True,
                'activo': True
            },
            {
                'id': 8,
                'codigo': 'DEVOLUCION_PROVEEDOR',
                'nombre': 'Devolución a Proveedor',
                'descripcion': 'Salida por devolución de mercadería a proveedores',
                'tipo': 'salida',
                'afecta_costo': True,
                'requiere_documento': True,
                'activo': True
            },
            {
                'id': 9,
                'codigo': 'INVENTARIO_INICIAL',
                'nombre': 'Inventario Inicial',
                'descripcion': 'Ingreso por inventario inicial del sistema',
                'tipo': 'ingreso',
                'afecta_costo': True,
                'requiere_documento': False,
                'activo': True
            },
            {
                'id': 10,
                'codigo': 'MERMA',
                'nombre': 'Merma',
                'descripcion': 'Salida por merma o pérdida de producto',
                'tipo': 'salida',
                'afecta_costo': False,
                'requiere_documento': False,
                'activo': True
            }
        ]
        
        # Filtros
        tipo_filtro = request.query_params.get('tipo')
        if tipo_filtro:
            tipos = [t for t in tipos if t['tipo'] == tipo_filtro]
        
        return Response({
            'count': len(tipos),
            'results': tipos
        })


class AlmacenViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para almacenes
    Gestión de ubicaciones de inventario
    """
    permission_classes = [IsAuthenticated]
    pagination_class = None
    
    def list(self, request):
        """
        Lista de almacenes configurados
        """
        almacenes = [
            {
                'id': 1,
                'codigo': 'ALM001',
                'nombre': 'Almacén Principal',
                'descripcion': 'Almacén principal de la empresa',
                'direccion': 'Av. Principal 123, Lima',
                'responsable': 'Almacenero Principal',
                'telefono': '01-234-5678',
                'email': 'almacen@empresa.com',
                'capacidad_maxima': 1000.00,
                'area_m2': 500.00,
                'activo': True,
                'es_principal': True,
                'permite_ventas': True,
                'fecha_creacion': '2024-01-01T00:00:00Z'
            },
            {
                'id': 2,
                'codigo': 'ALM002',
                'nombre': 'Almacén Sucursal Norte',
                'descripcion': 'Almacén de la sucursal norte',
                'direccion': 'Jr. Secundario 456, Lima Norte',
                'responsable': 'Responsable Sucursal Norte',
                'telefono': '01-345-6789',
                'email': 'almacen.norte@empresa.com',
                'capacidad_maxima': 500.00,
                'area_m2': 250.00,
                'activo': True,
                'es_principal': False,
                'permite_ventas': True,
                'fecha_creacion': '2024-02-01T00:00:00Z'
            },
            {
                'id': 3,
                'codigo': 'ALM003',
                'nombre': 'Almacén Temporal',
                'descripcion': 'Almacén para mercadería en tránsito',
                'direccion': 'Av. Temporal 789, Lima',
                'responsable': 'Supervisor Temporal',
                'telefono': '01-456-7890',
                'email': 'temporal@empresa.com',
                'capacidad_maxima': 200.00,
                'area_m2': 100.00,
                'activo': True,
                'es_principal': False,
                'permite_ventas': False,
                'fecha_creacion': '2024-03-01T00:00:00Z'
            }
        ]
        
        # Filtros
        activo = request.query_params.get('activo')
        if activo is not None:
            activo_bool = activo.lower() == 'true'
            almacenes = [a for a in almacenes if a['activo'] == activo_bool]
        
        principal = request.query_params.get('principal')
        if principal is not None:
            principal_bool = principal.lower() == 'true'
            almacenes = [a for a in almacenes if a['es_principal'] == principal_bool]
        
        return Response({
            'count': len(almacenes),
            'results': almacenes
        })


class StockProductoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para stock de productos
    Consulta de stock actual por producto y almacén
    """
    permission_classes = [IsAuthenticated]
    pagination_class = PaginacionEstandar
    
    def list(self, request):
        """
        Lista de stock de productos
        """
        # Datos de ejemplo para testing
        stock_productos = [
            {
                'id': 1,
                'producto': {
                    'id': 1,
                    'codigo': 'PROD001',
                    'nombre': 'Producto Ejemplo 1',
                    'unidad_medida': 'NIU'
                },
                'almacen': {
                    'id': 1,
                    'codigo': 'ALM001',
                    'nombre': 'Almacén Principal'
                },
                'cantidad_actual': 150.00,
                'cantidad_reservada': 10.00,
                'cantidad_disponible': 140.00,
                'stock_minimo': 20.00,
                'stock_maximo': 200.00,
                'costo_promedio': 25.50,
                'valor_inventario': 3825.00,
                'fecha_ultimo_movimiento': '2024-12-20T10:30:00Z',
                'necesita_reposicion': False
            },
            {
                'id': 2,
                'producto': {
                    'id': 2,
                    'codigo': 'PROD002',
                    'nombre': 'Producto Ejemplo 2',
                    'unidad_medida': 'KGM'
                },
                'almacen': {
                    'id': 1,
                    'codigo': 'ALM001',
                    'nombre': 'Almacén Principal'
                },
                'cantidad_actual': 5.00,
                'cantidad_reservada': 0.00,
                'cantidad_disponible': 5.00,
                'stock_minimo': 10.00,
                'stock_maximo': 50.00,
                'costo_promedio': 45.00,
                'valor_inventario': 225.00,
                'fecha_ultimo_movimiento': '2024-12-18T14:20:00Z',
                'necesita_reposicion': True
            }
        ]
        
        return Response({
            'count': len(stock_productos),
            'results': stock_productos
        })


class LoteProductoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para lotes de productos
    Trazabilidad PEPS de lotes
    """
    permission_classes = [IsAuthenticated]
    pagination_class = PaginacionEstandar
    
    def list(self, request):
        """
        Lista de lotes de productos
        """
        lotes = [
            {
                'id': 1,
                'numero_lote': 'LOTE-2024-001',
                'producto': {
                    'id': 1,
                    'codigo': 'PROD001',
                    'nombre': 'Producto Ejemplo 1'
                },
                'almacen': {
                    'id': 1,
                    'codigo': 'ALM001',
                    'nombre': 'Almacén Principal'
                },
                'cantidad_inicial': 100.00,
                'cantidad_actual': 80.00,
                'costo_unitario': 25.00,
                'fecha_vencimiento': '2025-12-31',
                'fecha_ingreso': '2024-01-15T09:00:00Z',
                'activo': True
            }
        ]
        
        return Response({
            'count': len(lotes),
            'results': lotes
        })


class MovimientoInventarioViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para movimientos de inventario
    Historial de movimientos PEPS
    """
    permission_classes = [IsAuthenticated]
    pagination_class = PaginacionEstandar
    
    def list(self, request):
        """
        Lista de movimientos de inventario
        """
        movimientos = [
            {
                'id': 1,
                'numero': 'MOV-2024-001',
                'tipo_movimiento': {
                    'id': 1,
                    'codigo': 'INGRESO_COMPRA',
                    'nombre': 'Ingreso por Compra'
                },
                'producto': {
                    'id': 1,
                    'codigo': 'PROD001',
                    'nombre': 'Producto Ejemplo 1'
                },
                'almacen': {
                    'id': 1,
                    'codigo': 'ALM001',
                    'nombre': 'Almacén Principal'
                },
                'cantidad': 100.00,
                'costo_unitario': 25.00,
                'costo_total': 2500.00,
                'fecha_movimiento': '2024-01-15T09:00:00Z',
                'documento_referencia': 'FACTURA-001',
                'observaciones': 'Compra inicial de inventario',
                'usuario': 'admin@empresa.com'
            }
        ]
        
        return Response({
            'count': len(movimientos),
            'results': movimientos
        })
