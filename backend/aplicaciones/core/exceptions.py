"""
Manejadores de excepciones personalizados - FELICITAFAC
Sistema de Facturación Electrónica para Perú
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import Http404
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Manejador de excepciones personalizado para FELICITAFAC
    Proporciona respuestas consistentes para errores de API
    """
    # Llamar al manejador por defecto de DRF
    response = exception_handler(exc, context)
    
    # Si DRF maneja la excepción, personalizar la respuesta
    if response is not None:
        custom_response_data = {
            'error': True,
            'codigo': response.status_code,
            'mensaje': _obtener_mensaje_error(exc, response),
            'detalles': response.data,
            'timestamp': _obtener_timestamp(),
        }
        
        # Agregar información adicional para desarrollo
        if hasattr(context, 'view') and hasattr(context['view'], 'action'):
            custom_response_data['accion'] = context['view'].action
        
        response.data = custom_response_data
        
        # Log del error para monitoreo
        _log_error(exc, context, response.status_code)
        
    else:
        # Manejar excepciones no cubiertas por DRF
        response = _manejar_excepciones_django(exc, context)
    
    return response


def _obtener_mensaje_error(exc, response):
    """
    Obtiene un mensaje de error amigable basado en el tipo de excepción
    """
    status_code = response.status_code
    
    if status_code == 400:
        return 'Los datos enviados no son válidos'
    elif status_code == 401:
        return 'Autenticación requerida'
    elif status_code == 403:
        return 'No tiene permisos para realizar esta acción'
    elif status_code == 404:
        return 'El recurso solicitado no fue encontrado'
    elif status_code == 405:
        return 'Método no permitido'
    elif status_code == 429:
        return 'Demasiadas solicitudes. Intente más tarde'
    elif status_code >= 500:
        return 'Error interno del servidor'
    else:
        return str(exc) if str(exc) else 'Ha ocurrido un error'


def _manejar_excepciones_django(exc, context):
    """
    Maneja excepciones específicas de Django no cubiertas por DRF
    """
    response_data = {
        'error': True,
        'timestamp': _obtener_timestamp(),
    }
    
    if isinstance(exc, ValidationError):
        response_data.update({
            'codigo': 400,
            'mensaje': 'Error de validación',
            'detalles': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
        })
        status_code = status.HTTP_400_BAD_REQUEST
        
    elif isinstance(exc, IntegrityError):
        response_data.update({
            'codigo': 409,
            'mensaje': 'Conflicto de integridad de datos',
            'detalles': 'El registro ya existe o viola restricciones de la base de datos'
        })
        status_code = status.HTTP_409_CONFLICT
        
    elif isinstance(exc, Http404):
        response_data.update({
            'codigo': 404,
            'mensaje': 'Recurso no encontrado',
            'detalles': str(exc)
        })
        status_code = status.HTTP_404_NOT_FOUND
        
    else:
        # Error interno no manejado
        response_data.update({
            'codigo': 500,
            'mensaje': 'Error interno del servidor',
            'detalles': 'Ha ocurrido un error inesperado'
        })
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    
    # Log del error
    _log_error(exc, context, status_code)
    
    return Response(response_data, status=status_code)


def _log_error(exc, context, status_code):
    """
    Registra el error en los logs para monitoreo
    """
    try:
        view = context.get('view', None)
        request = context.get('request', None)
        
        log_data = {
            'excepcion': str(exc),
            'tipo_excepcion': type(exc).__name__,
            'codigo_estado': status_code,
            'vista': view.__class__.__name__ if view else 'Desconocida',
            'url': request.path if request else 'Desconocida',
            'metodo': request.method if request else 'Desconocido',
            'usuario': str(request.user) if request and request.user else 'Anónimo',
        }
        
        if status_code >= 500:
            logger.error(f"Error interno del servidor: {log_data}")
        elif status_code >= 400:
            logger.warning(f"Error de cliente: {log_data}")
        else:
            logger.info(f"Excepción manejada: {log_data}")
            
    except Exception as log_error:
        # Si hay error en el logging, no queremos que afecte la respuesta
        logger.error(f"Error en logging de excepciones: {log_error}")


def _obtener_timestamp():
    """
    Obtiene timestamp en formato ISO para respuestas
    """
    from django.utils import timezone
    return timezone.now().isoformat()


# Excepciones personalizadas para FELICITAFAC
class FelicitafacError(Exception):
    """Excepción base para errores específicos de FELICITAFAC"""
    pass


class ErrorSUNAT(FelicitafacError):
    """Error relacionado con operaciones SUNAT"""
    pass


class ErrorFacturacion(FelicitafacError):
    """Error en procesos de facturación"""
    pass


class ErrorInventario(FelicitafacError):
    """Error en operaciones de inventario"""
    pass


class ErrorIntegracion(FelicitafacError):
    """Error en integraciones externas"""
    pass