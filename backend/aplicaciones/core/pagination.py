"""
Paginación Core - FELICITAFAC
Clases de paginación personalizadas para el sistema
Optimizado para hosting compartido con MySQL
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict
import math


class PaginacionEstandar(PageNumberPagination):
    """
    Paginación estándar para el sistema FELICITAFAC
    Optimizada para performance en hosting compartido
    """
    
    # Configuración por defecto
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'
    
    def get_paginated_response(self, data):
        """
        Respuesta paginada personalizada con información adicional
        """
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('has_next', self.page.has_next()),
            ('has_previous', self.page.has_previous()),
            ('results', data)
        ]))
    
    def get_page_size(self, request):
        """
        Obtener tamaño de página desde request
        """
        if self.page_size_query_param:
            try:
                page_size = int(request.query_params[self.page_size_query_param])
                if page_size > 0:
                    return min(page_size, self.max_page_size)
            except (KeyError, ValueError):
                pass
        
        return self.page_size


class PaginacionChica(PaginacionEstandar):
    """
    Paginación para listas pequeñas (dropdowns, selects)
    """
    page_size = 10
    max_page_size = 50


class PaginacionGrande(PaginacionEstandar):
    """
    Paginación para reportes y listados extensos
    """
    page_size = 50
    max_page_size = 200


class PaginacionReportes(PaginacionEstandar):
    """
    Paginación especial para reportes
    Con información adicional de totales
    """
    page_size = 100
    max_page_size = 500
    
    def __init__(self):
        super().__init__()
        self.totales = {}
    
    def set_totales(self, totales_dict):
        """
        Establecer totales para mostrar en la respuesta
        """
        self.totales = totales_dict
    
    def get_paginated_response(self, data):
        """
        Respuesta con totales adicionales para reportes
        """
        response_data = OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('has_next', self.page.has_next()),
            ('has_previous', self.page.has_previous()),
            ('results', data)
        ])
        
        # Agregar totales si están disponibles
        if self.totales:
            response_data['totales'] = self.totales
        
        return Response(response_data)


class PaginacionFacturacion(PaginacionEstandar):
    """
    Paginación específica para documentos de facturación
    """
    page_size = 25
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Respuesta con información específica de facturación
        """
        # Calcular totales si hay datos
        totales = self._calcular_totales_facturacion(data)
        
        response_data = OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('has_next', self.page.has_next()),
            ('has_previous', self.page.has_previous()),
            ('totales_pagina', totales),
            ('results', data)
        ])
        
        return Response(response_data)
    
    def _calcular_totales_facturacion(self, data):
        """
        Calcular totales de la página actual para facturación
        """
        from decimal import Decimal
        
        totales = {
            'cantidad_documentos': len(data),
            'total_general': Decimal('0.00'),
            'total_igv': Decimal('0.00'),
            'subtotal': Decimal('0.00')
        }
        
        for item in data:
            if isinstance(item, dict):
                totales['total_general'] += Decimal(str(item.get('total_general', 0)))
                totales['total_igv'] += Decimal(str(item.get('total_igv', 0)))
                totales['subtotal'] += Decimal(str(item.get('subtotal', 0)))
        
        # Convertir a string para JSON
        for key, value in totales.items():
            if isinstance(value, Decimal):
                totales[key] = str(value)
        
        return totales


class PaginacionInventario(PaginacionEstandar):
    """
    Paginación específica para inventario y productos
    """
    page_size = 30
    max_page_size = 150
    
    def get_paginated_response(self, data):
        """
        Respuesta con información específica de inventario
        """
        # Calcular totales de inventario si hay datos
        totales = self._calcular_totales_inventario(data)
        
        response_data = OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('has_next', self.page.has_next()),
            ('has_previous', self.page.has_previous()),
            ('totales_pagina', totales),
            ('results', data)
        ])
        
        return Response(response_data)
    
    def _calcular_totales_inventario(self, data):
        """
        Calcular totales de la página actual para inventario
        """
        from decimal import Decimal
        
        totales = {
            'cantidad_productos': len(data),
            'stock_total': Decimal('0.00'),
            'valor_total': Decimal('0.00'),
            'productos_stock_bajo': 0
        }
        
        for item in data:
            if isinstance(item, dict):
                stock_actual = Decimal(str(item.get('stock_actual', 0)))
                precio_promedio = Decimal(str(item.get('precio_promedio', 0)))
                stock_minimo = Decimal(str(item.get('stock_minimo', 0)))
                
                totales['stock_total'] += stock_actual
                totales['valor_total'] += stock_actual * precio_promedio
                
                if stock_actual <= stock_minimo:
                    totales['productos_stock_bajo'] += 1
        
        # Convertir decimales a string para JSON
        for key, value in totales.items():
            if isinstance(value, Decimal):
                totales[key] = str(value)
        
        return totales


class SinPaginacion:
    """
    Clase para desactivar paginación en casos específicos
    Útil para datos maestros o listas pequeñas
    """
    
    def paginate_queryset(self, queryset, request, view=None):
        """
        No paginar, retornar todo el queryset
        """
        return None
    
    def get_paginated_response(self, data):
        """
        Respuesta sin paginación
        """
        return Response({
            'count': len(data),
            'results': data
        })


class PaginacionBusqueda(PaginacionEstandar):
    """
    Paginación optimizada para búsquedas
    Páginas más pequeñas para mejor performance
    """
    page_size = 15
    max_page_size = 50
    
    def get_paginated_response(self, data):
        """
        Respuesta con información de búsqueda
        """
        response_data = OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.get_page_size(self.request)),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('has_next', self.page.has_next()),
            ('has_previous', self.page.has_previous()),
            ('search_info', self._get_search_info()),
            ('results', data)
        ])
        
        return Response(response_data)
    
    def _get_search_info(self):
        """
        Información adicional sobre la búsqueda
        """
        search_term = self.request.query_params.get('search', '')
        return {
            'search_term': search_term,
            'has_search': bool(search_term),
            'search_length': len(search_term)
        }


# Funciones auxiliares para paginación

def obtener_paginacion_por_vista(vista_nombre):
    """
    Obtener clase de paginación según nombre de vista
    """
    mapeo_paginacion = {
        'factura': PaginacionFacturacion,
        'producto': PaginacionInventario,
        'inventario': PaginacionInventario,
        'movimiento': PaginacionInventario,
        'reporte': PaginacionReportes,
        'busqueda': PaginacionBusqueda,
        'cliente': PaginacionEstandar,
        'usuario': PaginacionEstandar,
    }
    
    for palabra_clave, clase_paginacion in mapeo_paginacion.items():
        if palabra_clave in vista_nombre.lower():
            return clase_paginacion
    
    # Por defecto retornar paginación estándar
    return PaginacionEstandar


def calcular_info_paginacion(queryset, page_size=20):
    """
    Calcular información de paginación sin paginar
    Útil para mostrar info sin ejecutar la paginación
    """
    count = queryset.count()
    total_pages = math.ceil(count / page_size) if count > 0 else 1
    
    return {
        'total_items': count,
        'total_pages': total_pages,
        'page_size': page_size,
        'needs_pagination': count > page_size
    }


def obtener_parametros_paginacion(request):
    """
    Extraer parámetros de paginación del request
    """
    try:
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
    except (ValueError, TypeError):
        page = 1
        page_size = 20
    
    # Validar límites
    page = max(1, page)
    page_size = min(max(1, page_size), 500)  # Máximo 500 items por página
    
    return {
        'page': page,
        'page_size': page_size,
        'offset': (page - 1) * page_size,
        'limit': page_size
    }