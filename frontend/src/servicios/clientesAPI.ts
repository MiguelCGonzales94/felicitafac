/**
 * Servicio API de Clientes - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Servicio completo para gestión de clientes con validaciones SUNAT
 */

import axios, { AxiosResponse } from 'axios';
import { 
  Cliente, 
  FormularioCliente,
  ResumenCliente,
  TipoDocumentoCliente,
  EstadoCliente,
  FiltrosClientes,
  ListaClientesResponse,
  DetalleClienteResponse,
  EstadisticasCliente,
  ContactoCliente,
  ValidacionCliente,
  TipoCliente
} from '../types/cliente';
import { RespuestaPaginada, ParametrosBusqueda } from '../types/common';
import { obtenerToken } from '../utils/auth';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = '/api/clientes';

const obtenerConfiguracion = () => ({
  headers: {
    'Authorization': `Bearer ${obtenerToken()}`,
    'Content-Type': 'application/json',
  },
});

// =======================================================
// CLASE PRINCIPAL DEL SERVICIO
// =======================================================

export class ClientesAPI {
  // =======================================================
  // MÉTODOS CRUD PRINCIPALES
  // =======================================================

  /**
   * Crear nuevo cliente
   */
  static async crearCliente(datosCliente: FormularioCliente): Promise<Cliente> {
    try {
      const response: AxiosResponse<Cliente> = await axios.post(
        `${API_BASE_URL}/clientes/`,
        {
          tipo_cliente: datosCliente.tipo_cliente,
          tipo_documento: datosCliente.tipo_documento,
          numero_documento: datosCliente.numero_documento,
          nombres: datosCliente.nombres,
          apellido_paterno: datosCliente.apellido_paterno,
          apellido_materno: datosCliente.apellido_materno,
          razon_social: datosCliente.razon_social,
          nombre_comercial: datosCliente.nombre_comercial,
          email: datosCliente.email,
          telefono: datosCliente.telefono,
          celular: datosCliente.celular,
          direccion: datosCliente.direccion,
          distrito: datosCliente.distrito,
          provincia: datosCliente.provincia,
          departamento: datosCliente.departamento,
          ubigeo: datosCliente.ubigeo,
          limite_credito: datosCliente.limite_credito || 0,
          dias_credito: datosCliente.dias_credito || 0,
          descuento_maximo: datosCliente.descuento_maximo || 0,
          lista_precios: datosCliente.lista_precios,
          observaciones: datosCliente.observaciones,
          estado: datosCliente.estado || 'activo',
          es_proveedor: datosCliente.es_proveedor || false,
          favorito: datosCliente.favorito || false,
        },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear cliente:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al crear el cliente. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Obtener cliente por ID
   */
  static async obtenerCliente(id: number): Promise<DetalleClienteResponse> {
    try {
      const response: AxiosResponse<DetalleClienteResponse> = await axios.get(
        `${API_BASE_URL}/clientes/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener cliente:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener el cliente. Verifique el ID e intente nuevamente.'
      );
    }
  }

  /**
   * Actualizar cliente
   */
  static async actualizarCliente(id: number, datosCliente: Partial<FormularioCliente>): Promise<Cliente> {
    try {
      const response: AxiosResponse<Cliente> = await axios.put(
        `${API_BASE_URL}/clientes/${id}/`,
        datosCliente,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar el cliente. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Eliminar cliente (soft delete)
   */
  static async eliminarCliente(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.delete(
        `${API_BASE_URL}/clientes/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al eliminar el cliente. Verifique que no tenga documentos asociados.'
      );
    }
  }

  // =======================================================
  // MÉTODOS DE BÚSQUEDA Y LISTADO
  // =======================================================

  /**
   * Listar clientes con filtros y paginación
   */
  static async listarClientes(filtros: FiltrosClientes = {}): Promise<ListaClientesResponse> {
    try {
      const params = new URLSearchParams();

      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.tipo_cliente) params.append('tipo_cliente', filtros.tipo_cliente);
      if (filtros.tipo_documento) params.append('tipo_documento', filtros.tipo_documento);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.es_proveedor !== undefined) params.append('es_proveedor', filtros.es_proveedor.toString());
      if (filtros.favorito !== undefined) params.append('favorito', filtros.favorito.toString());
      if (filtros.departamento) params.append('departamento', filtros.departamento);
      if (filtros.provincia) params.append('provincia', filtros.provincia);
      if (filtros.distrito) params.append('distrito', filtros.distrito);
      if (filtros.limite_credito_desde) params.append('limite_credito_desde', filtros.limite_credito_desde.toString());
      if (filtros.limite_credito_hasta) params.append('limite_credito_hasta', filtros.limite_credito_hasta.toString());
      if (filtros.fecha_creacion_desde) params.append('fecha_creacion_desde', filtros.fecha_creacion_desde);
      if (filtros.fecha_creacion_hasta) params.append('fecha_creacion_hasta', filtros.fecha_creacion_hasta);
      
      // Paginación
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.tamaño_pagina) params.append('page_size', filtros.tamaño_pagina.toString());
      
      // Ordenamiento
      if (filtros.ordenar_por) {
        const orden = filtros.orden === 'desc' ? `-${filtros.ordenar_por}` : filtros.ordenar_por;
        params.append('ordering', orden);
      }

      const response: AxiosResponse<ListaClientesResponse> = await axios.get(
        `${API_BASE_URL}/clientes/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al listar clientes:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener la lista de clientes.'
      );
    }
  }

  /**
   * Buscar clientes por múltiples criterios
   */
  static async buscarClientes(parametros: ParametrosBusqueda): Promise<ResumenCliente[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', parametros.termino);
      if (parametros.limite) params.append('limit', parametros.limite.toString());

      const response: AxiosResponse<{ results: ResumenCliente[] }> = await axios.get(
        `${API_BASE_URL}/clientes/buscar/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al buscar clientes:', error);
      throw new Error('Error en la búsqueda de clientes.');
    }
  }

  /**
   * Buscar cliente por número de documento
   */
  static async buscarPorDocumento(numeroDocumento: string): Promise<Cliente | null> {
    try {
      const response: AxiosResponse<{ cliente: Cliente | null }> = await axios.get(
        `${API_BASE_URL}/clientes/buscar-por-documento/?numero_documento=${numeroDocumento}`,
        obtenerConfiguracion()
      );

      return response.data.cliente;
    } catch (error: any) {
      console.error('Error al buscar por documento:', error);
      if (error.response?.status === 404) {
        return null; // Cliente no encontrado
      }
      throw new Error('Error al buscar cliente por documento.');
    }
  }

  // =======================================================
  // MÉTODOS DE VALIDACIÓN
  // =======================================================

  /**
   * Validar datos del cliente
   */
  static async validarCliente(datosCliente: FormularioCliente): Promise<ValidacionCliente> {
    try {
      const response: AxiosResponse<ValidacionCliente> = await axios.post(
        `${API_BASE_URL}/clientes/validar/`,
        datosCliente,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al validar cliente:', error);
      throw new Error('Error en la validación del cliente.');
    }
  }

  /**
   * Verificar si el documento ya existe
   */
  static async verificarDocumentoExistente(
    numeroDocumento: string, 
    clienteId?: number
  ): Promise<{ existe: boolean; cliente?: ResumenCliente }> {
    try {
      const params = new URLSearchParams();
      params.append('numero_documento', numeroDocumento);
      if (clienteId) params.append('excluir_id', clienteId.toString());

      const response: AxiosResponse<{ existe: boolean; cliente?: ResumenCliente }> = await axios.get(
        `${API_BASE_URL}/clientes/verificar-documento/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al verificar documento:', error);
      throw new Error('Error al verificar el documento.');
    }
  }

  // =======================================================
  // MÉTODOS DE CONSULTAS EXTERNAS
  // =======================================================

  /**
   * Consultar datos en SUNAT por RUC
   */
  static async consultarSunat(ruc: string): Promise<{
    encontrado: boolean;
    razon_social?: string;
    direccion?: string;
    estado?: string;
    condicion?: string;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/consultar-sunat/?ruc=${ruc}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al consultar SUNAT:', error);
      throw new Error('Error al consultar datos en SUNAT.');
    }
  }

  /**
   * Consultar datos en RENIEC por DNI
   */
  static async consultarReniec(dni: string): Promise<{
    encontrado: boolean;
    nombres?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/consultar-reniec/?dni=${dni}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al consultar RENIEC:', error);
      throw new Error('Error al consultar datos en RENIEC.');
    }
  }

  // =======================================================
  // MÉTODOS DE CONTACTOS
  // =======================================================

  /**
   * Agregar contacto a cliente
   */
  static async agregarContacto(clienteId: number, contacto: Omit<ContactoCliente, 'id' | 'cliente_id'>): Promise<ContactoCliente> {
    try {
      const response: AxiosResponse<ContactoCliente> = await axios.post(
        `${API_BASE_URL}/contactos/`,
        {
          cliente_id: clienteId,
          ...contacto
        },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al agregar contacto:', error);
      throw new Error('Error al agregar el contacto.');
    }
  }

  /**
   * Actualizar contacto
   */
  static async actualizarContacto(id: number, contacto: Partial<ContactoCliente>): Promise<ContactoCliente> {
    try {
      const response: AxiosResponse<ContactoCliente> = await axios.put(
        `${API_BASE_URL}/contactos/${id}/`,
        contacto,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar contacto:', error);
      throw new Error('Error al actualizar el contacto.');
    }
  }

  /**
   * Eliminar contacto
   */
  static async eliminarContacto(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.delete(
        `${API_BASE_URL}/contactos/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar contacto:', error);
      throw new Error('Error al eliminar el contacto.');
    }
  }

  // =======================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =======================================================

  /**
   * Obtener estadísticas del cliente
   */
  static async obtenerEstadisticas(clienteId: number): Promise<EstadisticasCliente> {
    try {
      const response: AxiosResponse<EstadisticasCliente> = await axios.get(
        `${API_BASE_URL}/clientes/${clienteId}/estadisticas/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('Error al obtener las estadísticas del cliente.');
    }
  }

  /**
   * Obtener cuenta corriente del cliente
   */
  static async obtenerCuentaCorriente(
    clienteId: number, 
    fechaDesde?: string, 
    fechaHasta?: string
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);

      const response = await axios.get(
        `${API_BASE_URL}/clientes/${clienteId}/cuenta-corriente/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener cuenta corriente:', error);
      throw new Error('Error al obtener la cuenta corriente.');
    }
  }

  // =======================================================
  // MÉTODOS DE ACCIONES MASIVAS
  // =======================================================

  /**
   * Activar/Desactivar múltiples clientes
   */
  static async cambiarEstadoMasivo(ids: number[], estado: EstadoCliente): Promise<{ procesados: number; errores: string[] }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/clientes/cambiar-estado-masivo/`,
        { ids, estado },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error en cambio masivo de estado:', error);
      throw new Error('Error al cambiar el estado de los clientes.');
    }
  }

  /**
   * Marcar como favoritos múltiples clientes
   */
  static async marcarFavoritosMasivo(ids: number[], favorito: boolean): Promise<{ procesados: number }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/clientes/marcar-favoritos-masivo/`,
        { ids, favorito },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error en marcado masivo de favoritos:', error);
      throw new Error('Error al marcar los clientes como favoritos.');
    }
  }

  // =======================================================
  // MÉTODOS DE EXPORTACIÓN
  // =======================================================

  /**
   * Exportar clientes a Excel
   */
  static async exportarExcel(filtros: FiltrosClientes = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/clientes/exportar-excel/?${params.toString()}`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('Error al exportar los clientes a Excel.');
    }
  }

  /**
   * Importar clientes desde Excel
   */
  static async importarExcel(archivo: File): Promise<{ 
    procesados: number; 
    errores: string[]; 
    warnings: string[] 
  }> {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await axios.post(
        `${API_BASE_URL}/clientes/importar-excel/`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${obtenerToken()}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al importar desde Excel:', error);
      throw new Error('Error al importar los clientes desde Excel.');
    }
  }

  // =======================================================
  // MÉTODOS DE DATOS MAESTROS
  // =======================================================

  /**
   * Obtener tipos de documento disponibles
   */
  static async obtenerTiposDocumento(): Promise<Array<{
    codigo: string;
    descripcion: string;
    activo: boolean;
  }>> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tipos-documento/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener tipos de documento:', error);
      throw new Error('Error al obtener los tipos de documento.');
    }
  }

  // =======================================================
  // MÉTODOS DE UTILIDADES
  // =======================================================

  /**
   * Limpiar cache del servicio
   */
  static limpiarCache(): void {
    console.log('Cache de clientes limpiado');
  }
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default ClientesAPI;