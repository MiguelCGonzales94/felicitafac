"""
Views de Clientes - FELICITAFAC
Sistema de Facturación Electrónica para Perú
API REST con funcionalidades específicas para gestión de clientes
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .models import TipoDocumento, Cliente, ContactoCliente
from .serializers import (
    TipoDocumentoSerializer, ClienteSerializer, ClienteListSerializer,
    ClienteCreateSerializer, ClienteUpdateSerializer, ClienteBusquedaSerializer,
    ContactoClienteSerializer, EstadisticasClienteSerializer
)
from aplicaciones.core.permissions import (
    EsAdminOContador, EsVendedorOSuperior, PuedeVerClientes, PuedeEditarClientes
)
from aplicaciones.core.utils import obtener_usuario_actual
from aplicaciones.core.pagination import PaginacionEstandar

logger = logging.getLogger(__name__)


class TipoDocumentoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para tipos de documentos de identidad
    Solo lectura - datos maestros del sistema
    """
    
    queryset = TipoDocumento.objects.filter(activo=True).order_by('codigo')
    serializer_class = TipoDocumentoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Sin paginación para datos maestros
    
    def get_queryset(self):
        """Filtrar tipos de documento activos"""
        return TipoDocumento.objects.filter(activo=True).order_by('codigo')
    
    @action(detail=False, methods=['get'])
    def para_personas_naturales(self, request):
        """Tipos de documento para personas naturales"""
        tipos = self.get_queryset().filter(codigo__in=['1', '4', '7'])
        serializer = self.get_serializer(tipos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def para_personas_juridicas(self, request):
        """Tipos de documento para personas jurídicas"""
        tipos = self.get_queryset().filter(codigo='6')
        serializer = self.get_serializer(tipos, many=True)
        return Response(serializer.data)


class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal para gestión de clientes
    CRUD completo con funcionalidades específicas
    """
    
    queryset = Cliente.objects.select_related(
        'tipo_documento'
    ).prefetch_related(
        'contactos'
    ).filter(activo=True)
    
    permission_classes = [IsAuthenticated, PuedeVerClientes]
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtros
    filterset_fields = {
        'tipo_cliente': ['exact'],
        'tipo_documento': ['exact'],
        'bloqueado': ['exact'],
        'departamento': ['exact', 'icontains'],
        'provincia': ['exact', 'icontains'],
        'fecha_creacion': ['gte', 'lte'],
        'total_compras': ['gte', 'lte'],
        'validado_sunat': ['exact'],
    }
    
    # Búsqueda
    search_fields = [
        'numero_documento', 'razon_social', 'nombre_comercial',
        'email', 'telefono', 'celular'
    ]
    
    # Ordenamiento
    ordering_fields = [
        'fecha_creacion', 'razon_social', 'numero_documento',
        'total_compras', 'numero_compras', 'fecha_ultima_compra'
    ]
    ordering = ['-fecha_creacion']
    
    def get_serializer_class(self):
        """Seleccionar serializer según acción"""
        if self.action == 'list':
            return ClienteListSerializer
        elif self.action == 'create':
            return ClienteCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClienteUpdateSerializer
        else:
            return ClienteSerializer
    
    def get_permissions(self):
        """Permisos específicos por acción"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, PuedeEditarClientes]
        else:
            permission_classes = [IsAuthenticated, PuedeVerClientes]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filtrar queryset según permisos del usuario"""
        user = self.request.user
        queryset = self.queryset
        
        # Los vendedores solo ven sus clientes
        if hasattr(user, 'rol') and user.rol.codigo == 'vendedor':
            # Filtrar clientes del vendedor (por documentos creados)
            queryset = queryset.filter(
                documentos_electronicos__vendedor=user
            ).distinct()
        
        return queryset
    
    def perform_create(self, serializer):
        """Crear cliente con auditoría"""
        try:
            cliente = serializer.save()
            logger.info(
                f"Cliente creado: {cliente.numero_documento} - {cliente.razon_social} "
                f"por usuario {self.request.user.username}"
            )
        except Exception as e:
            logger.error(f"Error creando cliente: {str(e)}")
            raise
    
    def perform_update(self, serializer):
        """Actualizar cliente con auditoría"""
        try:
            cliente = serializer.save()
            logger.info(
                f"Cliente actualizado: {cliente.numero_documento} - {cliente.razon_social} "
                f"por usuario {self.request.user.username}"
            )
        except Exception as e:
            logger.error(f"Error actualizando cliente: {str(e)}")
            raise
    
    def perform_destroy(self, instance):
        """Eliminación lógica del cliente"""
        try:
            instance.soft_delete()
            logger.info(
                f"Cliente eliminado: {instance.numero_documento} - {instance.razon_social} "
                f"por usuario {self.request.user.username}"
            )
        except Exception as e:
            logger.error(f"Error eliminando cliente: {str(e)}")
            raise
    
    @action(detail=False, methods=['post'])
    def busqueda_avanzada(self, request):
        """Búsqueda avanzada de clientes con filtros múltiples"""
        serializer = ClienteBusquedaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Parámetros de búsqueda inválidos', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset()
        data = serializer.validated_data
        
        # Aplicar filtros
        if data.get('termino'):
            termino = data['termino']
            queryset = queryset.filter(
                Q(numero_documento__icontains=termino) |
                Q(razon_social__icontains=termino) |
                Q(nombre_comercial__icontains=termino) |
                Q(email__icontains=termino)
            )
        
        if data.get('tipo_cliente'):
            queryset = queryset.filter(tipo_cliente=data['tipo_cliente'])
        
        if data.get('tipo_documento'):
            queryset = queryset.filter(tipo_documento_id=data['tipo_documento'])
        
        if data.get('departamento'):
            queryset = queryset.filter(departamento__icontains=data['departamento'])
        
        if data.get('provincia'):
            queryset = queryset.filter(provincia__icontains=data['provincia'])
        
        if data.get('bloqueado') is not None:
            queryset = queryset.filter(bloqueado=data['bloqueado'])
        
        if data.get('con_credito'):
            queryset = queryset.filter(credito_limite__gt=0)
        
        if data.get('fecha_creacion_desde'):
            queryset = queryset.filter(fecha_creacion__date__gte=data['fecha_creacion_desde'])
        
        if data.get('fecha_creacion_hasta'):
            queryset = queryset.filter(fecha_creacion__date__lte=data['fecha_creacion_hasta'])
        
        if data.get('total_compras_minimo'):
            queryset = queryset.filter(total_compras__gte=data['total_compras_minimo'])
        
        # Paginar resultados
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ClienteListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ClienteListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def contactos(self, request, pk=None):
        """Obtener contactos del cliente"""
        cliente = self.get_object()
        contactos = cliente.contactos.filter(activo=True).order_by('-es_principal', 'nombres')
        serializer = ContactoClienteSerializer(contactos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def agregar_contacto(self, request, pk=None):
        """Agregar contacto al cliente"""
        cliente = self.get_object()
        
        # Verificar permisos de edición
        if not request.user.has_perm('clientes.change_cliente'):
            return Response(
                {'error': 'No tiene permisos para agregar contactos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ContactoClienteSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Si es principal, desmarcar otros como principales
                    if serializer.validated_data.get('es_principal', False):
                        ContactoCliente.objects.filter(
                            cliente=cliente, es_principal=True
                        ).update(es_principal=False)
                    
                    contacto = serializer.save(cliente=cliente)
                    
                    logger.info(
                        f"Contacto agregado al cliente {cliente.numero_documento}: "
                        f"{contacto.obtener_nombre_completo()}"
                    )
                    
                    return Response(
                        ContactoClienteSerializer(contacto).data,
                        status=status.HTTP_201_CREATED
                    )
            except Exception as e:
                logger.error(f"Error agregando contacto: {str(e)}")
                return Response(
                    {'error': 'Error interno del servidor'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def bloquear(self, request, pk=None):
        """Bloquear cliente"""
        cliente = self.get_object()
        
        # Verificar permisos
        if not request.user.has_perm('clientes.change_cliente'):
            return Response(
                {'error': 'No tiene permisos para bloquear clientes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        motivo = request.data.get('motivo', '')
        if not motivo:
            return Response(
                {'error': 'Motivo de bloqueo es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cliente.bloqueado = True
            cliente.motivo_bloqueo = motivo
            cliente.save(update_fields=['bloqueado', 'motivo_bloqueo'])
            
            logger.info(
                f"Cliente bloqueado: {cliente.numero_documento} - "
                f"Motivo: {motivo} - Usuario: {request.user.username}"
            )
            
            return Response({'message': 'Cliente bloqueado exitosamente'})
        
        except Exception as e:
            logger.error(f"Error bloqueando cliente: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def desbloquear(self, request, pk=None):
        """Desbloquear cliente"""
        cliente = self.get_object()
        
        # Verificar permisos
        if not request.user.has_perm('clientes.change_cliente'):
            return Response(
                {'error': 'No tiene permisos para desbloquear clientes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            cliente.bloqueado = False
            cliente.motivo_bloqueo = None
            cliente.save(update_fields=['bloqueado', 'motivo_bloqueo'])
            
            logger.info(
                f"Cliente desbloqueado: {cliente.numero_documento} - "
                f"Usuario: {request.user.username}"
            )
            
            return Response({'message': 'Cliente desbloqueado exitosamente'})
        
        except Exception as e:
            logger.error(f"Error desbloqueando cliente: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def validar_sunat(self, request, pk=None):
        """Validar datos del cliente con SUNAT"""
        cliente = self.get_object()
        
        # Solo para RUCs
        if cliente.tipo_documento.codigo != '6':
            return Response(
                {'error': 'Solo se puede validar RUCs con SUNAT'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Aquí iría la integración real con SUNAT
            # Por ahora simulamos la validación
            from time import sleep
            sleep(1)  # Simular llamada a API
            
            # Actualizar datos de validación
            cliente.validado_sunat = True
            cliente.fecha_validacion_sunat = timezone.now()
            cliente.estado_sunat = 'ACTIVO'
            cliente.condicion_sunat = 'HABIDO'
            cliente.save(update_fields=[
                'validado_sunat', 'fecha_validacion_sunat',
                'estado_sunat', 'condicion_sunat'
            ])
            
            logger.info(f"Cliente validado con SUNAT: {cliente.numero_documento}")
            
            return Response({
                'message': 'Cliente validado exitosamente con SUNAT',
                'estado_sunat': cliente.estado_sunat,
                'condicion_sunat': cliente.condicion_sunat
            })
        
        except Exception as e:
            logger.error(f"Error validando cliente con SUNAT: {str(e)}")
            return Response(
                {'error': 'Error al validar con SUNAT'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Estadísticas generales de clientes"""
        # Solo admin y contadores pueden ver estadísticas completas
        if not request.user.has_perm('clientes.view_estadisticas'):
            return Response(
                {'error': 'No tiene permisos para ver estadísticas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            queryset = self.get_queryset()
            total_clientes = queryset.count()
            
            # Estadísticas básicas
            estadisticas = {
                'total_clientes': total_clientes,
                'clientes_activos': queryset.filter(bloqueado=False).count(),
                'clientes_bloqueados': queryset.filter(bloqueado=True).count(),
                'clientes_con_compras': queryset.filter(numero_compras__gt=0).count(),
            }
            
            # Por tipo de cliente
            por_tipo = queryset.values('tipo_cliente').annotate(
                cantidad=Count('id')
            ).order_by('-cantidad')
            estadisticas['por_tipo_cliente'] = {
                item['tipo_cliente']: item['cantidad'] for item in por_tipo
            }
            
            # Por tipo de documento
            por_tipo_doc = queryset.values('tipo_documento__nombre').annotate(
                cantidad=Count('id')
            ).order_by('-cantidad')
            estadisticas['por_tipo_documento'] = {
                item['tipo_documento__nombre']: item['cantidad'] for item in por_tipo_doc
            }
            
            # Por departamento
            por_departamento = queryset.values('departamento').annotate(
                cantidad=Count('id')
            ).order_by('-cantidad')[:10]
            estadisticas['por_departamento'] = {
                item['departamento']: item['cantidad'] for item in por_departamento
            }
            
            # Totales de compras
            totales_compras = queryset.aggregate(
                total_compras=Sum('total_compras'),
                promedio_compras=Avg('total_compras')
            )
            estadisticas['total_compras_general'] = totales_compras['total_compras'] or 0
            estadisticas['promedio_compras_cliente'] = totales_compras['promedio_compras'] or 0
            
            # Clientes nuevos este mes
            inicio_mes = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            estadisticas['clientes_nuevos_mes'] = queryset.filter(
                fecha_creacion__gte=inicio_mes
            ).count()
            
            # Clientes con crédito
            estadisticas['clientes_con_credito'] = queryset.filter(
                credito_limite__gt=0
            ).count()
            
            # Top clientes por compras
            top_clientes = queryset.filter(
                total_compras__gt=0
            ).order_by('-total_compras')[:10]
            
            estadisticas['top_clientes'] = ClienteListSerializer(
                top_clientes, many=True
            ).data
            
            return Response(EstadisticasClienteSerializer(estadisticas).data)
        
        except Exception as e:
            logger.error(f"Error generando estadísticas de clientes: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def buscar_por_documento(self, request):
        """Buscar cliente por número de documento"""
        numero_documento = request.query_params.get('numero_documento', '').strip()
        
        if not numero_documento:
            return Response(
                {'error': 'Número de documento es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cliente = self.get_queryset().get(numero_documento=numero_documento)
            serializer = self.get_serializer(cliente)
            return Response(serializer.data)
        
        except Cliente.DoesNotExist:
            return Response(
                {'error': 'Cliente no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error buscando cliente por documento: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def exportar(self, request):
        """Exportar listado de clientes"""
        # Solo admin y contadores pueden exportar
        if not request.user.has_perm('clientes.export_cliente'):
            return Response(
                {'error': 'No tiene permisos para exportar clientes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from django.http import HttpResponse
            import csv
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="clientes.csv"'
            
            writer = csv.writer(response)
            writer.writerow([
                'Tipo Cliente', 'Tipo Documento', 'Número Documento',
                'Razón Social', 'Email', 'Teléfono', 'Departamento',
                'Provincia', 'Total Compras', 'Número Compras', 'Estado'
            ])
            
            for cliente in self.get_queryset():
                writer.writerow([
                    cliente.tipo_cliente,
                    cliente.tipo_documento.nombre,
                    cliente.numero_documento,
                    cliente.razon_social,
                    cliente.email or '',
                    cliente.telefono or cliente.celular or '',
                    cliente.departamento,
                    cliente.provincia,
                    float(cliente.total_compras),
                    cliente.numero_compras,
                    'BLOQUEADO' if cliente.bloqueado else 'ACTIVO'
                ])
            
            logger.info(f"Exportación de clientes realizada por {request.user.username}")
            return response
        
        except Exception as e:
            logger.error(f"Error exportando clientes: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContactoClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de contactos de clientes
    """
    
    queryset = ContactoCliente.objects.select_related('cliente').filter(activo=True)
    serializer_class = ContactoClienteSerializer
    permission_classes = [IsAuthenticated, PuedeEditarClientes]
    pagination_class = PaginacionEstandar
    
    def get_queryset(self):
        """Filtrar contactos por cliente si se especifica"""
        queryset = self.queryset
        cliente_id = self.request.query_params.get('cliente', None)
        
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        return queryset.order_by('-es_principal', 'nombres')
    
    def perform_create(self, serializer):
        """Crear contacto con validaciones"""
        try:
            # Si es principal, desmarcar otros como principales del mismo cliente
            if serializer.validated_data.get('es_principal', False):
                cliente = serializer.validated_data['cliente']
                ContactoCliente.objects.filter(
                    cliente=cliente, es_principal=True
                ).update(es_principal=False)
            
            contacto = serializer.save()
            logger.info(
                f"Contacto creado para cliente {contacto.cliente.numero_documento}: "
                f"{contacto.obtener_nombre_completo()}"
            )
        except Exception as e:
            logger.error(f"Error creando contacto: {str(e)}")
            raise
    
    def perform_update(self, serializer):
        """Actualizar contacto con validaciones"""
        try:
            # Si se marca como principal, desmarcar otros del mismo cliente
            if serializer.validated_data.get('es_principal', False):
                instance = self.get_object()
                ContactoCliente.objects.filter(
                    cliente=instance.cliente, es_principal=True
                ).exclude(id=instance.id).update(es_principal=False)
            
            contacto = serializer.save()
            logger.info(
                f"Contacto actualizado: {contacto.obtener_nombre_completo()}"
            )
        except Exception as e:
            logger.error(f"Error actualizando contacto: {str(e)}")
            raise
    
    def perform_destroy(self, instance):
        """Eliminación lógica del contacto"""
        try:
            instance.soft_delete()
            logger.info(
                f"Contacto eliminado: {instance.obtener_nombre_completo()}"
            )
        except Exception as e:
            logger.error(f"Error eliminando contacto: {str(e)}")
            raise
    
    @action(detail=True, methods=['post'])
    def marcar_principal(self, request, pk=None):
        """Marcar contacto como principal"""
        contacto = self.get_object()
        
        try:
            with transaction.atomic():
                # Desmarcar otros como principales
                ContactoCliente.objects.filter(
                    cliente=contacto.cliente, es_principal=True
                ).update(es_principal=False)
                
                # Marcar este como principal
                contacto.es_principal = True
                contacto.save(update_fields=['es_principal'])
            
            logger.info(
                f"Contacto marcado como principal: {contacto.obtener_nombre_completo()}"
            )
            
            return Response({'message': 'Contacto marcado como principal'})
        
        except Exception as e:
            logger.error(f"Error marcando contacto como principal: {str(e)}")
            return Response(
                {'error': 'Error interno del servidor'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )