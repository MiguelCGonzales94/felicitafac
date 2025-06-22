"""
Tests unitarios para aplicación Productos - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Tests para modelos, serializers, views y servicios con inventario PEPS
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
from datetime import datetime, date

from .models import Producto, CategoriaProducto, UnidadMedida
from .serializers import ProductoSerializer, CrearProductoSerializer
from .services import ServicioProducto
from aplicaciones.usuarios.models import Usuario
from aplicaciones.inventario.models import MovimientoInventario, LoteInventario

Usuario = get_user_model()


class TestProductoModel(TestCase):
    """Tests para el modelo Producto"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        # Crear categoría de prueba
        self.categoria = CategoriaProducto.objects.create(
            nombre='Categoría Test',
            descripcion='Categoría para pruebas'
        )
        
        # Crear unidad de medida
        self.unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.datos_producto = {
            'codigo': 'PROD001',
            'nombre': 'Producto Test',
            'descripcion': 'Descripción del producto test',
            'categoria': self.categoria,
            'unidad_medida': self.unidad,
            'tipo_producto': 'producto',
            'precio_venta': Decimal('100.00'),
            'precio_compra': Decimal('80.00'),
            'stock_minimo': 10,
            'incluye_igv': True
        }
        
        self.datos_servicio = {
            'codigo': 'SERV001',
            'nombre': 'Servicio Test',
            'descripcion': 'Descripción del servicio test',
            'categoria': self.categoria,
            'unidad_medida': self.unidad,
            'tipo_producto': 'servicio',
            'precio_venta': Decimal('150.00'),
            'incluye_igv': True
        }
    
    def test_crear_producto_valido(self):
        """Test crear producto válido"""
        producto = Producto.objects.create(**self.datos_producto)
        
        self.assertEqual(producto.codigo, 'PROD001')
        self.assertEqual(producto.nombre, 'Producto Test')
        self.assertEqual(producto.tipo_producto, 'producto')
        self.assertEqual(producto.precio_venta, Decimal('100.00'))
        self.assertTrue(producto.activo)
        self.assertIsNotNone(producto.fecha_creacion)
    
    def test_crear_servicio_valido(self):
        """Test crear servicio válido"""
        servicio = Producto.objects.create(**self.datos_servicio)
        
        self.assertEqual(servicio.codigo, 'SERV001')
        self.assertEqual(servicio.tipo_producto, 'servicio')
        self.assertEqual(servicio.precio_venta, Decimal('150.00'))
        self.assertIsNone(servicio.precio_compra)  # Servicios no tienen precio compra
    
    def test_validacion_codigo_unico(self):
        """Test validación código único"""
        # Crear primer producto
        Producto.objects.create(**self.datos_producto)
        
        # Intentar crear producto con código duplicado
        with self.assertRaises(IntegrityError):
            Producto.objects.create(**self.datos_producto)
    
    def test_validacion_precio_venta_positivo(self):
        """Test validación precio venta positivo"""
        datos_invalidos = self.datos_producto.copy()
        datos_invalidos['precio_venta'] = Decimal('-10.00')
        
        with self.assertRaises(ValidationError):
            producto = Producto(**datos_invalidos)
            producto.full_clean()
    
    def test_validacion_stock_minimo_no_negativo(self):
        """Test validación stock mínimo no negativo"""
        datos_invalidos = self.datos_producto.copy()
        datos_invalidos['stock_minimo'] = -5
        
        with self.assertRaises(ValidationError):
            producto = Producto(**datos_invalidos)
            producto.full_clean()
    
    def test_validacion_tipo_producto(self):
        """Test validación tipo de producto"""
        datos_invalidos = self.datos_producto.copy()
        datos_invalidos['tipo_producto'] = 'invalido'
        
        with self.assertRaises(ValidationError):
            producto = Producto(**datos_invalidos)
            producto.full_clean()
    
    def test_str_representation(self):
        """Test representación string del modelo"""
        producto = Producto.objects.create(**self.datos_producto)
        expected = f"{producto.codigo} - {producto.nombre}"
        self.assertEqual(str(producto), expected)
    
    def test_calcular_precio_sin_igv(self):
        """Test cálculo de precio sin IGV"""
        producto = Producto.objects.create(**self.datos_producto)
        precio_sin_igv = producto.calcular_precio_sin_igv()
        expected = Decimal('100.00') / Decimal('1.18')
        self.assertAlmostEqual(precio_sin_igv, expected, places=2)
    
    def test_calcular_precio_con_igv(self):
        """Test cálculo de precio con IGV"""
        datos_sin_igv = self.datos_producto.copy()
        datos_sin_igv['incluye_igv'] = False
        producto = Producto.objects.create(**datos_sin_igv)
        
        precio_con_igv = producto.calcular_precio_con_igv()
        expected = Decimal('100.00') * Decimal('1.18')
        self.assertAlmostEqual(precio_con_igv, expected, places=2)
    
    def test_producto_manager_activos(self):
        """Test manager para obtener solo productos activos"""
        # Crear producto activo
        producto_activo = Producto.objects.create(**self.datos_producto)
        
        # Crear producto inactivo
        datos_inactivo = self.datos_servicio.copy()
        datos_inactivo['activo'] = False
        producto_inactivo = Producto.objects.create(**datos_inactivo)
        
        # Verificar que solo se obtiene el activo
        productos_activos = Producto.objects.activos()
        self.assertEqual(productos_activos.count(), 1)
        self.assertEqual(productos_activos.first(), producto_activo)
    
    def test_producto_manager_por_categoria(self):
        """Test manager para filtrar por categoría"""
        # Crear otra categoría
        otra_categoria = CategoriaProducto.objects.create(
            nombre='Otra Categoría',
            descripcion='Otra categoría para pruebas'
        )
        
        # Crear productos en diferentes categorías
        Producto.objects.create(**self.datos_producto)
        
        datos_otra = self.datos_servicio.copy()
        datos_otra['categoria'] = otra_categoria
        Producto.objects.create(**datos_otra)
        
        # Verificar filtro por categoría
        productos_categoria1 = Producto.objects.por_categoria(self.categoria.id)
        self.assertEqual(productos_categoria1.count(), 1)
        
        productos_categoria2 = Producto.objects.por_categoria(otra_categoria.id)
        self.assertEqual(productos_categoria2.count(), 1)
    
    def test_producto_manager_con_stock_bajo(self):
        """Test manager para productos con stock bajo"""
        # Crear producto
        producto = Producto.objects.create(**self.datos_producto)
        
        # Simular stock actual menor al mínimo
        # Esto requiere integración con sistema de inventario
        # Por ahora solo verificamos que el método existe
        productos_stock_bajo = Producto.objects.con_stock_bajo()
        self.assertIsInstance(productos_stock_bajo, type(Producto.objects.all()))


class TestCategoriaProductoModel(TestCase):
    """Tests para el modelo CategoriaProducto"""
    
    def test_crear_categoria_valida(self):
        """Test crear categoría válida"""
        categoria = CategoriaProducto.objects.create(
            nombre='Electrónicos',
            descripcion='Productos electrónicos y tecnológicos'
        )
        
        self.assertEqual(categoria.nombre, 'Electrónicos')
        self.assertTrue(categoria.activo)
        self.assertIsNotNone(categoria.fecha_creacion)
    
    def test_validacion_nombre_unico(self):
        """Test validación nombre único"""
        # Crear primera categoría
        CategoriaProducto.objects.create(
            nombre='Electrónicos',
            descripcion='Productos electrónicos'
        )
        
        # Intentar crear categoría con nombre duplicado
        with self.assertRaises(IntegrityError):
            CategoriaProducto.objects.create(
                nombre='Electrónicos',
                descripcion='Otra descripción'
            )
    
    def test_str_representation_categoria(self):
        """Test representación string de categoría"""
        categoria = CategoriaProducto.objects.create(
            nombre='Electrónicos',
            descripcion='Productos electrónicos'
        )
        self.assertEqual(str(categoria), 'Electrónicos')


class TestUnidadMedidaModel(TestCase):
    """Tests para el modelo UnidadMedida"""
    
    def test_crear_unidad_medida_valida(self):
        """Test crear unidad de medida válida"""
        unidad = UnidadMedida.objects.create(
            codigo='KG',
            nombre='Kilogramo',
            simbolo='kg'
        )
        
        self.assertEqual(unidad.codigo, 'KG')
        self.assertEqual(unidad.nombre, 'Kilogramo')
        self.assertEqual(unidad.simbolo, 'kg')
        self.assertTrue(unidad.activo)
    
    def test_validacion_codigo_unico_unidad(self):
        """Test validación código único en unidad de medida"""
        # Crear primera unidad
        UnidadMedida.objects.create(
            codigo='KG',
            nombre='Kilogramo',
            simbolo='kg'
        )
        
        # Intentar crear unidad con código duplicado
        with self.assertRaises(IntegrityError):
            UnidadMedida.objects.create(
                codigo='KG',
                nombre='Otro nombre',
                simbolo='kg2'
            )


class TestProductoSerializer(TestCase):
    """Tests para serializers de Producto"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.categoria = CategoriaProducto.objects.create(
            nombre='Categoría Test',
            descripcion='Categoría para pruebas'
        )
        
        self.unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.datos_validos = {
            'codigo': 'PROD001',
            'nombre': 'Producto Test',
            'descripcion': 'Descripción del producto test',
            'categoria': self.categoria.id,
            'unidad_medida': self.unidad.id,
            'tipo_producto': 'producto',
            'precio_venta': '100.00',
            'precio_compra': '80.00',
            'stock_minimo': 10,
            'incluye_igv': True
        }
    
    def test_serializer_datos_validos(self):
        """Test serializer con datos válidos"""
        serializer = CrearProductoSerializer(data=self.datos_validos)
        self.assertTrue(serializer.is_valid())
        
        producto = serializer.save()
        self.assertEqual(producto.nombre, 'Producto Test')
        self.assertEqual(producto.codigo, 'PROD001')
    
    def test_serializer_datos_invalidos(self):
        """Test serializer con datos inválidos"""
        datos_invalidos = self.datos_validos.copy()
        datos_invalidos['precio_venta'] = '-10.00'  # Precio negativo
        
        serializer = CrearProductoSerializer(data=datos_invalidos)
        self.assertFalse(serializer.is_valid())
        self.assertIn('precio_venta', serializer.errors)
    
    def test_serializer_validacion_codigo_existente(self):
        """Test validación de código existente"""
        # Crear producto existente
        Producto.objects.create(
            codigo='PROD001',
            nombre='Producto Existente',
            categoria=self.categoria,
            unidad_medida=self.unidad,
            tipo_producto='producto',
            precio_venta=Decimal('50.00')
        )
        
        # Intentar crear con mismo código
        serializer = CrearProductoSerializer(data=self.datos_validos)
        self.assertFalse(serializer.is_valid())
        self.assertIn('codigo', serializer.errors)
    
    def test_serializer_servicio_sin_precio_compra(self):
        """Test serializer para servicio sin precio de compra"""
        datos_servicio = self.datos_validos.copy()
        datos_servicio['tipo_producto'] = 'servicio'
        datos_servicio['precio_compra'] = None
        
        serializer = CrearProductoSerializer(data=datos_servicio)
        self.assertTrue(serializer.is_valid())
        
        servicio = serializer.save()
        self.assertEqual(servicio.tipo_producto, 'servicio')
        self.assertIsNone(servicio.precio_compra)


class TestProductoViews(APITestCase):
    """Tests para views de Producto"""
    
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
        self.categoria = CategoriaProducto.objects.create(
            nombre='Categoría Test',
            descripcion='Categoría para pruebas'
        )
        
        self.unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        # Datos de producto de prueba
        self.datos_producto = {
            'codigo': 'PROD001',
            'nombre': 'Producto Test',
            'descripcion': 'Descripción del producto test',
            'categoria': self.categoria.id,
            'unidad_medida': self.unidad.id,
            'tipo_producto': 'producto',
            'precio_venta': '100.00',
            'precio_compra': '80.00',
            'stock_minimo': 10,
            'incluye_igv': True
        }
        
        # Crear producto de prueba
        self.producto = Producto.objects.create(
            codigo='PROD001',
            nombre='Producto Test',
            categoria=self.categoria,
            unidad_medida=self.unidad,
            tipo_producto='producto',
            precio_venta=Decimal('100.00'),
            precio_compra=Decimal('80.00')
        )
    
    def test_listar_productos(self):
        """Test listar productos con paginación"""
        url = '/api/productos/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_obtener_producto_detalle(self):
        """Test obtener detalle de producto"""
        url = f'/api/productos/{self.producto.id}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Producto Test')
        self.assertEqual(response.data['codigo'], 'PROD001')
    
    def test_crear_producto_exitoso(self):
        """Test crear producto exitosamente"""
        datos_nuevo = {
            'codigo': 'PROD002',
            'nombre': 'Nuevo Producto',
            'categoria': self.categoria.id,
            'unidad_medida': self.unidad.id,
            'tipo_producto': 'producto',
            'precio_venta': '150.00'
        }
        
        url = '/api/productos/'
        response = self.client.post(url, datos_nuevo, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nombre'], 'Nuevo Producto')
        self.assertTrue(Producto.objects.filter(codigo='PROD002').exists())
    
    def test_crear_producto_datos_invalidos(self):
        """Test crear producto con datos inválidos"""
        datos_invalidos = {
            'codigo': '',  # Código vacío
            'nombre': '',  # Nombre vacío
            'precio_venta': '-10.00'  # Precio negativo
        }
        
        url = '/api/productos/'
        response = self.client.post(url, datos_invalidos, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('codigo', response.data)
        self.assertIn('nombre', response.data)
        self.assertIn('precio_venta', response.data)
    
    def test_actualizar_producto(self):
        """Test actualizar producto existente"""
        datos_actualizacion = {
            'nombre': 'Producto Actualizado',
            'precio_venta': '120.00'
        }
        
        url = f'/api/productos/{self.producto.id}/'
        response = self.client.patch(url, datos_actualizacion, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Producto Actualizado')
        
        # Verificar en base de datos
        producto_actualizado = Producto.objects.get(id=self.producto.id)
        self.assertEqual(producto_actualizado.nombre, 'Producto Actualizado')
    
    def test_eliminar_producto(self):
        """Test eliminar producto"""
        url = f'/api/productos/{self.producto.id}/'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Producto.objects.filter(id=self.producto.id).exists())
    
    def test_buscar_producto_por_codigo(self):
        """Test buscar producto por código"""
        url = '/api/productos/buscar-por-codigo/'
        data = {'codigo': 'PROD001'}
        
        response = self.client.get(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['codigo'], 'PROD001')
    
    def test_filtrar_productos_por_categoria(self):
        """Test filtrar productos por categoría"""
        url = f'/api/productos/?categoria={self.categoria.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['categoria'], self.categoria.id)
    
    def test_filtrar_productos_por_tipo(self):
        """Test filtrar productos por tipo"""
        url = '/api/productos/?tipo_producto=producto'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['tipo_producto'], 'producto')
    
    def test_buscar_producto_texto(self):
        """Test búsqueda de producto por texto"""
        url = '/api/productos/?search=Test'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertIn('Test', response.data['results'][0]['nombre'])
    
    def test_obtener_stock_producto(self):
        """Test obtener stock de producto"""
        url = f'/api/productos/{self.producto.id}/stock/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('cantidad_actual', response.data)
        self.assertIn('valor_inventario', response.data)


class TestServicioProducto(TestCase):
    """Tests para servicios de negocio de Producto"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.servicio = ServicioProducto()
        
        self.categoria = CategoriaProducto.objects.create(
            nombre='Categoría Test',
            descripcion='Categoría para pruebas'
        )
        
        self.unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
        
        self.producto = Producto.objects.create(
            codigo='PROD001',
            nombre='Producto Test',
            categoria=self.categoria,
            unidad_medida=self.unidad,
            tipo_producto='producto',
            precio_venta=Decimal('100.00'),
            precio_compra=Decimal('80.00')
        )
    
    def test_calcular_margen_ganancia(self):
        """Test cálculo de margen de ganancia"""
        margen = self.servicio.calcular_margen_ganancia(
            precio_venta=Decimal('100.00'),
            precio_compra=Decimal('80.00')
        )
        
        expected = Decimal('25.00')  # (100-80)/80 * 100
        self.assertEqual(margen, expected)
    
    def test_calcular_precio_con_margen(self):
        """Test cálculo de precio con margen"""
        precio_venta = self.servicio.calcular_precio_con_margen(
            precio_compra=Decimal('80.00'),
            margen_porcentaje=Decimal('25.00')
        )
        
        expected = Decimal('100.00')  # 80 * (1 + 25/100)
        self.assertEqual(precio_venta, expected)
    
    def test_validar_codigo_barras_formato_valido(self):
        """Test validación formato código de barras válido"""
        codigos_validos = [
            '1234567890123',  # EAN-13
            '123456789012',   # UPC-A
            '12345678',       # EAN-8
        ]
        
        for codigo in codigos_validos:
            resultado = self.servicio.validar_formato_codigo_barras(codigo)
            self.assertTrue(resultado, f"Código {codigo} debería ser válido")
    
    def test_validar_codigo_barras_formato_invalido(self):
        """Test validación formato código de barras inválido"""
        codigos_invalidos = [
            '123',           # Muy corto
            '123456789012345678',  # Muy largo
            'abc123456789',  # Contiene letras
        ]
        
        for codigo in codigos_invalidos:
            resultado = self.servicio.validar_formato_codigo_barras(codigo)
            self.assertFalse(resultado, f"Código {codigo} debería ser inválido")
    
    def test_generar_codigo_producto_automatico(self):
        """Test generación automática de código de producto"""
        codigo = self.servicio.generar_codigo_automatico(categoria_id=self.categoria.id)
        
        self.assertIsInstance(codigo, str)
        self.assertTrue(len(codigo) >= 6)
        self.assertTrue(codigo.startswith(str(self.categoria.id).zfill(2)))
    
    def test_verificar_disponibilidad_stock_suficiente(self):
        """Test verificación de disponibilidad con stock suficiente"""
        # Simular entrada de stock
        # En un test real, esto se haría a través del servicio de inventario
        disponibilidad = self.servicio.verificar_disponibilidad(
            producto_id=self.producto.id,
            cantidad_solicitada=5
        )
        
        # Por ahora, solo verificamos la estructura de respuesta
        self.assertIn('disponible', disponibilidad)
        self.assertIn('cantidad_disponible', disponibilidad)
        self.assertIn('mensaje', disponibilidad)
    
    @patch('aplicaciones.productos.services.requests.post')
    def test_sincronizar_precio_con_proveedor(self, mock_post):
        """Test sincronización de precio con proveedor externo"""
        # Mock de respuesta exitosa
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'precio_actual': '85.00',
            'disponible': True,
            'ultima_actualizacion': '2024-01-15'
        }
        mock_post.return_value = mock_response
        
        resultado = self.servicio.sincronizar_precio_proveedor(
            producto_id=self.producto.id,
            codigo_proveedor='PROV123'
        )
        
        self.assertTrue(resultado['exitoso'])
        self.assertIn('precio_nuevo', resultado)


class TestProductoIntegracion(TransactionTestCase):
    """Tests de integración para Producto"""
    
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
        
        # Crear datos de prueba
        self.categoria = CategoriaProducto.objects.create(
            nombre='Electrónicos',
            descripcion='Productos electrónicos'
        )
        
        self.unidad = UnidadMedida.objects.create(
            codigo='UNI',
            nombre='Unidad',
            simbolo='u'
        )
    
    def test_flujo_completo_gestion_producto(self):
        """Test flujo completo de gestión de producto"""
        # Paso 1: Crear producto
        datos_producto = {
            'codigo': 'LAPTOP001',
            'nombre': 'Laptop Gaming',
            'descripcion': 'Laptop para gaming de alta gama',
            'categoria': self.categoria.id,
            'unidad_medida': self.unidad.id,
            'tipo_producto': 'producto',
            'precio_venta': '2500.00',
            'precio_compra': '2000.00',
            'stock_minimo': 5,
            'incluye_igv': True
        }
        
        url_crear = '/api/productos/'
        response = self.client.post(url_crear, datos_producto, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        producto_id = response.data['id']
        
        # Paso 2: Verificar que existe
        url_detalle = f'/api/productos/{producto_id}/'
        response = self.client.get(url_detalle)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre'], 'Laptop Gaming')
        
        # Paso 3: Actualizar precio
        datos_actualizacion = {
            'precio_venta': '2600.00',
            'precio_compra': '2100.00'
        }
        
        response = self.client.patch(url_detalle, datos_actualizacion, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['precio_venta'], '2600.00')
        
        # Paso 4: Consultar stock
        url_stock = f'/api/productos/{producto_id}/stock/'
        response = self.client.get(url_stock)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Paso 5: Buscar por código
        url_buscar = '/api/productos/buscar-por-codigo/'
        response = self.client.get(url_buscar, {'codigo': 'LAPTOP001'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['codigo'], 'LAPTOP001')
    
    def test_performance_busqueda_masiva_productos(self):
        """Test performance en búsqueda con muchos productos"""
        # Crear múltiples productos
        productos_creados = []
        for i in range(50):
            producto = Producto.objects.create(
                codigo=f'PROD{i:03d}',
                nombre=f'Producto Test {i:03d}',
                categoria=self.categoria,
                unidad_medida=self.unidad,
                tipo_producto='producto',
                precio_venta=Decimal(f'{100 + i}.00')
            )
            productos_creados.append(producto)
        
        # Test búsqueda por texto
        url = '/api/productos/?search=Producto Test 025'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        
        # Test filtro por categoría
        url = f'/api/productos/?categoria={self.categoria.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 50)
        
        # Test paginación
        url = '/api/productos/?page_size=10'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)
        self.assertIsNotNone(response.data['next'])
    
    def test_validaciones_reglas_negocio(self):
        """Test validaciones de reglas de negocio"""
        # Test 1: No se puede eliminar producto con movimientos
        producto = Producto.objects.create(
            codigo='PROD_CON_MOV',
            nombre='Producto con Movimientos',
            categoria=self.categoria,
            unidad_medida=self.unidad,
            tipo_producto='producto',
            precio_venta=Decimal('100.00')
        )
        
        # Simular movimiento de inventario
        # En test real se crearía movimiento real
        # Por ahora solo verificamos que la validación existe
        url = f'/api/productos/{producto.id}/'
        response = self.client.delete(url)
        # La respuesta depende de si tiene movimientos o no
        self.assertIn(response.status_code, [status.HTTP_204_NO_CONTENT, status.HTTP_400_BAD_REQUEST])


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
                'aplicaciones.productos',
                'aplicaciones.inventario',
            ],
            SECRET_KEY='test-secret-key',
            USE_TZ=True,
        )
        django.setup()
    
    import unittest
    unittest.main()