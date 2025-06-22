"""
Views de Facturación - FELICITAFAC
API REST para documentos electrónicos SUNAT
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count
from django.db import transaction
from django.utils import timezone
import logging

from .models import (
    TipoDocumentoElectronico, SerieDocumento, DocumentoElectronico,
    FormaPago, PagoDocumento
)
from .serializers import (
    TipoDocumentoElectronicoSerializer, SerieDocumentoSerializer,
    DocumentoElectronicoSerializer, DocumentoElectronicoListSerializer,
    DocumentoElectronicoCreateSerializer, DocumentoBusquedaSerializer,
    FormaPagoSerializer, EstadisticasFacturacionSerializer,
    AnulacionDocumentoSerializer
)
from aplicaciones.core.permissions import PuedeVerFacturacion, PuedeEditarFacturacion
from aplicaciones.core.pagination import PaginacionEstandar

logger = logging.getLogger(__name__)


class TipoDocumentoElectronicoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoDocumentoElectronico.objects.filter(activo=True).order_by('codigo_sunat')
    serializer_class = TipoDocumentoElectronicoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class SerieDocumentoViewSet(viewsets.ModelViewSet):
    queryset = SerieDocumento.objects.select_related('sucursal', 'tipo_documento').filter(activo=True)
    serializer_class = SerieDocumentoSerializer
    permission_classes = [IsAuthenticated, PuedeEditarFacturacion]
    
    def get_queryset(self):
        queryset = self.queryset
        sucursal = self.request.query_params.get('sucursal')
        tipo_documento = self.request.query_params.get('tipo_documento')
        
        if sucursal:
            queryset = queryset.filter(sucursal_id=sucursal)
        if tipo_documento:
            queryset = queryset.filter(tipo_documento_id=tipo_documento)
            
        return queryset.order_by('tipo_documento', 'serie')


class FormaPagoViewSet(viewsets.ModelViewSet):
    queryset = FormaPago.objects.filter(activo=True).order_by('orden', 'nombre')
    serializer_class = FormaPagoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class DocumentoElectronicoViewSet(viewsets.ModelViewSet):
    queryset = DocumentoElectronico.objects.select_related(
        'tipo_documento', 'serie_documento', 'cliente', 'vendedor'
    ).prefetch_related('detalles', 'pagos').filter(activo=True)
    
    permission_classes = [IsAuthenticated, PuedeVerFacturacion]
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = {
        'tipo_documento': ['exact'],
        'estado': ['exact'],
        'cliente': ['exact'],
        'vendedor': ['exact'],
        'moneda': ['exact'],
        'fecha_emision': ['gte', 'lte', 'exact'],
        'total': ['gte', 'lte'],
    }
    
    search_fields = ['numero_completo', 'cliente_razon_social', 'cliente_numero_documento']
    ordering_fields = ['fecha_emision', 'numero', 'total', 'cliente_razon_social']
    ordering = ['-fecha_emision', '-numero']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentoElectronicoListSerializer
        elif self.action == 'create':
            return DocumentoElectronicoCreateSerializer
        return DocumentoElectronicoSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            permission_classes = [IsAuthenticated, PuedeEditarFacturacion]
        else:
            permission_classes = [IsAuthenticated, PuedeVerFacturacion]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Vendedores solo ven sus documentos
        if hasattr(user, 'rol') and user.rol.codigo == 'vendedor':
            queryset = queryset.filter(vendedor=user)
        
        return queryset
    
    def perform_create(self, serializer):
        try:
            # Asignar vendedor automáticamente
            documento = serializer.save(vendedor=self.request.user)
            
            # Enviar a SUNAT automáticamente
            self._enviar_sunat(documento)
            
            logger.info(f"Documento creado: {documento.numero_completo} por {self.request.user.username}")
        except Exception as e:
            logger.error(f"Error creando documento: {str(e)}")
            raise
    
    def _enviar_sunat(self, documento):
        """Envío automático a SUNAT via Nubefact"""
        try:
            from aplicaciones.integraciones.services.nubefact import NubefactService
            
            nubefact = NubefactService()
            resultado = nubefact.enviar_documento(documento)
            
            if resultado['exitoso']:
                documento.estado = 'enviado_sunat'
                documento.fecha_envio_sunat = timezone.now()
                documento.save(update_fields=['estado', 'fecha_envio_sunat'])
            
        except Exception as e:
            logger.error(f"Error enviando a SUNAT: {str(e)}")
    
    @action(detail=False, methods=['post'])
    def busqueda_avanzada(self, request):
        serializer = DocumentoBusquedaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset()
        data = serializer.validated_data
        
        # Aplicar filtros
        if data.get('numero_completo'):
            queryset = queryset.filter(numero_completo__icontains=data['numero_completo'])
        
        if data.get('tipo_documento'):
            queryset = queryset.filter(tipo_documento_id=data['tipo_documento'])
        
        if data.get('cliente'):
            queryset = queryset.filter(cliente_id=data['cliente'])
        
        if data.get('estado'):
            queryset = queryset.filter(estado=data['estado'])
        
        if data.get('fecha_desde'):
            queryset = queryset.filter(fecha_emision__date__gte=data['fecha_desde'])
        
        if data.get('fecha_hasta'):
            queryset = queryset.filter(fecha_emision__date__lte=data['fecha_hasta'])
        
        if data.get('moneda'):
            queryset = queryset.filter(moneda=data['moneda'])
        
        if data.get('monto_minimo'):
            queryset = queryset.filter(total__gte=data['monto_minimo'])
        
        if data.get('monto_maximo'):
            queryset = queryset.filter(total__lte=data['monto_maximo'])
        
        if data.get('vendedor'):
            queryset = queryset.filter(vendedor_id=data['vendedor'])
        
        # Estado de pago
        estado_pago = data.get('estado_pago')
        if estado_pago:
            if estado_pago == 'pendiente':
                queryset = queryset.filter(pagos__isnull=True)
            elif estado_pago == 'pagado':
                queryset = queryset.annotate(
                    total_pagado=Sum('pagos__monto')
                ).filter(total_pagado__gte=F('total'))
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DocumentoElectronicoListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = DocumentoElectronicoListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        documento = self.get_object()
        
        if not request.user.has_perm('facturacion.change_documentoelectronico'):
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AnulacionDocumentoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                motivo = serializer.validated_data['motivo']
                documento.anular(motivo)
                
                # Enviar comunicación de baja a SUNAT
                if serializer.validated_data.get('enviar_sunat', True):
                    self._enviar_comunicacion_baja(documento)
                
                logger.info(f"Documento anulado: {documento.numero_completo} - Motivo: {motivo}")
                
                return Response({'message': 'Documento anulado exitosamente'})
        
        except Exception as e:
            logger.error(f"Error anulando documento: {str(e)}")
            return Response({'error': 'Error interno'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _enviar_comunicacion_baja(self, documento):
        """Enviar comunicación de baja a SUNAT"""
        try:
            from aplicaciones.integraciones.services.nubefact import NubefactService
            
            nubefact = NubefactService()
            nubefact.enviar_comunicacion_baja(documento)
            
        except Exception as e:
            logger.error(f"Error enviando comunicación de baja: {str(e)}")
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Obtener PDF del documento"""
        documento = self.get_object()
        
        if documento.enlace_pdf:
            return Response({'enlace_pdf': documento.enlace_pdf})
        else:
            return Response({'error': 'PDF no disponible'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def xml(self, request, pk=None):
        """Obtener XML del documento"""
        documento = self.get_object()
        
        if documento.enlace_xml:
            return Response({'enlace_xml': documento.enlace_xml})
        else:
            return Response({'error': 'XML no disponible'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def reenviar_sunat(self, request, pk=None):
        """Reenviar documento a SUNAT"""
        documento = self.get_object()
        
        if documento.estado in ['aceptado_sunat', 'anulado']:
            return Response({'error': 'No se puede reenviar'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            self._enviar_sunat(documento)
            return Response({'message': 'Documento reenviado a SUNAT'})
        
        except Exception as e:
            logger.error(f"Error reenviando a SUNAT: {str(e)}")
            return Response({'error': 'Error interno'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Estadísticas de facturación"""
        if not request.user.has_perm('facturacion.view_estadisticas'):
            return Response({'error': 'Sin permisos'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            queryset = self.get_queryset()
            
            # Período (último mes por defecto)
            fecha_desde = request.query_params.get('fecha_desde')
            fecha_hasta = request.query_params.get('fecha_hasta')
            
            if not fecha_desde:
                fecha_desde = timezone.now().replace(day=1).date()
            if not fecha_hasta:
                fecha_hasta = timezone.now().date()
            
            queryset = queryset.filter(
                fecha_emision__date__gte=fecha_desde,
                fecha_emision__date__lte=fecha_hasta
            )
            
            # Estadísticas básicas
            total_documentos = queryset.count()
            total_facturado = queryset.aggregate(Sum('total'))['total__sum'] or 0
            total_igv = queryset.aggregate(Sum('igv'))['igv__sum'] or 0
            
            # Por estado
            por_estado = queryset.values('estado').annotate(
                cantidad=Count('id'),
                monto=Sum('total')
            )
            documentos_por_estado = {item['estado']: item['cantidad'] for item in por_estado}
            
            # Por tipo de documento
            por_tipo = queryset.values('tipo_documento__nombre').annotate(
                cantidad=Count('id'),
                monto=Sum('total')
            )
            por_tipo_documento = {item['tipo_documento__nombre']: {
                'cantidad': item['cantidad'],
                'monto': float(item['monto'] or 0)
            } for item in por_tipo}
            
            # Por moneda
            por_moneda_data = queryset.values('moneda').annotate(
                cantidad=Count('id'),
                monto=Sum('total')
            )
            por_moneda = {item['moneda']: {
                'cantidad': item['cantidad'],
                'monto': float(item['monto'] or 0)
            } for item in por_moneda_data}
            
            # Documentos vencidos
            documentos_vencidos = queryset.filter(
                fecha_vencimiento__lt=timezone.now().date(),
                estado__in=['emitido', 'aceptado_sunat']
            ).count()
            
            # Documentos por vencer (próximos 7 días)
            fecha_limite = timezone.now().date() + timezone.timedelta(days=7)
            documentos_por_vencer = queryset.filter(
                fecha_vencimiento__lte=fecha_limite,
                fecha_vencimiento__gte=timezone.now().date(),
                estado__in=['emitido', 'aceptado_sunat']
            ).count()
            
            # Promedios
            ticket_promedio = total_facturado / total_documentos if total_documentos > 0 else 0
            
            estadisticas = {
                'total_documentos': total_documentos,
                'total_facturado': total_facturado,
                'total_igv': total_igv,
                'documentos_por_estado': documentos_por_estado,
                'por_tipo_documento': por_tipo_documento,
                'por_moneda': por_moneda,
                'documentos_vencidos': documentos_vencidos,
                'documentos_por_vencer': documentos_por_vencer,
                'ticket_promedio': ticket_promedio,
                'documentos_promedio_dia': 0,  # Calcular según período
                'facturacion_diaria': [],  # Implementar según necesidad
                'facturacion_mensual': [],  # Implementar según necesidad
                'top_clientes': [],  # Implementar según necesidad
            }
            
            return Response(EstadisticasFacturacionSerializer(estadisticas).data)
        
        except Exception as e:
            logger.error(f"Error generando estadísticas: {str(e)}")
            return Response({'error': 'Error interno'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def documentos_pendientes(self, request):
        """Documentos pendientes de envío o con errores"""
        pendientes = self.get_queryset().filter(
            estado__in=['borrador', 'rechazado_sunat', 'observado']
        )
        
        serializer = DocumentoElectronicoListSerializer(pendientes, many=True)
        return Response({
            'total': pendientes.count(),
            'documentos': serializer.data
        })