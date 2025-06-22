"""
Servicio Nubefact - FELICITAFAC
Integración completa con API Nubefact para SUNAT
Optimizado para hosting compartido
"""

import requests
import json
import logging
from decimal import Decimal
from datetime import datetime, date
from django.conf import settings
from django.utils import timezone
from ..models import LogIntegracion, ConfiguracionIntegracion, ProveedorIntegracion

logger = logging.getLogger(__name__)


class NubefactService:
    """
    Servicio para integración con Nubefact API
    Maneja envío de documentos electrónicos a SUNAT
    """
    
    def __init__(self, configuracion=None):
        """Inicializar servicio con configuración específica"""
        if configuracion:
            self.configuracion = configuracion
        else:
            # Buscar configuración principal
            self.configuracion = ConfiguracionIntegracion.objects.filter(
                proveedor__codigo='nubefact',
                proveedor__es_principal=True,
                activo=True
            ).first()
        
        if not self.configuracion:
            raise ValueError("No se encontró configuración de Nubefact")
        
        self.proveedor = self.configuracion.proveedor
        self.base_url = self.configuracion.url_base
        self.token = self.configuracion.token
        self.ruc_empresa = self.configuracion.ruc_empresa
        
        # Headers por defecto
        self.headers = {
            'Authorization': f'Token token={self.token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def probar_conexion(self):
        """Probar conexión con API Nubefact"""
        try:
            url = f"{self.base_url}/api/v1/ping"
            
            response = requests.get(
                url, 
                headers=self.headers,
                timeout=self.proveedor.tiempo_espera_segundos
            )
            
            if response.status_code == 200:
                return {
                    'exitoso': True,
                    'mensaje': 'Conexión exitosa con Nubefact',
                    'data': response.json()
                }
            else:
                return {
                    'exitoso': False,
                    'mensaje': f'Error de conexión: {response.status_code}',
                    'data': response.text
                }
        
        except requests.exceptions.Timeout:
            return {'exitoso': False, 'mensaje': 'Timeout de conexión'}
        except requests.exceptions.RequestException as e:
            return {'exitoso': False, 'mensaje': f'Error de red: {str(e)}'}
        except Exception as e:
            return {'exitoso': False, 'mensaje': f'Error inesperado: {str(e)}'}
    
    def enviar_documento(self, documento):
        """Enviar documento electrónico a SUNAT via Nubefact"""
        log = self._crear_log(documento, 'emision')
        
        try:
            # Verificar límites
            puede_enviar, motivo = self.proveedor.puede_enviar_documento()
            if not puede_enviar:
                log.marcar_error('LIMITE_ALCANZADO', motivo)
                return {'exitoso': False, 'mensaje': motivo}
            
            # Preparar datos según tipo de documento
            if documento.tipo_documento.codigo_sunat == '01':  # Factura
                data = self._preparar_factura(documento)
                endpoint = '/api/v1/invoices'
            elif documento.tipo_documento.codigo_sunat == '03':  # Boleta
                data = self._preparar_boleta(documento)
                endpoint = '/api/v1/boletas'
            elif documento.tipo_documento.codigo_sunat == '07':  # Nota Crédito
                data = self._preparar_nota_credito(documento)
                endpoint = '/api/v1/credit_notes'
            elif documento.tipo_documento.codigo_sunat == '08':  # Nota Débito
                data = self._preparar_nota_debito(documento)
                endpoint = '/api/v1/debit_notes'
            else:
                log.marcar_error('TIPO_NO_SOPORTADO', f'Tipo {documento.tipo_documento.codigo_sunat} no soportado')
                return {'exitoso': False, 'mensaje': 'Tipo de documento no soportado'}
            
            # Registrar payload de envío
            log.payload_envio = json.dumps(data, default=self._json_serializer)
            log.endpoint_utilizado = endpoint
            log.save()
            
            # Realizar petición
            url = f"{self.base_url}{endpoint}"
            response = requests.post(
                url,
                headers=self.headers,
                json=data,
                timeout=self.proveedor.tiempo_espera_segundos
            )
            
            log.codigo_respuesta_http = response.status_code
            log.payload_respuesta = response.text
            
            if response.status_code == 200:
                resultado = response.json()
                
                # Procesar respuesta exitosa
                if resultado.get('errors'):
                    # Tiene errores de validación
                    log.marcar_error('VALIDATION_ERROR', str(resultado['errors']))
                    return {
                        'exitoso': False,
                        'mensaje': 'Errores de validación',
                        'errores': resultado['errors']
                    }
                else:
                    # Éxito
                    self._procesar_respuesta_exitosa(documento, resultado)
                    log.marcar_exitoso(resultado)
                    
                    return {
                        'exitoso': True,
                        'mensaje': 'Documento enviado exitosamente',
                        'data': resultado
                    }
            else:
                # Error HTTP
                error_msg = self._extraer_mensaje_error(response)
                log.marcar_error(f'HTTP_{response.status_code}', error_msg, response.status_code)
                
                return {
                    'exitoso': False,
                    'mensaje': f'Error HTTP {response.status_code}: {error_msg}'
                }
        
        except requests.exceptions.Timeout:
            log.marcar_timeout()
            return {'exitoso': False, 'mensaje': 'Timeout en la petición'}
        
        except requests.exceptions.RequestException as e:
            log.marcar_error('REQUEST_ERROR', str(e))
            return {'exitoso': False, 'mensaje': f'Error de red: {str(e)}'}
        
        except Exception as e:
            log.marcar_error('UNEXPECTED_ERROR', str(e))
            logger.error(f"Error inesperado enviando documento: {str(e)}")
            return {'exitoso': False, 'mensaje': 'Error interno del sistema'}
    
    def consultar_documento(self, documento):
        """Consultar estado de documento en SUNAT"""
        log = self._crear_log(documento, 'consulta')
        
        try:
            if not documento.hash_documento:
                log.marcar_error('NO_HASH', 'Documento no tiene hash SUNAT')
                return {'exitoso': False, 'mensaje': 'Documento no tiene hash SUNAT'}
            
            # Endpoint según tipo de documento
            if documento.tipo_documento.codigo_sunat == '01':
                endpoint = f'/api/v1/invoices/{documento.hash_documento}'
            elif documento.tipo_documento.codigo_sunat == '03':
                endpoint = f'/api/v1/boletas/{documento.hash_documento}'
            else:
                endpoint = f'/api/v1/documents/{documento.hash_documento}'
            
            url = f"{self.base_url}{endpoint}"
            log.endpoint_utilizado = endpoint
            log.save()
            
            response = requests.get(
                url,
                headers=self.headers,
                timeout=self.proveedor.tiempo_espera_segundos
            )
            
            log.codigo_respuesta_http = response.status_code
            log.payload_respuesta = response.text
            
            if response.status_code == 200:
                resultado = response.json()
                log.marcar_exitoso(resultado)
                
                # Actualizar estado del documento
                self._actualizar_estado_documento(documento, resultado)
                
                return {
                    'exitoso': True,
                    'mensaje': 'Consulta exitosa',
                    'data': resultado
                }
            else:
                error_msg = self._extraer_mensaje_error(response)
                log.marcar_error(f'HTTP_{response.status_code}', error_msg, response.status_code)
                
                return {
                    'exitoso': False,
                    'mensaje': f'Error en consulta: {error_msg}'
                }
        
        except Exception as e:
            log.marcar_error('UNEXPECTED_ERROR', str(e))
            logger.error(f"Error consultando documento: {str(e)}")
            return {'exitoso': False, 'mensaje': 'Error interno del sistema'}
    
    def enviar_comunicacion_baja(self, documento):
        """Enviar comunicación de baja individual"""
        log = self._crear_log(documento, 'comunicacion_baja')
        
        try:
            data = {
                'operacion': 'generar_anulacion',
                'tipo_de_comprobante': int(documento.tipo_documento.codigo_sunat),
                'serie': documento.serie_documento.serie,
                'numero': documento.numero,
                'motivo': documento.motivo_anulacion or 'Anulación del documento',
                'fecha_de_baja': datetime.now().strftime('%d-%m-%Y')
            }
            
            log.payload_envio = json.dumps(data)
            log.endpoint_utilizado = '/api/v1/voids'
            log.save()
            
            url = f"{self.base_url}/api/v1/voids"
            response = requests.post(
                url,
                headers=self.headers,
                json=data,
                timeout=self.proveedor.tiempo_espera_segundos
            )
            
            log.codigo_respuesta_http = response.status_code
            log.payload_respuesta = response.text
            
            if response.status_code == 200:
                resultado = response.json()
                log.marcar_exitoso(resultado)
                
                return {
                    'exitoso': True,
                    'mensaje': 'Comunicación de baja enviada',
                    'data': resultado
                }
            else:
                error_msg = self._extraer_mensaje_error(response)
                log.marcar_error(f'HTTP_{response.status_code}', error_msg, response.status_code)
                
                return {
                    'exitoso': False,
                    'mensaje': f'Error en comunicación de baja: {error_msg}'
                }
        
        except Exception as e:
            log.marcar_error('UNEXPECTED_ERROR', str(e))
            logger.error(f"Error en comunicación de baja: {str(e)}")
            return {'exitoso': False, 'mensaje': 'Error interno del sistema'}
    
    def _preparar_factura(self, documento):
        """Preparar datos de factura para Nubefact"""
        return {
            'operacion': 'generar_comprobante',
            'tipo_de_comprobante': 1,  # Factura
            'serie': documento.serie_documento.serie,
            'numero': documento.numero,
            'sunat_transaction': 1,  # Venta interna
            'cliente_tipo_de_documento': int(documento.cliente_tipo_documento),
            'cliente_numero_de_documento': documento.cliente_numero_documento,
            'cliente_denominacion': documento.cliente_razon_social,
            'cliente_direccion': documento.cliente_direccion,
            'cliente_email': documento.cliente_email or '',
            'fecha_de_emision': documento.fecha_emision.strftime('%d-%m-%Y'),
            'fecha_de_vencimiento': documento.fecha_vencimiento.strftime('%d-%m-%Y') if documento.fecha_vencimiento else '',
            'moneda': documento.moneda,
            'tipo_de_cambio': float(documento.tipo_cambio),
            'porcentaje_de_igv': 18.00,
            'descuento_global': float(documento.total_descuentos),
            'total_descuento': float(documento.total_descuentos),
            'total_anticipo': 0.00,
            'total_gravada': float(documento.base_imponible),
            'total_inafecta': float(documento.total_inafecto),
            'total_exonerada': float(documento.total_exonerado),
            'total_igv': float(documento.igv),
            'total_gratuita': float(documento.total_gratuito),
            'total_otros_cargos': 0.00,
            'total': float(documento.total),
            'observaciones': documento.observaciones or '',
            'documento_que_se_modifica_tipo': '',
            'documento_que_se_modifica_serie': '',
            'documento_que_se_modifica_numero': '',
            'tipo_de_nota_de_credito': '',
            'tipo_de_nota_de_debito': '',
            'enviar_automaticamente_a_la_sunat': True,
            'enviar_automaticamente_al_cliente': self.configuracion.enviar_email,
            'codigo_unico': str(documento.uuid),
            'condiciones_de_pago': documento.condiciones_pago,
            'medio_de_pago': 'Contado',
            'placa_vehiculo': '',
            'orden_compra_servicio': '',
            'tabla_personalizada_codigo': '',
            'formato_de_pdf': self.configuracion.formato_pdf,
            'items': self._preparar_items(documento)
        }
    
    def _preparar_boleta(self, documento):
        """Preparar datos de boleta para Nubefact"""
        data = self._preparar_factura(documento)
        data['tipo_de_comprobante'] = 2  # Boleta
        return data
    
    def _preparar_nota_credito(self, documento):
        """Preparar datos de nota de crédito para Nubefact"""
        data = self._preparar_factura(documento)
        data['tipo_de_comprobante'] = 7  # Nota de Crédito
        
        if documento.documento_referencia:
            data['documento_que_se_modifica_tipo'] = documento.documento_referencia.tipo_documento.codigo_sunat
            data['documento_que_se_modifica_serie'] = documento.documento_referencia.serie_documento.serie
            data['documento_que_se_modifica_numero'] = str(documento.documento_referencia.numero)
            data['tipo_de_nota_de_credito'] = documento.tipo_nota or '01'
        
        return data
    
    def _preparar_nota_debito(self, documento):
        """Preparar datos de nota de débito para Nubefact"""
        data = self._preparar_factura(documento)
        data['tipo_de_comprobante'] = 8  # Nota de Débito
        
        if documento.documento_referencia:
            data['documento_que_se_modifica_tipo'] = documento.documento_referencia.tipo_documento.codigo_sunat
            data['documento_que_se_modifica_serie'] = documento.documento_referencia.serie_documento.serie
            data['documento_que_se_modifica_numero'] = str(documento.documento_referencia.numero)
            data['tipo_de_nota_de_debito'] = documento.tipo_nota or '01'
        
        return data
    
    def _preparar_items(self, documento):
        """Preparar items del documento para Nubefact"""
        items = []
        
        for detalle in documento.detalles.filter(activo=True).order_by('numero_item'):
            item = {
                'unidad_de_medida': detalle.unidad_medida,
                'codigo': detalle.codigo_producto,
                'descripcion': detalle.descripcion,
                'cantidad': float(detalle.cantidad),
                'valor_unitario': float(detalle.precio_unitario),
                'precio_unitario': float(detalle.precio_unitario_con_igv),
                'descuento': float(detalle.descuento),
                'subtotal': float(detalle.subtotal),
                'tipo_de_igv': int(detalle.tipo_afectacion_igv),
                'igv': float(detalle.igv),
                'total': float(detalle.total_item),
                'anticipo_regularizacion': False,
                'anticipo_documento_serie': '',
                'anticipo_documento_numero': ''
            }
            items.append(item)
        
        return items
    
    def _procesar_respuesta_exitosa(self, documento, resultado):
        """Procesar respuesta exitosa de Nubefact"""
        try:
            # Actualizar documento con datos de Nubefact
            documento.estado = 'enviado_sunat'
            documento.fecha_envio_sunat = timezone.now()
            
            if 'hash' in resultado:
                documento.hash_documento = resultado['hash']
            
            if 'codigo_hash' in resultado:
                documento.hash_documento = resultado['codigo_hash']
            
            if 'enlace_del_pdf' in resultado:
                documento.enlace_pdf = resultado['enlace_del_pdf']
            
            if 'enlace_del_xml' in resultado:
                documento.enlace_xml = resultado['enlace_del_xml']
            
            if 'enlace_del_cdr' in resultado:
                documento.enlace_cdr = resultado['enlace_del_cdr']
            
            if 'codigo_qr' in resultado:
                documento.codigo_qr = resultado['codigo_qr']
            
            documento.save(update_fields=[
                'estado', 'fecha_envio_sunat', 'hash_documento',
                'enlace_pdf', 'enlace_xml', 'enlace_cdr', 'codigo_qr'
            ])
            
            logger.info(f"Documento {documento.numero_completo} enviado exitosamente a SUNAT")
        
        except Exception as e:
            logger.error(f"Error procesando respuesta exitosa: {str(e)}")
    
    def _actualizar_estado_documento(self, documento, resultado):
        """Actualizar estado del documento según respuesta de consulta"""
        try:
            estado_sunat = resultado.get('sunat_status')
            
            if estado_sunat == 'ACEPTADO':
                documento.estado = 'aceptado_sunat'
            elif estado_sunat == 'RECHAZADO':
                documento.estado = 'rechazado_sunat'
            elif estado_sunat == 'OBSERVADO':
                documento.estado = 'observado'
            
            documento.fecha_respuesta_sunat = timezone.now()
            documento.save(update_fields=['estado', 'fecha_respuesta_sunat'])
        
        except Exception as e:
            logger.error(f"Error actualizando estado documento: {str(e)}")
    
    def _crear_log(self, documento, tipo_operacion):
        """Crear log de integración"""
        return LogIntegracion.objects.create(
            proveedor=self.proveedor,
            configuracion=self.configuracion,
            documento_electronico=documento,
            tipo_operacion=tipo_operacion,
            metodo_http='POST',
            headers_envio=json.dumps(self.headers)
        )
    
    def _extraer_mensaje_error(self, response):
        """Extraer mensaje de error de la respuesta"""
        try:
            error_data = response.json()
            if 'errors' in error_data:
                return str(error_data['errors'])
            elif 'message' in error_data:
                return error_data['message']
            else:
                return error_data
        except:
            return response.text
    
    def _json_serializer(self, obj):
        """Serializer personalizado para JSON"""
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")