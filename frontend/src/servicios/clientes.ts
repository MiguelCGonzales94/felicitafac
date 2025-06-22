/**
 * Servicio de Clientes - FELICITAFAC
 * Gestión completa de clientes con validaciones SUNAT
 * Optimizado para facturación electrónica Perú
 */

import apiClient from './api';
import type { 
  Cliente, 
  CrearClienteRequest,
  ActualizarClienteRequest,
  BuscarClienteResponse,
  ValidarDocumentoResponse,
  ClientesPaginados
} from '../types/cliente';

// Tipos específicos del servicio
interface FiltrosClientes {
  busqueda?: string;
  tipo_documento?: '1' | '6'; // DNI o RUC
  estado?: 'activo' | 'inactivo';
  fecha_desde?: string;
  fecha_hasta?: string;
  pagina?: number;
  limite?: number;
}

interface ConsultaSunatRequest {
  tipo_documento: '1' | '6';
  numero_documento: string;
}

class ServicioClientes {
  private readonly baseUrl = '/api/clientes';

  /**
   * Obtener lista paginada de clientes
   */
  async obtenerClientes(filtros: FiltrosClientes = {}): Promise<ClientesPaginados> {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.tipo_documento) params.append('tipo_documento', filtros.tipo_documento);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.limite) params.append('page_size', filtros.limite.toString());

      const response = await apiClient.get(`${this.baseUrl}/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener cliente por ID
   */
  async obtenerClientePorId(clienteId: number): Promise<Cliente> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${clienteId}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Buscar cliente por documento
   */
  async buscarClientePorDocumento(tipoDocumento: '1' | '6', numeroDocumento: string): Promise<BuscarClienteResponse> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/buscar-por-documento/`,
        {
          params: {
            tipo_documento: tipoDocumento,
            numero_documento: numeroDocumento
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al buscar cliente por documento:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Crear nuevo cliente
   */
  async crearCliente(datosCliente: CrearClienteRequest): Promise<Cliente> {
    try {
      // Validar datos antes de enviar
      this.validarDatosCliente(datosCliente);

      const response = await apiClient.post(`${this.baseUrl}/`, datosCliente);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Actualizar cliente existente
   */
  async actualizarCliente(clienteId: number, datosCliente: ActualizarClienteRequest): Promise<Cliente> {
    try {
      this.validarDatosCliente(datosCliente);

      const response = await apiClient.put(`${this.baseUrl}/${clienteId}/`, datosCliente);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Eliminar cliente
   */
  async eliminarCliente(clienteId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${clienteId}/`);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Activar/Desactivar cliente
   */
  async cambiarEstadoCliente(clienteId: number, activo: boolean): Promise<Cliente> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${clienteId}/`, {
        activo
      });
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del cliente:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Consultar datos en SUNAT/RENIEC
   */
  async consultarSunat(datos: ConsultaSunatRequest): Promise<ValidarDocumentoResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/consultar-sunat/`, datos);
      return response.data;
    } catch (error) {
      console.error('Error al consultar SUNAT:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Validar número de documento
   */
  async validarDocumento(tipoDocumento: '1' | '6', numeroDocumento: string): Promise<ValidarDocumentoResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/validar-documento/`, {
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento
      });
      return response.data;
    } catch (error) {
      console.error('Error al validar documento:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener historial de facturas del cliente
   */
  async obtenerHistorialFacturas(clienteId: number, limite = 10): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${clienteId}/historial-facturas/`,
        { params: { limite } }
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de facturas:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener estadísticas del cliente
   */
  async obtenerEstadisticasCliente(clienteId: number): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${clienteId}/estadisticas/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del cliente:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Exportar clientes a Excel
   */
  async exportarClientes(filtros: FiltrosClientes = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.tipo_documento) params.append('tipo_documento', filtros.tipo_documento);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const response = await apiClient.get(
        `${this.baseUrl}/exportar-excel/?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error al exportar clientes:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Importar clientes desde Excel
   */
  async importarClientes(archivo: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await apiClient.post(
        `${this.baseUrl}/importar-excel/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al importar clientes:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Validaciones de datos del cliente
   */
  private validarDatosCliente(datos: CrearClienteRequest | ActualizarClienteRequest): void {
    // Validar tipo de documento
    if (!['1', '6'].includes(datos.tipo_documento)) {
      throw new Error('Tipo de documento debe ser DNI (1) o RUC (6)');
    }

    // Validar formato del documento
    if (datos.tipo_documento === '1') {
      // DNI: 8 dígitos
      if (!/^\d{8}$/.test(datos.numero_documento)) {
        throw new Error('DNI debe tener 8 dígitos');
      }
    } else if (datos.tipo_documento === '6') {
      // RUC: 11 dígitos
      if (!/^\d{11}$/.test(datos.numero_documento)) {
        throw new Error('RUC debe tener 11 dígitos');
      }
      
      // Validar estructura RUC
      if (!this.validarEstructuraRuc(datos.numero_documento)) {
        throw new Error('Estructura de RUC inválida');
      }
    }

    // Validar campos obligatorios
    if (!datos.razon_social || datos.razon_social.trim().length < 2) {
      throw new Error('Razón social es obligatoria (mínimo 2 caracteres)');
    }

    // Validar email si se proporciona
    if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
      throw new Error('Formato de email inválido');
    }

    // Validar teléfono si se proporciona
    if (datos.telefono && !/^[\d\s\-\+\(\)]{6,15}$/.test(datos.telefono)) {
      throw new Error('Formato de teléfono inválido');
    }
  }

  /**
   * Validar estructura del RUC
   */
  private validarEstructuraRuc(ruc: string): boolean {
    // Algoritmo de validación de RUC peruano
    const digitos = ruc.split('').map(Number);
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    
    let suma = 0;
    for (let i = 0; i < 10; i++) {
      suma += digitos[i] * factores[i];
    }
    
    const resto = suma % 11;
    const digitoVerificador = resto < 2 ? resto : 11 - resto;
    
    return digitoVerificador === digitos[10];
  }

  /**
   * Manejo centralizado de errores
   */
  private manejarError(error: any): Error {
    if (error.response) {
      // Error del servidor
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          return new Error(data.detail || 'Datos de cliente inválidos');
        case 404:
          return new Error('Cliente no encontrado');
        case 409:
          return new Error('Ya existe un cliente con este documento');
        case 422:
          return new Error(data.detail || 'Error en validación de datos');
        default:
          return new Error(`Error del servidor: ${status}`);
      }
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet');
    } else {
      // Error interno
      return new Error(error.message || 'Error interno del sistema');
    }
  }
}

// Exportar instancia única del servicio
export const servicioClientes = new ServicioClientes();
export default servicioClientes;