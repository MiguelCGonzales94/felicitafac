"""
Webhook URLs - FELICITAFAC
Endpoints para recibir webhooks de Nubefact y otros proveedores
"""

from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse, HttpResponseBadRequest
from django.utils.decorators import method_decorator
import json
import logging
from ..models import WebhookIntegracion, ProveedorIntegracion

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def webhook_nubefact(request):
    """Webhook para recibir notificaciones de Nubefact"""
    try:
        # Obtener proveedor Nubefact
        proveedor = ProveedorIntegracion.objects.filter(
            codigo='nubefact', activo=True
        ).first()
        
        if not proveedor:
            return HttpResponseBadRequest("Proveedor no configurado")
        
        # Obtener IP del cliente
        ip_origen = request.META.get('HTTP_X_FORWARDED_FOR', 
                                   request.META.get('REMOTE_ADDR', ''))
        if ip_origen:
            ip_origen = ip_origen.split(',')[0].strip()
        
        # Obtener headers y payload
        headers_recibidos = {
            key: value for key, value in request.META.items() 
            if key.startswith('HTTP_')
        }
        
        try:
            payload = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            payload = request.body.decode('utf-8')
        
        # Determinar tipo de webhook
        tipo_webhook = 'notificacion_general'
        if isinstance(payload, dict):
            if 'estado' in payload:
                estado = payload.get('estado', '').lower()
                if estado in ['aceptado', 'procesado']:
                    tipo_webhook = 'documento_procesado'
                elif estado in ['rechazado', 'error']:
                    tipo_webhook = 'documento_rechazado'
            elif 'sunat_status' in payload:
                tipo_webhook = 'respuesta_sunat'
        
        # Crear registro de webhook
        webhook = WebhookIntegracion.objects.create(
            proveedor=proveedor,
            tipo_webhook=tipo_webhook,
            headers_recibidos=json.dumps(headers_recibidos),
            payload_recibido=json.dumps(payload) if isinstance(payload, dict) else payload,
            documento_referencia=payload.get('numero_documento') if isinstance(payload, dict) else None,
            ip_origen=ip_origen,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            signature_header=request.META.get('HTTP_X_SIGNATURE', ''),
            signature_valida=True  # Implementar validación real si es necesario
        )
        
        # Procesar webhook inmediatamente
        try:
            webhook.procesar()
            logger.info(f"Webhook Nubefact procesado: {webhook.id}")
        except Exception as e:
            logger.error(f"Error procesando webhook: {str(e)}")
        
        return JsonResponse({
            'status': 'received',
            'webhook_id': webhook.id,
            'message': 'Webhook procesado exitosamente'
        })
    
    except Exception as e:
        logger.error(f"Error en webhook Nubefact: {str(e)}")
        return HttpResponseBadRequest("Error procesando webhook")

@csrf_exempt
@require_http_methods(["POST"])
def webhook_sunat_directo(request):
    """Webhook para notificaciones directas de SUNAT (futuro)"""
    try:
        proveedor = ProveedorIntegracion.objects.filter(
            codigo='sunat_directa', activo=True
        ).first()
        
        if not proveedor:
            return HttpResponseBadRequest("Proveedor SUNAT no configurado")
        
        # Procesar webhook SUNAT (implementación futura)
        payload = json.loads(request.body.decode('utf-8'))
        
        webhook = WebhookIntegracion.objects.create(
            proveedor=proveedor,
            tipo_webhook='respuesta_sunat',
            payload_recibido=json.dumps(payload),
            ip_origen=request.META.get('REMOTE_ADDR', ''),
            signature_valida=True
        )
        
        webhook.procesar()
        
        return JsonResponse({'status': 'received'})
    
    except Exception as e:
        logger.error(f"Error en webhook SUNAT: {str(e)}")
        return HttpResponseBadRequest("Error procesando webhook")

# URLs de webhooks
urlpatterns = [
    path('nubefact/', webhook_nubefact, name='webhook-nubefact'),
    path('sunat/', webhook_sunat_directo, name='webhook-sunat'),
]