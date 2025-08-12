/**
 * Servicio API de Facturación - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Servicio completo para documentos electrónicos SUNAT
 */

import axios, { AxiosResponse } from 'axios';
import { 
  Factura, 
  DatosFactura, 
  ItemFactura, 
  TipoDocumento, 
  EstadoFactura,
  EstadoPago,
  FiltrosFacturas,
  ValidacionFactura,
  RespuestaFactura,
  FacturasPaginadas,
  ResumenVentas,
  EstadoSunat,
  SerieDocumento,
  FormaPago
} from '../types/factura';
import { RespuestaPaginada, ParametrosBusqueda } from '../types/common';
import { obtenerToken } from '../utils/auth';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = '/api/facturacion';

const obtenerConfiguracion = () => ({
  headers: {
    'Authorization': `Bearer ${obtenerToken()}`,
    'Content-Type': 'application/json',
  },
});

// =======================================================
// CLASE PRINCIPAL DEL SERVICIO
// =======================================================

export class FacturacionAPI {
  // =======================================================
  // MÉTODOS CRUD PRINCIPALES
  // =======================================================

  /**
   * Crear nueva factura
   */
  static async crearFactura(datosFactura: DatosFactura): Promise<RespuestaFactura> {
    try {
      const response: AxiosResponse<RespuestaFactura> = await axios.post(
        `${API_BASE_URL}/documentos-electronicos/`,
        {
          tipo_documento: datosFactura.tipo_documento,
          cliente_id: datosFactura.cliente_id,
          serie: datosFactura.serie,
          tipo_pago: datosFactura.tipo_pago,
          dias_credito: datosFactura.dias_credito || 0,
          observaciones: datosFactura.observaciones,
          descuento_global: datosFactura.descuento_global || 0,
          items: datosFactura.items.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            descuento: item.descuento || 0,
            tipo_afectacion_igv: item.tipo_afectacion_igv,
            unidad_medida: item.unidad_medida,
            descripcion: item.descripcion,
          })),
        },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear factura:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al crear la factura. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Obtener factura por ID
   */
  static async obtenerFactura(id: number): Promise<Factura> {
    try {
      const response: AxiosResponse<Factura> = await axios.get(
        `${API_BASE_URL}/documentos-electronicos/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener factura:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener la factura. Verifique el ID e intente nuevamente.'
      );
    }
  }

  /**
   * Actualizar factura (solo borrador)
   */
  static async actualizarFactura(id: number, datosFactura: Partial<DatosFactura>): Promise<RespuestaFactura> {
    try {
      const response: AxiosResponse<RespuestaFactura> = await axios.put(
        `${API_BASE_URL}/documentos-electronicos/${id}/`,
        datosFactura,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar factura:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar la factura. Solo se pueden modificar documentos en borrador.'
      );
    }
  }

  /**
   * Anular factura
   */
  static async anularFactura(id: number, motivo: string): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/documentos-electronicos/${id}/anular/`,
        { motivo },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al anular factura:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al anular la factura. Verifique el estado del documento.'
      );
    }
  }

  // =======================================================
  // MÉTODOS DE BÚSQUEDA Y LISTADO
  // =======================================================

  /**
   * Listar facturas con filtros y paginación
   */
  static async listarFacturas(filtros: FiltrosFacturas = {}): Promise<FacturasPaginadas> {
    try {
      const params = new URLSearchParams();

      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.cliente_id) params.append('cliente', filtros.cliente_id.toString());
      if (filtros.tipo_documento) params.append('tipo_documento', filtros.tipo_documento);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.estado_pago) params.append('estado_pago', filtros.estado_pago);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.serie) params.append('serie', filtros.serie);
      if (filtros.numero_desde) params.append('numero_desde', filtros.numero_desde.toString());
      if (filtros.numero_hasta) params.append('numero_hasta', filtros.numero_hasta.toString());
      if (filtros.monto_desde) params.append('monto_desde', filtros.monto_desde.toString());
      if (filtros.monto_hasta) params.append('monto_hasta', filtros.monto_hasta.toString());
      if (filtros.usuario_creador) params.append('usuario_creador', filtros.usuario_creador.toString());
      
      // Paginación
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.limite) params.append('page_size', filtros.limite.toString());
      
      // Ordenamiento
      if (filtros.ordenar_por) {
        const orden = filtros.orden === 'desc' ? `-${filtros.ordenar_por}` : filtros.ordenar_por;
        params.append('ordering', orden);
      }

      const response: AxiosResponse<FacturasPaginadas> = await axios.get(
        `${API_BASE_URL}/documentos-electronicos/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al listar facturas:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener la lista de facturas.'
      );
    }
  }

  /**
   * Buscar facturas por múltiples criterios
   */
  static async buscarFacturas(parametros: ParametrosBusqueda): Promise<Factura[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', parametros.termino);
      if (parametros.limite) params.append('limit', parametros.limite.toString());

      const response: AxiosResponse<{ results: Factura[] }> = await axios.get(
        `${API_BASE_URL}/documentos-electronicos/buscar/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al buscar facturas:', error);
      throw new Error('Error en la búsqueda de facturas.');
    }
  }

  // =======================================================
  // MÉTODOS DE VALIDACIÓN
  // =======================================================

  /**
   * Validar factura antes de crear
   */
  static async validarFactura(datosFactura: DatosFactura): Promise<ValidacionFactura> {
    try {
      const response: AxiosResponse<ValidacionFactura> = await axios.post(
        `${API_BASE_URL}/documentos-electronicos/validar/`,
        datosFactura,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al validar factura:', error);
      throw new Error('Error en la validación de la factura.');
    }
  }

  /**
   * Validar stock antes de facturar
   */
  static async validarStock(items: ItemFactura[]): Promise<{ valido: boolean; errores: string[] }> {
    try {
      const response: AxiosResponse<{ valido: boolean; errores: string[] }> = await axios.post(
        `${API_BASE_URL}/validar-stock/`,
        { items },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al validar stock:', error);
      throw new Error('Error en la validación del stock.');
    }
  }

  // =======================================================
  // MÉTODOS DE SUNAT
  // =======================================================

  /**
   * Enviar documento a SUNAT
   */
  static async enviarASunat(id: number): Promise<EstadoSunat> {
    try {
      const response: AxiosResponse<EstadoSunat> = await axios.post(
        `${API_BASE_URL}/documentos-electronicos/${id}/enviar-sunat/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al enviar a SUNAT:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al enviar el documento a SUNAT.'
      );
    }
  }

  /**
   * Consultar estado en SUNAT
   */
  static async consultarEstadoSunat(id: number): Promise<EstadoSunat> {
    try {
      const response: AxiosResponse<EstadoSunat> = await axios.get(
        `${API_BASE_URL}/documentos-electronicos/${id}/estado-sunat/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al consultar estado SUNAT:', error);
      throw new Error('Error al consultar el estado en SUNAT.');
    }
  }

  /**
   * Descargar PDF de factura
   */
  static async descargarPDF(id: number): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/documentos-electronicos/${id}/pdf/`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      throw new Error('Error al descargar el PDF de la factura.');
    }
  }

  /**
   * Descargar XML firmado
   */
  static async descargarXML(id: number): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/documentos-electronicos/${id}/xml/`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al descargar XML:', error);
      throw new Error('Error al descargar el XML de la factura.');
    }
  }

  // =======================================================
  // MÉTODOS DE SERIES Y CONFIGURACIÓN
  // =======================================================

  /**
   * Obtener series disponibles
   */
  static async obtenerSeries(tipoDocumento?: TipoDocumento): Promise<SerieDocumento[]> {
    try {
      const params = new URLSearchParams();
      if (tipoDocumento) params.append('tipo_documento', tipoDocumento);

      const response: AxiosResponse<SerieDocumento[]> = await axios.get(
        `${API_BASE_URL}/series-documento/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener series:', error);
      throw new Error('Error al obtener las series de documentos.');
    }
  }

  /**
   * Obtener formas de pago disponibles
   */
  static async obtenerFormasPago(): Promise<FormaPago[]> {
    try {
      const response: AxiosResponse<FormaPago[]> = await axios.get(
        `${API_BASE_URL}/formas-pago/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener formas de pago:', error);
      throw new Error('Error al obtener las formas de pago.');
    }
  }

  /**
   * Obtener siguiente número de documento
   */
  static async obtenerSiguienteNumero(serie: string): Promise<{ numero: number }> {
    try {
      const response: AxiosResponse<{ numero: number }> = await axios.get(
        `${API_BASE_URL}/series-documento/${serie}/siguiente-numero/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener siguiente número:', error);
      throw new Error('Error al obtener el siguiente número de documento.');
    }
  }

  // =======================================================
  // MÉTODOS DE REPORTES Y ESTADÍSTICAS
  // =======================================================

  /**
   * Obtener resumen de ventas
   */
  static async obtenerResumenVentas(
    fechaDesde: string, 
    fechaHasta: string,
    tipoDocumento?: TipoDocumento
  ): Promise<ResumenVentas> {
    try {
      const params = new URLSearchParams();
      params.append('fecha_desde', fechaDesde);
      params.append('fecha_hasta', fechaHasta);
      if (tipoDocumento) params.append('tipo_documento', tipoDocumento);

      const response: AxiosResponse<ResumenVentas> = await axios.get(
        `${API_BASE_URL}/reportes/resumen-ventas/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener resumen de ventas:', error);
      throw new Error('Error al obtener el resumen de ventas.');
    }
  }

  /**
   * Obtener estadísticas del día
   */
  static async obtenerEstadisticasDelDia(): Promise<{
    total_facturas: number;
    total_boletas: number;
    monto_total: number;
    documentos_pendientes: number;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/estadisticas/hoy/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas del día:', error);
      throw new Error('Error al obtener las estadísticas del día.');
    }
  }

  // =======================================================
  // MÉTODOS DE UTILIDADES
  // =======================================================

  /**
   * Duplicar factura (crear copia como borrador)
   */
  static async duplicarFactura(id: number): Promise<RespuestaFactura> {
    try {
      const response: AxiosResponse<RespuestaFactura> = await axios.post(
        `${API_BASE_URL}/documentos-electronicos/${id}/duplicar/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al duplicar factura:', error);
      throw new Error('Error al duplicar la factura.');
    }
  }

  /**
   * Previsualizar factura (generar vista previa sin guardar)
   */
  static async previsualizarFactura(datosFactura: DatosFactura): Promise<{ preview_url: string }> {
    try {
      const response: AxiosResponse<{ preview_url: string }> = await axios.post(
        `${API_BASE_URL}/documentos-electronicos/previsualizar/`,
        datosFactura,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al previsualizar factura:', error);
      throw new Error('Error al generar la previsualización.');
    }
  }

  /**
   * Limpiar cache del servicio
   */
  static limpiarCache(): void {
    // Implementar lógica de limpieza de cache si es necesario
    console.log('Cache de facturación limpiado');
  }
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default FacturacionAPI;