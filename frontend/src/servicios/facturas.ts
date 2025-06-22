/**
 * Servicio de Facturas - FELICITAFAC
 * Gestión completa de facturación electrónica SUNAT
 * Integración con Nubefact y control de inventario PEPS
 */

import apiClient from './api';
import type { 
  Factura, 
  CrearFacturaRequest,
  ActualizarFacturaRequest,
  FacturasPaginadas,
  DetalleFactura,
  ItemFactura,
  AnularFacturaRequest,
  EstadoSunat,
  ResumenVentas
} from '../types/factura';

// Tipos específicos del servicio
interface FiltroFacturas {
  busqueda?: string;
  cliente_id?: number;
  tipo_documento?: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
  estado?: 'pendiente' | 'emitida' | 'anulada' | 'rechazada';
  fecha_desde?: string;
  fecha_hasta?: string;
  serie?: string;
  numero_desde?: number;
  numero_hasta?: number;
  pagina?: number;
  limite?: number;
}

interface ResumenPeriodo {
  fecha_desde: string;
  fecha_hasta: string;
  incluir_igv?: boolean;
}

interface ConsultarEstadoSunatRequest {
  factura_id: number;
  forzar_consulta?: boolean;
}

class ServicioFacturas {
  private readonly baseUrl = '/api/facturacion';

  /**
   * Obtener lista paginada de facturas
   */
  async obtenerFacturas(filtros: FiltroFacturas = {}): Promise<FacturasPaginadas> {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.cliente_id) params.append('cliente', filtros.cliente_id.toString());
      if (filtros.tipo_documento) params.append('tipo_documento', filtros.tipo_documento);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.serie) params.append('serie', filtros.serie);
      if (filtros.numero_desde) params.append('numero_desde', filtros.numero_desde.toString());
      if (filtros.numero_hasta) params.append('numero_hasta', filtros.numero_hasta.toString());
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.limite) params.append('page_size', filtros.limite.toString());

      const response = await apiClient.get(`${this.baseUrl}/facturas/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener factura por ID
   */
  async obtenerFacturaPorId(facturaId: number): Promise<DetalleFactura> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/facturas/${facturaId}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener factura:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Crear nueva factura
   */
  async crearFactura(datosFactura: CrearFacturaRequest): Promise<Factura> {
    try {
      // Validar datos antes de enviar
      this.validarDatosFactura(datosFactura);

      const response = await apiClient.post(`${this.baseUrl}/facturas/`, datosFactura);
      return response.data;
    } catch (error) {
      console.error('Error al crear factura:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Actualizar factura existente (solo si está en borrador)
   */
  async actualizarFactura(facturaId: number, datosFactura: ActualizarFacturaRequest): Promise<Factura> {
    try {
      this.validarDatosFactura(datosFactura);

      const response = await apiClient.put(`${this.baseUrl}/facturas/${facturaId}/`, datosFactura);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Emitir factura (enviar a SUNAT vía Nubefact)
   */
  async emitirFactura(facturaId: number): Promise<{ factura: Factura; estado_sunat: EstadoSunat }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/facturas/${facturaId}/emitir/`);
      return response.data;
    } catch (error) {
      console.error('Error al emitir factura:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Anular factura
   */
  async anularFactura(facturaId: number, datos: AnularFacturaRequest): Promise<Factura> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/facturas/${facturaId}/anular/`, datos);
      return response.data;
    } catch (error) {
      console.error('Error al anular factura:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Consultar estado en SUNAT
   */
  async consultarEstadoSunat(datos: ConsultarEstadoSunatRequest): Promise<EstadoSunat> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/facturas/${datos.factura_id}/consultar-estado/`,
        { forzar_consulta: datos.forzar_consulta || false }
      );
      return response.data;
    } catch (error) {
      console.error('Error al consultar estado SUNAT:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Descargar PDF de factura
   */
  async descargarPdf(facturaId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/facturas/${facturaId}/pdf/`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Descargar XML de factura
   */
  async descargarXml(facturaId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/facturas/${facturaId}/xml/`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error al descargar XML:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Reenviar factura por email
   */
  async reenviarEmail(facturaId: number, email?: string): Promise<{ enviado: boolean; mensaje: string }> {
    try {
      const payload = email ? { email } : {};
      const response = await apiClient.post(`${this.baseUrl}/facturas/${facturaId}/reenviar-email/`, payload);
      return response.data;
    } catch (error) {
      console.error('Error al reenviar email:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener siguiente número de factura
   */
  async obtenerSiguienteNumero(serie: string, tipoDocumento: string): Promise<{ siguiente_numero: number }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/siguiente-numero/`, {
        params: { serie, tipo_documento: tipoDocumento }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener siguiente número:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener series disponibles
   */
  async obtenerSeriesDisponibles(tipoDocumento?: string): Promise<any[]> {
    try {
      const params = tipoDocumento ? { tipo_documento: tipoDocumento } : {};
      const response = await apiClient.get(`${this.baseUrl}/series/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener series:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Calcular totales de factura
   */
  async calcularTotales(items: ItemFactura[]): Promise<{
    subtotal: number;
    igv: number;
    total: number;
    descuento_total: number;
  }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/calcular-totales/`, { items });
      return response.data;
    } catch (error) {
      console.error('Error al calcular totales:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Validar stock antes de facturar
   */
  async validarStock(items: ItemFactura[]): Promise<{
    valido: boolean;
    errores: string[];
    advertencias: string[];
  }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/validar-stock/`, { items });
      return response.data;
    } catch (error) {
      console.error('Error al validar stock:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener resumen de ventas
   */
  async obtenerResumenVentas(periodo: ResumenPeriodo): Promise<ResumenVentas> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/resumen-ventas/`, periodo);
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen de ventas:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener top productos vendidos
   */
  async obtenerTopProductos(limite = 10, fechaDesde?: string, fechaHasta?: string): Promise<any[]> {
    try {
      const params: any = { limite };
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;

      const response = await apiClient.get(`${this.baseUrl}/top-productos/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener top productos:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Obtener estadísticas de ventas por período
   */
  async obtenerEstadisticasVentas(fechaDesde: string, fechaHasta: string): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/estadisticas-ventas/`, {
        params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de ventas:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Exportar facturas a Excel
   */
  async exportarFacturas(filtros: FiltroFacturas = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.cliente_id) params.append('cliente', filtros.cliente_id.toString());
      if (filtros.tipo_documento) params.append('tipo_documento', filtros.tipo_documento);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const response = await apiClient.get(
        `${this.baseUrl}/facturas/exportar-excel/?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error al exportar facturas:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Generar reporte PLE (Programa de Libros Electrónicos)
   */
  async generarReportePle(periodo: string, tipoLibro: string): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/reporte-ple/`,
        {
          params: { periodo, tipo_libro: tipoLibro },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al generar reporte PLE:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Crear nota de crédito
   */
  async crearNotaCredito(facturaId: number, datos: any): Promise<Factura> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/facturas/${facturaId}/nota-credito/`,
        datos
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear nota de crédito:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Crear nota de débito
   */
  async crearNotaDebito(facturaId: number, datos: any): Promise<Factura> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/facturas/${facturaId}/nota-debito/`,
        datos
      );
      return response.data;
    } catch (error) {
      console.error('Error al crear nota de débito:', error);
      throw this.manejarError(error);
    }
  }

  /**
   * Validaciones de datos de factura
   */
  private validarDatosFactura(datos: CrearFacturaRequest | ActualizarFacturaRequest): void {
    // Validar cliente
    if (!datos.cliente_id) {
      throw new Error('Cliente es obligatorio');
    }

    // Validar serie y número
    if (!datos.serie || datos.serie.trim().length === 0) {
      throw new Error('Serie es obligatoria');
    }

    if (!datos.numero || datos.numero <= 0) {
      throw new Error('Número de documento debe ser mayor a 0');
    }

    // Validar items
    if (!datos.items || datos.items.length === 0) {
      throw new Error('La factura debe tener al menos un item');
    }

    // Validar cada item
    datos.items.forEach((item, index) => {
      if (!item.producto_id) {
        throw new Error(`Item ${index + 1}: Producto es obligatorio`);
      }

      if (!item.cantidad || item.cantidad <= 0) {
        throw new Error(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
      }

      if (!item.precio_unitario || item.precio_unitario <= 0) {
        throw new Error(`Item ${index + 1}: Precio unitario debe ser mayor a 0`);
      }

      // Validar descuento
      if (item.descuento && (item.descuento < 0 || item.descuento > 100)) {
        throw new Error(`Item ${index + 1}: Descuento debe estar entre 0 y 100`);
      }
    });

    // Validar fechas
    const fechaEmision = new Date(datos.fecha_emision);
    const hoy = new Date();
    
    if (fechaEmision > hoy) {
      throw new Error('La fecha de emisión no puede ser futura');
    }

    if (datos.fecha_vencimiento) {
      const fechaVencimiento = new Date(datos.fecha_vencimiento);
      if (fechaVencimiento < fechaEmision) {
        throw new Error('La fecha de vencimiento no puede ser anterior a la fecha de emisión');
      }
    }

    // Validar moneda
    if (!['PEN', 'USD', 'EUR'].includes(datos.moneda)) {
      throw new Error('Moneda debe ser PEN, USD o EUR');
    }

    // Validar tipo de cambio para moneda extranjera
    if (datos.moneda !== 'PEN' && (!datos.tipo_cambio || datos.tipo_cambio <= 0)) {
      throw new Error('Tipo de cambio es obligatorio para moneda extranjera');
    }
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
          return new Error(data.detail || 'Datos de factura inválidos');
        case 404:
          return new Error('Factura no encontrada');
        case 409:
          return new Error('Ya existe una factura con esta serie y número');
        case 422:
          return new Error(data.detail || 'Error en validación de datos');
        case 423:
          return new Error('La factura no puede ser modificada en su estado actual');
        case 424:
          return new Error('Error en comunicación con SUNAT. Reintente más tarde');
        case 425:
          return new Error('Stock insuficiente para uno o más productos');
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
export const servicioFacturas = new ServicioFacturas();
export default servicioFacturas;