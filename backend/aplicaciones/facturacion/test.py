"""
Tests unitarios para aplicación Facturación - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Tests para modelos, serializers, views, servicios e integración Nubefact
"""

from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch, Mock
from decimal import Decimal
from datetime import datetime, date, timedelta

from .models import (
    Factura, DetalleFactura, SerieDocumento, 
    TipoDocumento, EstadoDocumento
)
from .serializers import FacturaSerializer, CrearFacturaSerializer
from .services import ServicioFacturacion
from aplicaciones.usuarios.models import Usuario
from aplicaciones.clientes.models import Cliente
from aplicaciones.productos.models import Producto, CategoriaProducto, UnidadMedida
from aplicaciones.integraciones.models import LogIntegracion

Usuario = get_user_model()


class TestFacturaModel(TestCase):
    """Tests para el modelo Factura"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        # Crear cliente de prueba
        self.cliente = Cliente.objects.create(
            tipo_documento='6',
            numero_documento='20123456789',
            razon_social='Cliente Test SAC',
            email='cliente@test.com'
        )
        
        # Crear producto de prueba
        categoria = CategoriaProducto.objects.create(
            nombre='Test Category',
            descripcion='Categoría para pruebas'
        )
        
        unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.producto = Producto.objects.create(
            codigo='PROD001',
            nombre='Producto Test',
            categoria=categoria,
            unidad_medida=unidad,
            tipo_producto='producto',
            precio_venta=Decimal('100.00')
        )
        
        # Crear serie de documento
        self.serie = SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001',
            numero_actual=0,
            activo=True
        )
        
        self.datos_factura = {
            'cliente': self.cliente,
            'serie_documento': self.serie,
            'numero': 1,
            'fecha_emision': date.today(),
            'fecha_vencimiento': date.today() + timedelta(days=30),
            'moneda': 'PEN',
            'tipo_cambio': Decimal('1.00'),
            'subtotal': Decimal('84.75'),
            'total_igv': Decimal('15.25'),
            'total_descuentos': Decimal('0.00'),
            'total_general': Decimal('100.00'),
            'estado': 'borrador'
        }
    
    def test_crear_factura_valida(self):
        """Test crear factura válida"""
        factura = Factura.objects.create(**self.datos_factura)
        
        self.assertEqual(factura.cliente, self.cliente)
        self.assertEqual(factura.numero, 1)
        self.assertEqual(factura.estado, 'borrador')
        self.assertEqual(factura.total_general, Decimal('100.00'))
        self.assertIsNotNone(factura.fecha_creacion)
    
    def test_validacion_fecha_emision_futura(self):
        """Test validación fecha emisión no puede ser futura"""
        datos_invalidos = self.datos_factura.copy()
        datos_invalidos['fecha_emision'] = date.today() + timedelta(days=1)
        
        with self.assertRaises(ValidationError):
            factura = Factura(**datos_invalidos)
            factura.full_clean()
    
    def test_validacion_fecha_vencimiento_anterior(self):
        """Test validación fecha vencimiento no anterior a emisión"""
        datos_invalidos = self.datos_factura.copy()
        datos_invalidos['fecha_vencimiento'] = date.today() - timedelta(days=1)
        
        with self.assertRaises(ValidationError):
            factura = Factura(**datos_invalidos)
            factura.full_clean()
    
    def test_validacion_totales_coherentes(self):
        """Test validación coherencia en totales"""
        datos_invalidos = self.datos_factura.copy()
        datos_invalidos['total_general'] = Decimal('50.00')  # No coincide con subtotal + IGV
        
        with self.assertRaises(ValidationError):
            factura = Factura(**datos_invalidos)
            factura.full_clean()
    
    def test_numero_documento_unico_por_serie(self):
        """Test número único por serie"""
        # Crear primera factura
        Factura.objects.create(**self.datos_factura)
        
        # Intentar crear otra con mismo número en misma serie
        with self.assertRaises(IntegrityError):
            Factura.objects.create(**self.datos_factura)
    
    def test_str_representation(self):
        """Test representación string del modelo"""
        factura = Factura.objects.create(**self.datos_factura)
        expected = f"{factura.serie_documento.serie}-{factura.numero:08d}"
        self.assertEqual(str(factura), expected)
    
    def test_numero_documento_completo(self):
        """Test generación número documento completo"""
        factura = Factura.objects.create(**self.datos_factura)
        expected = f"{self.serie.serie}-{1:08d}"
        self.assertEqual(factura.numero_documento_completo(), expected)
    
    def test_calcular_igv_automatico(self):
        """Test cálculo automático de IGV"""
        factura = Factura.objects.create(**self.datos_factura)
        igv_calculado = factura.calcular_igv()
        expected = self.datos_factura['subtotal'] * Decimal('0.18')
        self.assertEqual(igv_calculado, expected)
    
    def test_factura_manager_por_estado(self):
        """Test manager para filtrar por estado"""
        # Crear facturas con diferentes estados
        factura_borrador = Factura.objects.create(**self.datos_factura)
        
        datos_emitida = self.datos_factura.copy()
        datos_emitida['numero'] = 2
        datos_emitida['estado'] = 'emitida'
        factura_emitida = Factura.objects.create(**datos_emitida)
        
        # Verificar filtros
        facturas_borrador = Factura.objects.por_estado('borrador')
        self.assertEqual(facturas_borrador.count(), 1)
        
        facturas_emitidas = Factura.objects.por_estado('emitida')
        self.assertEqual(facturas_emitidas.count(), 1)
    
    def test_factura_manager_por_periodo(self):
        """Test manager para filtrar por período"""
        # Crear factura de hoy
        factura_hoy = Factura.objects.create(**self.datos_factura)
        
        # Crear factura de ayer
        datos_ayer = self.datos_factura.copy()
        datos_ayer['numero'] = 2
        datos_ayer['fecha_emision'] = date.today() - timedelta(days=1)
        factura_ayer = Factura.objects.create(**datos_ayer)
        
        # Verificar filtro por período
        facturas_hoy = Factura.objects.por_periodo(date.today(), date.today())
        self.assertEqual(facturas_hoy.count(), 1)


class TestDetalleFacturaModel(TestCase):
    """Tests para el modelo DetalleFactura"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        # Crear datos de prueba básicos
        cliente = Cliente.objects.create(
            tipo_documento='6',
            numero_documento='20123456789',
            razon_social='Cliente Test SAC'
        )
        
        categoria = CategoriaProducto.objects.create(
            nombre='Test Category',
            descripcion='Categoría para pruebas'
        )
        
        unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.producto = Producto.objects.create(
            codigo='PROD001',
            nombre='Producto Test',
            categoria=categoria,
            unidad_medida=unidad,
            tipo_producto='producto',
            precio_venta=Decimal('100.00')
        )
        
        serie = SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001',
            numero_actual=0
        )
        
        self.factura = Factura.objects.create(
            cliente=cliente,
            serie_documento=serie,
            numero=1,
            fecha_emision=date.today(),
            moneda='PEN',
            subtotal=Decimal('84.75'),
            total_igv=Decimal('15.25'),
            total_general=Decimal('100.00')
        )
        
        self.datos_detalle = {
            'factura': self.factura,
            'producto': self.producto,
            'cantidad': Decimal('2.00'),
            'precio_unitario': Decimal('50.00'),
            'descuento_porcentaje': Decimal('0.00'),
            'descuento_monto': Decimal('0.00'),
            'subtotal': Decimal('100.00'),
            'igv': Decimal('18.00'),
            'total': Decimal('118.00')
        }
    
    def test_crear_detalle_valido(self):
        """Test crear detalle de factura válido"""
        detalle = DetalleFactura.objects.create(**self.datos_detalle)
        
        self.assertEqual(detalle.producto, self.producto)
        self.assertEqual(detalle.cantidad, Decimal('2.00'))
        self.assertEqual(detalle.precio_unitario, Decimal('50.00'))
        self.assertEqual(detalle.total, Decimal('118.00'))
    
    def test_validacion_cantidad_positiva(self):
        """Test validación cantidad positiva"""
        datos_invalidos = self.datos_detalle.copy()
        datos_invalidos['cantidad'] = Decimal('-1.00')
        
        with self.assertRaises(ValidationError):
            detalle = DetalleFactura(**datos_invalidos)
            detalle.full_clean()
    
    def test_validacion_precio_positivo(self):
        """Test validación precio positivo"""
        datos_invalidos = self.datos_detalle.copy()
        datos_invalidos['precio_unitario'] = Decimal('-10.00')
        
        with self.assertRaises(ValidationError):
            detalle = DetalleFactura(**datos_invalidos)
            detalle.full_clean()
    
    def test_calculo_automatico_totales(self):
        """Test cálculo automático de totales"""
        detalle = DetalleFactura(**self.datos_detalle)
        detalle.calcular_totales()
        
        expected_subtotal = Decimal('2.00') * Decimal('50.00')  # cantidad * precio
        self.assertEqual(detalle.subtotal, expected_subtotal)
        
        expected_igv = expected_subtotal * Decimal('0.18')
        self.assertEqual(detalle.igv, expected_igv)
    
    def test_aplicar_descuento_porcentaje(self):
        """Test aplicar descuento por porcentaje"""
        datos_con_descuento = self.datos_detalle.copy()
        datos_con_descuento['descuento_porcentaje'] = Decimal('10.00')  # 10%
        
        detalle = DetalleFactura(**datos_con_descuento)
        detalle.calcular_totales()
        
        # Subtotal con descuento: 100 - (100 * 0.10) = 90
        expected_subtotal = Decimal('90.00')
        self.assertEqual(detalle.subtotal, expected_subtotal)


class TestSerieDocumentoModel(TestCase):
    """Tests para el modelo SerieDocumento"""
    
    def test_crear_serie_valida(self):
        """Test crear serie de documento válida"""
        serie = SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001',
            numero_actual=0,
            activo=True
        )
        
        self.assertEqual(serie.tipo_documento, 'factura')
        self.assertEqual(serie.serie, 'F001')
        self.assertEqual(serie.numero_actual, 0)
        self.assertTrue(serie.activo)
    
    def test_obtener_siguiente_numero(self):
        """Test obtener siguiente número de serie"""
        serie = SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001',
            numero_actual=5
        )
        
        siguiente = serie.obtener_siguiente_numero()
        self.assertEqual(siguiente, 6)
        
        # Verificar que se actualiza el número actual
        serie.refresh_from_db()
        self.assertEqual(serie.numero_actual, 6)
    
    def test_validacion_serie_unica_por_tipo(self):
        """Test validación serie única por tipo de documento"""
        # Crear primera serie
        SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001'
        )
        
        # Intentar crear serie duplicada
        with self.assertRaises(IntegrityError):
            SerieDocumento.objects.create(
                tipo_documento='factura',
                serie='F001'
            )


class TestFacturaSerializer(TestCase):
    """Tests para serializers de Factura"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        # Crear datos de prueba
        self.cliente = Cliente.objects.create(
            tipo_documento='6',
            numero_documento='20123456789',
            razon_social='Cliente Test SAC'
        )
        
        categoria = CategoriaProducto.objects.create(
            nombre='Test Category',
            descripcion='Categoría para pruebas'
        )
        
        unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.producto = Producto.objects.create(
            codigo='PROD001',
            nombre='Producto Test',
            categoria=categoria,
            unidad_medida=unidad,
            tipo_producto='producto',
            precio_venta=Decimal('100.00')
        )
        
        self.serie = SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001',
            numero_actual=0
        )
        
        self.datos_validos = {
            'cliente': self.cliente.id,
            'serie_documento': self.serie.id,
            'fecha_emision': date.today().isoformat(),
            'fecha_vencimiento': (date.today() + timedelta(days=30)).isoformat(),
            'moneda': 'PEN',
            'observaciones': 'Factura de prueba',
            'items': [
                {
                    'producto': self.producto.id,
                    'cantidad': '2.00',
                    'precio_unitario': '100.00',
                    'descuento_porcentaje': '0.00'
                }
            ]
        }
    
    def test_serializer_datos_validos(self):
        """Test serializer con datos válidos"""
        serializer = CrearFacturaSerializer(data=self.datos_validos)
        self.assertTrue(serializer.is_valid())
        
        factura = serializer.save()
        self.assertEqual(factura.cliente, self.cliente)
        self.assertEqual(factura.detalles.count(), 1)
    
    def test_serializer_datos_invalidos(self):
        """Test serializer con datos inválidos"""
        datos_invalidos = self.datos_validos.copy()
        datos_invalidos['fecha_emision'] = (date.today() + timedelta(days=1)).isoformat()  # Fecha futura
        
        serializer = CrearFacturaSerializer(data=datos_invalidos)
        self.assertFalse(serializer.is_valid())
        self.assertIn('fecha_emision', serializer.errors)
    
    def test_serializer_validacion_items_vacios(self):
        """Test validación items no vacíos"""
        datos_invalidos = self.datos_validos.copy()
        datos_invalidos['items'] = []
        
        serializer = CrearFacturaSerializer(data=datos_invalidos)
        self.assertFalse(serializer.is_valid())
        self.assertIn('items', serializer.errors)
    
    def test_serializer_calculo_automatico_totales(self):
        """Test cálculo automático de totales"""
        serializer = CrearFacturaSerializer(data=self.datos_validos)
        self.assertTrue(serializer.is_valid())
        
        factura = serializer.save()
        
        # Verificar que los totales se calcularon correctamente
        expected_subtotal = Decimal('169.49')  # 200 / 1.18
        expected_igv = Decimal('30.51')        # 200 - 169.49
        expected_total = Decimal('200.00')     # 2 * 100
        
        self.assertAlmostEqual(factura.subtotal, expected_subtotal, places=2)
        self.assertAlmostEqual(factura.total_igv, expected_igv, places=2)
        self.assertEqual(factura.total_general, expected_total)


class TestFacturaViews(APITestCase):
    """Tests para views de Factura"""
    
    def setUp(self):
        """Configuración inicial para tests de API"""
        # Crear usuario de prueba
        self.usuario = Usuario.objects.create_user(
            email='test@test.com',
            password='testpass123',
            nombre='Usuario Test',
            rol='vendedor'
        )
        
        # Configurar autenticación JWT
        refresh = RefreshToken.for_user(self.usuario)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Crear datos de prueba
        self.cliente = Cliente.objects.create(
            tipo_documento='6',
            numero_documento='20123456789',
            razon_social='Cliente Test SAC'
        )
        
        categoria = CategoriaProducto.objects.create(
            nombre='Test Category',
            descripcion='Categoría para pruebas'
        )
        
        unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.producto = Producto.objects.create(
            codigo='PROD001',
            nombre='Producto Test',
            categoria=categoria,
            unidad_medida=unidad,
            tipo_producto='producto',
            precio_venta=Decimal('100.00')
        )
        
        self.serie = SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001',
            numero_actual=0
        )
        
        # Crear factura de prueba
        self.factura = Factura.objects.create(
            cliente=self.cliente,
            serie_documento=self.serie,
            numero=1,
            fecha_emision=date.today(),
            moneda='PEN',
            subtotal=Decimal('84.75'),
            total_igv=Decimal('15.25'),
            total_general=Decimal('100.00')
        )
        
        self.datos_factura = {
            'cliente': self.cliente.id,
            'serie_documento': self.serie.id,
            'fecha_emision': date.today().isoformat(),
            'moneda': 'PEN',
            'items': [
                {
                    'producto': self.producto.id,
                    'cantidad': '1.00',
                    'precio_unitario': '100.00',
                    'descuento_porcentaje': '0.00'
                }
            ]
        }
    
    def test_listar_facturas(self):
        """Test listar facturas con paginación"""
        url = '/api/facturacion/facturas/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_obtener_factura_detalle(self):
        """Test obtener detalle de factura"""
        url = f'/api/facturacion/facturas/{self.factura.id}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['numero'], 1)
        self.assertEqual(response.data['total_general'], '100.00')
    
    def test_crear_factura_exitosa(self):
        """Test crear factura exitosamente"""
        url = '/api/facturacion/facturas/'
        response = self.client.post(url, self.datos_factura, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['cliente'], self.cliente.id)
        self.assertTrue(Factura.objects.filter(numero=2).exists())
    
    def test_crear_factura_datos_invalidos(self):
        """Test crear factura con datos inválidos"""
        datos_invalidos = self.datos_factura.copy()
        datos_invalidos['items'] = []  # Sin items
        
        url = '/api/facturacion/facturas/'
        response = self.client.post(url, datos_invalidos, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('items', response.data)
    
    def test_emitir_factura(self):
        """Test emitir factura (enviar a SUNAT)"""
        url = f'/api/facturacion/facturas/{self.factura.id}/emitir/'
        
        with patch('aplicaciones.integraciones.services.nubefact.NubefactService.enviar_factura') as mock_enviar:
            # Mock respuesta exitosa de Nubefact
            mock_enviar.return_value = {
                'exitoso': True,
                'mensaje': 'Factura enviada exitosamente',
                'data': {
                    'enlace_del_pdf': 'http://test.pdf',
                    'enlace_del_xml': 'http://test.xml',
                    'codigo_hash': 'test_hash_123'
                }
            }
            
            response = self.client.post(url)
            
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('factura', response.data)
            self.assertIn('estado_sunat', response.data)
    
    def test_anular_factura(self):
        """Test anular factura"""
        # Primero cambiar estado a emitida para poder anular
        self.factura.estado = 'emitida'
        self.factura.save()
        
        url = f'/api/facturacion/facturas/{self.factura.id}/anular/'
        datos_anulacion = {
            'motivo_anulacion': 'Error en datos del cliente'
        }
        
        response = self.client.post(url, datos_anulacion, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que cambió el estado
        factura_actualizada = Factura.objects.get(id=self.factura.id)
        self.assertEqual(factura_actualizada.estado, 'anulada')
    
    def test_filtrar_facturas_por_cliente(self):
        """Test filtrar facturas por cliente"""
        url = f'/api/facturacion/facturas/?cliente={self.cliente.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['cliente'], self.cliente.id)
    
    def test_filtrar_facturas_por_fecha(self):
        """Test filtrar facturas por rango de fechas"""
        fecha_desde = date.today().isoformat()
        fecha_hasta = date.today().isoformat()
        
        url = f'/api/facturacion/facturas/?fecha_desde={fecha_desde}&fecha_hasta={fecha_hasta}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
    
    def test_obtener_siguiente_numero(self):
        """Test obtener siguiente número de factura"""
        url = '/api/facturacion/siguiente-numero/'
        data = {
            'serie': 'F001',
            'tipo_documento': 'factura'
        }
        
        response = self.client.get(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('siguiente_numero', response.data)
        self.assertEqual(response.data['siguiente_numero'], 2)
    
    def test_calcular_totales(self):
        """Test calcular totales de items"""
        url = '/api/facturacion/calcular-totales/'
        data = {
            'items': [
                {
                    'producto': self.producto.id,
                    'cantidad': 2,
                    'precio_unitario': 100.00,
                    'descuento_porcentaje': 0
                }
            ]
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('subtotal', response.data)
        self.assertIn('igv', response.data)
        self.assertIn('total', response.data)


class TestServicioFacturacion(TestCase):
    """Tests para servicios de negocio de Facturación"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.servicio = ServicioFacturacion()
        
        self.cliente = Cliente.objects.create(
            tipo_documento='6',
            numero_documento='20123456789',
            razon_social='Cliente Test SAC'
        )
        
        categoria = CategoriaProducto.objects.create(
            nombre='Test Category',
            descripcion='Categoría para pruebas'
        )
        
        unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.producto = Producto.objects.create(
            codigo='PROD001',
            nombre='Producto Test',
            categoria=categoria,
            unidad_medida=unidad,
            tipo_producto='producto',
            precio_venta=Decimal('100.00')
        )
        
        self.serie = SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001',
            numero_actual=0
        )
    
    def test_calcular_igv_monto(self):
        """Test cálculo de IGV sobre un monto"""
        monto = Decimal('100.00')
        igv = self.servicio.calcular_igv(monto)
        expected = monto * Decimal('0.18')
        self.assertEqual(igv, expected)
    
    def test_calcular_subtotal_desde_total(self):
        """Test cálculo de subtotal desde total con IGV"""
        total_con_igv = Decimal('118.00')
        subtotal = self.servicio.calcular_subtotal_desde_total(total_con_igv)
        expected = total_con_igv / Decimal('1.18')
        self.assertAlmostEqual(subtotal, expected, places=2)
    
    def test_validar_ruc_cliente_factura(self):
        """Test validación RUC para facturas"""
        # Cliente con RUC válido
        resultado = self.servicio.validar_cliente_para_factura(self.cliente)
        self.assertTrue(resultado['valido'])
        
        # Cliente con DNI (no válido para facturas)
        cliente_dni = Cliente.objects.create(
            tipo_documento='1',
            numero_documento='12345678',
            razon_social='Cliente DNI'
        )
        
        resultado = self.servicio.validar_cliente_para_factura(cliente_dni)
        self.assertFalse(resultado['valido'])
    
    def test_generar_numero_correlativo(self):
        """Test generación de número correlativo"""
        numero = self.servicio.generar_numero_correlativo(self.serie)
        self.assertEqual(numero, 1)
        
        # Segundo número
        numero = self.servicio.generar_numero_correlativo(self.serie)
        self.assertEqual(numero, 2)
    
    def test_validar_stock_items(self):
        """Test validación de stock para items"""
        items = [
            {
                'producto_id': self.producto.id,
                'cantidad': 5
            }
        ]
        
        resultado = self.servicio.validar_stock_items(items)
        
        # Por ahora, solo verificamos la estructura de respuesta
        self.assertIn('valido', resultado)
        self.assertIn('errores', resultado)
        self.assertIn('advertencias', resultado)
    
    @patch('aplicaciones.integraciones.services.nubefact.NubefactService')
    def test_enviar_factura_sunat(self, mock_nubefact_service):
        """Test envío de factura a SUNAT vía Nubefact"""
        # Crear factura de prueba
        factura = Factura.objects.create(
            cliente=self.cliente,
            serie_documento=self.serie,
            numero=1,
            fecha_emision=date.today(),
            moneda='PEN',
            subtotal=Decimal('84.75'),
            total_igv=Decimal('15.25'),
            total_general=Decimal('100.00')
        )
        
        # Mock del servicio Nubefact
        mock_instance = mock_nubefact_service.return_value
        mock_instance.enviar_factura.return_value = {
            'exitoso': True,
            'mensaje': 'Factura enviada exitosamente',
            'data': {
                'enlace_del_pdf': 'http://test.pdf',
                'codigo_hash': 'test_hash_123'
            }
        }
        
        resultado = self.servicio.enviar_factura_sunat(factura.id)
        
        self.assertTrue(resultado['exitoso'])
        self.assertIn('mensaje', resultado)
    
    def test_procesar_descuentos_items(self):
        """Test procesamiento de descuentos en items"""
        items_data = [
            {
                'cantidad': Decimal('2.00'),
                'precio_unitario': Decimal('100.00'),
                'descuento_porcentaje': Decimal('10.00')
            }
        ]
        
        items_procesados = self.servicio.procesar_descuentos_items(items_data)
        
        item = items_procesados[0]
        expected_descuento = Decimal('20.00')  # 10% de 200
        expected_subtotal = Decimal('180.00')   # 200 - 20
        
        self.assertEqual(item['descuento_monto'], expected_descuento)
        self.assertEqual(item['subtotal'], expected_subtotal)


class TestFacturacionIntegracion(TransactionTestCase):
    """Tests de integración para Facturación"""
    
    def setUp(self):
        """Configuración inicial para tests de integración"""
        # Crear usuario administrador
        self.admin_user = Usuario.objects.create_user(
            email='admin@test.com',
            password='adminpass123',
            nombre='Admin Test',
            rol='administrador'
        )
        
        # Configurar cliente API
        refresh = RefreshToken.for_user(self.admin_user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Crear datos de prueba completos
        self.cliente = Cliente.objects.create(
            tipo_documento='6',
            numero_documento='20123456789',
            razon_social='CLIENTE INTEGRACIÓN SAC',
            email='cliente@integracion.com',
            direccion='Av. Integración 123'
        )
        
        categoria = CategoriaProducto.objects.create(
            nombre='Electrónicos',
            descripcion='Productos electrónicos'
        )
        
        unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.producto1 = Producto.objects.create(
            codigo='LAPTOP001',
            nombre='Laptop Dell Inspiron',
            categoria=categoria,
            unidad_medida=unidad,
            tipo_producto='producto',
            precio_venta=Decimal('2500.00')
        )
        
        self.producto2 = Producto.objects.create(
            codigo='MOUSE001',
            nombre='Mouse Logitech',
            categoria=categoria,
            unidad_medida=unidad,
            tipo_producto='producto',
            precio_venta=Decimal('50.00')
        )
        
        self.serie = SerieDocumento.objects.create(
            tipo_documento='factura',
            serie='F001',
            numero_actual=0
        )
    
    def test_flujo_completo_facturacion(self):
        """Test flujo completo de facturación electrónica"""
        # Paso 1: Crear factura con múltiples items
        datos_factura = {
            'cliente': self.cliente.id,
            'serie_documento': self.serie.id,
            'fecha_emision': date.today().isoformat(),
            'fecha_vencimiento': (date.today() + timedelta(days=30)).isoformat(),
            'moneda': 'PEN',
            'observaciones': 'Venta de equipos de cómputo',
            'items': [
                {
                    'producto': self.producto1.id,
                    'cantidad': '1.00',
                    'precio_unitario': '2500.00',
                    'descuento_porcentaje': '5.00'
                },
                {
                    'producto': self.producto2.id,
                    'cantidad': '2.00',
                    'precio_unitario': '50.00',
                    'descuento_porcentaje': '0.00'
                }
            ]
        }
        
        url_crear = '/api/facturacion/facturas/'
        response = self.client.post(url_crear, datos_factura, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        factura_id = response.data['id']
        
        # Paso 2: Verificar detalle de factura
        url_detalle = f'/api/facturacion/facturas/{factura_id}/'
        response = self.client.get(url_detalle)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        factura_data = response.data
        self.assertEqual(len(factura_data['detalles']), 2)
        self.assertEqual(factura_data['estado'], 'borrador')
        
        # Paso 3: Emitir factura (mock de Nubefact)
        with patch('aplicaciones.integraciones.services.nubefact.NubefactService.enviar_factura') as mock_enviar:
            mock_enviar.return_value = {
                'exitoso': True,
                'mensaje': 'Factura enviada a SUNAT',
                'data': {
                    'enlace_del_pdf': 'http://nubefact.com/pdf/123',
                    'enlace_del_xml': 'http://nubefact.com/xml/123',
                    'codigo_hash': 'ABC123XYZ789'
                }
            }
            
            url_emitir = f'/api/facturacion/facturas/{factura_id}/emitir/'
            response = self.client.post(url_emitir)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Paso 4: Verificar cambio de estado
        response = self.client.get(url_detalle)
        self.assertEqual(response.data['estado'], 'emitida')
        
        # Paso 5: Consultar resumen de ventas
        url_resumen = '/api/facturacion/resumen-ventas/'
        datos_resumen = {
            'fecha_desde': date.today().isoformat(),
            'fecha_hasta': date.today().isoformat(),
            'incluir_igv': True
        }
        
        response = self.client.post(url_resumen, datos_resumen, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        resumen = response.data
        self.assertIn('total_ventas', resumen)
        self.assertIn('cantidad_facturas', resumen)
        self.assertEqual(resumen['cantidad_facturas'], 1)
    
    def test_manejo_errores_nubefact(self):
        """Test manejo de errores de integración con Nubefact"""
        # Crear factura
        factura = Factura.objects.create(
            cliente=self.cliente,
            serie_documento=self.serie,
            numero=1,
            fecha_emision=date.today(),
            moneda='PEN',
            subtotal=Decimal('84.75'),
            total_igv=Decimal('15.25'),
            total_general=Decimal('100.00')
        )
        
        # Mock error de Nubefact
        with patch('aplicaciones.integraciones.services.nubefact.NubefactService.enviar_factura') as mock_enviar:
            mock_enviar.return_value = {
                'exitoso': False,
                'mensaje': 'Error en datos del cliente',
                'codigo_error': 'NUBEFACT_400'
            }
            
            url_emitir = f'/api/facturacion/facturas/{factura.id}/emitir/'
            response = self.client.post(url_emitir)
            
            # Debe retornar error pero no fallar completamente
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn('mensaje', response.data)
        
        # Verificar que se creó log de error
        log_error = LogIntegracion.objects.filter(
            tipo_operacion='envio_factura',
            exitoso=False
        ).first()
        
        self.assertIsNotNone(log_error)
        self.assertIn('Error en datos', log_error.mensaje_error)


if __name__ == '__main__':
    import django
    from django.conf import settings
    
    if not settings.configured:
        settings.configure(
            DEBUG=True,
            DATABASES={
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': ':memory:',
                }
            },
            INSTALLED_APPS=[
                'django.contrib.auth',
                'django.contrib.contenttypes',
                'rest_framework',
                'rest_framework_simplejwt',
                'aplicaciones.usuarios',
                'aplicaciones.clientes',
                'aplicaciones.productos',
                'aplicaciones.facturacion',
                'aplicaciones.integraciones',
            ],
            SECRET_KEY='test-secret-key',
            USE_TZ=True,
        )
        django.setup()
    
    import unittest
    unittest.main()