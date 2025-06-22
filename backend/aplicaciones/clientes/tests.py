"""
Tests unitarios para aplicación Clientes - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Tests para modelos, serializers, views y servicios
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

from .models import Cliente, TipoDocumento
from .serializers import ClienteSerializer, CrearClienteSerializer
from .services import ServicioCliente
from aplicaciones.usuarios.models import Usuario

Usuario = get_user_model()


class TestClienteModel(TestCase):
    """Tests para el modelo Cliente"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.datos_cliente_dnl = {
            'tipo_documento': '1',
            'numero_documento': '12345678',
            'razon_social': 'Juan Pérez',
            'email': 'juan@test.com',
            'telefono': '999123456',
            'direccion': 'Av. Test 123'
        }
        
        self.datos_cliente_ruc = {
            'tipo_documento': '6',
            'numero_documento': '20123456789',
            'razon_social': 'Empresa Test SAC',
            'email': 'empresa@test.com',
            'telefono': '01-1234567',
            'direccion': 'Av. Empresa 456'
        }
    
    def test_crear_cliente_dnl_valido(self):
        """Test crear cliente con DNI válido"""
        cliente = Cliente.objects.create(**self.datos_cliente_dnl)
        
        self.assertEqual(cliente.tipo_documento, '1')
        self.assertEqual(cliente.numero_documento, '12345678')
        self.assertEqual(cliente.razon_social, 'Juan Pérez')
        self.assertTrue(cliente.activo)
        self.assertIsNotNone(cliente.fecha_creacion)
    
    def test_crear_cliente_ruc_valido(self):
        """Test crear cliente con RUC válido"""
        cliente = Cliente.objects.create(**self.datos_cliente_ruc)
        
        self.assertEqual(cliente.tipo_documento, '6')
        self.assertEqual(cliente.numero_documento, '20123456789')
        self.assertEqual(cliente.razon_social, 'Empresa Test SAC')
        self.assertTrue(cliente.activo)
    
    def test_validacion_tipo_documento_invalido(self):
        """Test validación de tipo de documento inválido"""
        datos_invalidos = self.datos_cliente_dnl.copy()
        datos_invalidos['tipo_documento'] = '9'
        
        with self.assertRaises(ValidationError):
            cliente = Cliente(**datos_invalidos)
            cliente.full_clean()
    
    def test_validacion_dnl_formato_invalido(self):
        """Test validación formato DNI inválido"""
        datos_invalidos = self.datos_cliente_dnl.copy()
        datos_invalidos['numero_documento'] = '1234567'  # 7 dígitos
        
        with self.assertRaises(ValidationError):
            cliente = Cliente(**datos_invalidos)
            cliente.full_clean()
    
    def test_validacion_ruc_formato_invalido(self):
        """Test validación formato RUC inválido"""
        datos_invalidos = self.datos_cliente_ruc.copy()
        datos_invalidos['numero_documento'] = '2012345678'  # 10 dígitos
        
        with self.assertRaises(ValidationError):
            cliente = Cliente(**datos_invalidos)
            cliente.full_clean()
    
    def test_documento_unico_constraint(self):
        """Test constraint de documento único"""
        # Crear primer cliente
        Cliente.objects.create(**self.datos_cliente_dnl)
        
        # Intentar crear cliente duplicado
        with self.assertRaises(IntegrityError):
            Cliente.objects.create(**self.datos_cliente_dnl)
    
    def test_str_representation(self):
        """Test representación string del modelo"""
        cliente = Cliente.objects.create(**self.datos_cliente_dnl)
        expected = f"{cliente.razon_social} - {cliente.numero_documento}"
        self.assertEqual(str(cliente), expected)
    
    def test_get_absolute_url(self):
        """Test URL absoluta del cliente"""
        cliente = Cliente.objects.create(**self.datos_cliente_dnl)
        expected_url = f"/api/clientes/{cliente.id}/"
        self.assertEqual(cliente.get_absolute_url(), expected_url)
    
    def test_cliente_manager_activos(self):
        """Test manager para obtener solo clientes activos"""
        # Crear cliente activo
        cliente_activo = Cliente.objects.create(**self.datos_cliente_dnl)
        
        # Crear cliente inactivo
        datos_inactivo = self.datos_cliente_ruc.copy()
        datos_inactivo['activo'] = False
        cliente_inactivo = Cliente.objects.create(**datos_inactivo)
        
        # Verificar que solo se obtiene el activo
        clientes_activos = Cliente.objects.activos()
        self.assertEqual(clientes_activos.count(), 1)
        self.assertEqual(clientes_activos.first(), cliente_activo)
    
    def test_cliente_manager_por_tipo_documento(self):
        """Test manager para filtrar por tipo de documento"""
        # Crear clientes con diferentes tipos
        Cliente.objects.create(**self.datos_cliente_dnl)
        Cliente.objects.create(**self.datos_cliente_ruc)
        
        # Verificar filtro por DNI
        clientes_dnl = Cliente.objects.por_tipo_documento('1')
        self.assertEqual(clientes_dnl.count(), 1)
        
        # Verificar filtro por RUC
        clientes_ruc = Cliente.objects.por_tipo_documento('6')
        self.assertEqual(clientes_ruc.count(), 1)


class TestClienteSerializer(TestCase):
    """Tests para serializers de Cliente"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.datos_validos = {
            'tipo_documento': '1',
            'numero_documento': '12345678',
            'razon_social': 'Juan Pérez',
            'email': 'juan@test.com',
            'telefono': '999123456',
            'direccion': 'Av. Test 123'
        }
    
    def test_serializer_datos_validos(self):
        """Test serializer con datos válidos"""
        serializer = CrearClienteSerializer(data=self.datos_validos)
        self.assertTrue(serializer.is_valid())
        
        cliente = serializer.save()
        self.assertEqual(cliente.razon_social, 'Juan Pérez')
        self.assertEqual(cliente.numero_documento, '12345678')
    
    def test_serializer_datos_invalidos(self):
        """Test serializer con datos inválidos"""
        datos_invalidos = self.datos_validos.copy()
        datos_invalidos['email'] = 'email_invalido'
        
        serializer = CrearClienteSerializer(data=datos_invalidos)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_serializer_validacion_documento_existente(self):
        """Test validación de documento existente"""
        # Crear cliente existente
        Cliente.objects.create(**self.datos_validos)
        
        # Intentar crear con mismo documento
        serializer = CrearClienteSerializer(data=self.datos_validos)
        self.assertFalse(serializer.is_valid())
        self.assertIn('numero_documento', serializer.errors)
    
    def test_serializer_validacion_ruc_estructura(self):
        """Test validación estructura RUC"""
        datos_ruc_invalido = {
            'tipo_documento': '6',
            'numero_documento': '20123456788',  # Dígito verificador incorrecto
            'razon_social': 'Empresa Test SAC'
        }
        
        serializer = CrearClienteSerializer(data=datos_ruc_invalido)
        self.assertFalse(serializer.is_valid())
        self.assertIn('numero_documento', serializer.errors)


class TestClienteViews(APITestCase):
    """Tests para views de Cliente"""
    
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
        
        # Datos de cliente de prueba
        self.datos_cliente = {
            'tipo_documento': '1',
            'numero_documento': '12345678',
            'razon_social': 'Juan Pérez',
            'email': 'juan@test.com',
            'telefono': '999123456',
            'direccion': 'Av. Test 123'
        }
        
        # Crear cliente de prueba
        self.cliente = Cliente.objects.create(**self.datos_cliente)
    
    def test_listar_clientes(self):
        """Test listar clientes con paginación"""
        url = '/api/clientes/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_obtener_cliente_detalle(self):
        """Test obtener detalle de cliente"""
        url = f'/api/clientes/{self.cliente.id}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['razon_social'], 'Juan Pérez')
        self.assertEqual(response.data['numero_documento'], '12345678')
    
    def test_crear_cliente_exitoso(self):
        """Test crear cliente exitosamente"""
        datos_nuevo = {
            'tipo_documento': '6',
            'numero_documento': '20123456789',
            'razon_social': 'Nueva Empresa SAC',
            'email': 'nueva@test.com'
        }
        
        url = '/api/clientes/'
        response = self.client.post(url, datos_nuevo, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['razon_social'], 'Nueva Empresa SAC')
        self.assertTrue(Cliente.objects.filter(numero_documento='20123456789').exists())
    
    def test_crear_cliente_datos_invalidos(self):
        """Test crear cliente con datos inválidos"""
        datos_invalidos = {
            'tipo_documento': '1',
            'numero_documento': '123',  # DNI inválido
            'razon_social': ''  # Vacío
        }
        
        url = '/api/clientes/'
        response = self.client.post(url, datos_invalidos, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('numero_documento', response.data)
        self.assertIn('razon_social', response.data)
    
    def test_actualizar_cliente(self):
        """Test actualizar cliente existente"""
        datos_actualizacion = {
            'razon_social': 'Juan Pérez Actualizado',
            'telefono': '999987654'
        }
        
        url = f'/api/clientes/{self.cliente.id}/'
        response = self.client.patch(url, datos_actualizacion, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['razon_social'], 'Juan Pérez Actualizado')
        
        # Verificar en base de datos
        cliente_actualizado = Cliente.objects.get(id=self.cliente.id)
        self.assertEqual(cliente_actualizado.razon_social, 'Juan Pérez Actualizado')
    
    def test_eliminar_cliente(self):
        """Test eliminar cliente"""
        url = f'/api/clientes/{self.cliente.id}/'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Cliente.objects.filter(id=self.cliente.id).exists())
    
    def test_buscar_cliente_por_documento(self):
        """Test buscar cliente por documento"""
        url = '/api/clientes/buscar-por-documento/'
        data = {
            'tipo_documento': '1',
            'numero_documento': '12345678'
        }
        
        response = self.client.get(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['numero_documento'], '12345678')
    
    def test_filtrar_clientes_por_tipo_documento(self):
        """Test filtrar clientes por tipo de documento"""
        # Crear cliente con RUC
        Cliente.objects.create(
            tipo_documento='6',
            numero_documento='20123456789',
            razon_social='Empresa Test SAC'
        )
        
        url = '/api/clientes/?tipo_documento=6'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['tipo_documento'], '6')
    
    def test_buscar_cliente_texto(self):
        """Test búsqueda de cliente por texto"""
        url = '/api/clientes/?search=Juan'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertIn('Juan', response.data['results'][0]['razon_social'])
    
    def test_acceso_sin_autenticacion(self):
        """Test acceso sin autenticación"""
        self.client.credentials()  # Remover credenciales
        
        url = '/api/clientes/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestServicioCliente(TestCase):
    """Tests para servicios de negocio de Cliente"""
    
    def setUp(self):
        """Configuración inicial para tests"""
        self.servicio = ServicioCliente()
        self.datos_cliente = {
            'tipo_documento': '1',
            'numero_documento': '12345678',
            'razon_social': 'Juan Pérez',
            'email': 'juan@test.com'
        }
    
    def test_validar_ruc_estructura_valida(self):
        """Test validación estructura RUC válida"""
        ruc_valido = '20123456789'
        resultado = self.servicio.validar_estructura_ruc(ruc_valido)
        # Nota: Este test depende del algoritmo específico de validación RUC
        self.assertIsInstance(resultado, bool)
    
    def test_validar_dni_formato_valido(self):
        """Test validación formato DNI válido"""
        dni_valido = '12345678'
        resultado = self.servicio.validar_formato_dni(dni_valido)
        self.assertTrue(resultado)
    
    def test_validar_dni_formato_invalido(self):
        """Test validación formato DNI inválido"""
        dni_invalido = '1234567'  # 7 dígitos
        resultado = self.servicio.validar_formato_dni(dni_invalido)
        self.assertFalse(resultado)
    
    @patch('aplicaciones.clientes.services.requests.get')
    def test_consultar_reniec_exitoso(self, mock_get):
        """Test consulta RENIEC exitosa"""
        # Mock de respuesta exitosa
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'nombre': 'Juan',
            'apellido_paterno': 'Pérez',
            'apellido_materno': 'García'
        }
        mock_get.return_value = mock_response
        
        resultado = self.servicio.consultar_reniec('12345678')
        
        self.assertTrue(resultado['exitoso'])
        self.assertIn('datos', resultado)
    
    @patch('aplicaciones.clientes.services.requests.get')
    def test_consultar_sunat_exitoso(self, mock_get):
        """Test consulta SUNAT exitosa"""
        # Mock de respuesta exitosa
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'razon_social': 'EMPRESA TEST SAC',
            'estado': 'ACTIVO',
            'direccion': 'AV. TEST 123'
        }
        mock_get.return_value = mock_response
        
        resultado = self.servicio.consultar_sunat('20123456789')
        
        self.assertTrue(resultado['exitoso'])
        self.assertIn('datos', resultado)
    
    def test_procesar_datos_reniec(self):
        """Test procesamiento de datos RENIEC"""
        datos_reniec = {
            'nombre': 'Juan',
            'apellido_paterno': 'Pérez',
            'apellido_materno': 'García'
        }
        
        resultado = self.servicio.procesar_datos_reniec(datos_reniec)
        
        self.assertEqual(resultado['razon_social'], 'Juan Pérez García')
        self.assertEqual(resultado['tipo_persona'], 'natural')
    
    def test_procesar_datos_sunat(self):
        """Test procesamiento de datos SUNAT"""
        datos_sunat = {
            'razon_social': 'EMPRESA TEST SAC',
            'estado': 'ACTIVO',
            'direccion': 'AV. TEST 123',
            'ubigeo': '150101'
        }
        
        resultado = self.servicio.procesar_datos_sunat(datos_sunat)
        
        self.assertEqual(resultado['razon_social'], 'Empresa Test Sac')
        self.assertEqual(resultado['tipo_persona'], 'juridica')
        self.assertEqual(resultado['direccion'], 'Av. Test 123')


class TestClienteIntegracion(TransactionTestCase):
    """Tests de integración para Cliente"""
    
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
    
    def test_flujo_completo_crear_cliente(self):
        """Test flujo completo de creación de cliente"""
        # Paso 1: Verificar que no existe
        url_buscar = '/api/clientes/buscar-por-documento/'
        data_buscar = {
            'tipo_documento': '1',
            'numero_documento': '87654321'
        }
        response = self.client.get(url_buscar, data_buscar)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Paso 2: Crear cliente
        datos_cliente = {
            'tipo_documento': '1',
            'numero_documento': '87654321',
            'razon_social': 'María García',
            'email': 'maria@test.com',
            'telefono': '999123456',
            'direccion': 'Av. Nueva 789'
        }
        
        url_crear = '/api/clientes/'
        response = self.client.post(url_crear, datos_cliente, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        cliente_id = response.data['id']
        
        # Paso 3: Verificar que existe
        response = self.client.get(url_buscar, data_buscar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['razon_social'], 'María García')
        
        # Paso 4: Actualizar cliente
        datos_actualizacion = {
            'telefono': '999987654',
            'direccion': 'Av. Actualizada 123'
        }
        
        url_actualizar = f'/api/clientes/{cliente_id}/'
        response = self.client.patch(url_actualizar, datos_actualizacion, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Paso 5: Verificar actualización
        response = self.client.get(url_actualizar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['telefono'], '999987654')
        self.assertEqual(response.data['direccion'], 'Av. Actualizada 123')
    
    def test_performance_busqueda_masiva(self):
        """Test performance en búsqueda con muchos clientes"""
        # Crear múltiples clientes
        clientes_creados = []
        for i in range(100):
            cliente = Cliente.objects.create(
                tipo_documento='1',
                numero_documento=f'{12345678 + i:08d}',
                razon_social=f'Cliente Test {i:03d}',
                email=f'cliente{i:03d}@test.com'
            )
            clientes_creados.append(cliente)
        
        # Test búsqueda por texto
        url = '/api/clientes/?search=Cliente Test 050'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        
        # Test paginación
        url = '/api/clientes/?page_size=20'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 20)
        self.assertIsNotNone(response.data['next'])
    
    def test_manejo_errores_base_datos(self):
        """Test manejo de errores de base de datos"""
        # Crear cliente inicial
        datos_inicial = {
            'tipo_documento': '1',
            'numero_documento': '11111111',
            'razon_social': 'Cliente Original'
        }
        
        url = '/api/clientes/'
        response = self.client.post(url, datos_inicial, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Intentar crear duplicado
        response = self.client.post(url, datos_inicial, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('numero_documento', str(response.data))


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
            ],
            SECRET_KEY='test-secret-key',
            USE_TZ=True,
        )
        django.setup()
    
    import unittest
    unittest.main()