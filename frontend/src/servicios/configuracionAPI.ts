/**
 * Servicio API de Configuración - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Servicio completo para configuración del sistema y empresa
 */

import axios, { AxiosResponse } from 'axios';
import { 
  ConfiguracionSistema,
  ConfiguracionEmpresa,
  ConfiguracionSunat,
  ConfiguracionFacturacion,
  ConfiguracionInventario,
  ConfiguracionContabilidad,
  ConfiguracionCorreo,
  ConfiguracionPOS,
  CertificadoDigital,
  SerieDocumento,
  UnidadMedida,
  MonedaSistema,
  BackupConfiguracion,
  LogSistema
} from '../types/configuracion';
import { Empresa, Sucursal } from '../types/core';
import { obtenerToken } from '../utils/auth';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = '/api/configuracion';

const obtenerConfiguracion = () => ({
  headers: {
    'Authorization': `Bearer ${obtenerToken()}`,
    'Content-Type': 'application/json',
  },
});

// =======================================================
// CLASE PRINCIPAL DEL SERVICIO
// =======================================================

export class ConfiguracionAPI {
  // =======================================================
  // MÉTODOS DE CONFIGURACIÓN GENERAL
  // =======================================================

  /**
   * Obtener configuración general del sistema
   */
  static async obtenerConfiguracionSistema(): Promise<ConfiguracionSistema> {
    try {
      const response: AxiosResponse<ConfiguracionSistema> = await axios.get(
        `${API_BASE_URL}/sistema/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener configuración del sistema:', error);
      throw new Error('Error al obtener la configuración del sistema.');
    }
  }

  /**
   * Actualizar configuración del sistema
   */
  static async actualizarConfiguracionSistema(config: Partial<ConfiguracionSistema>): Promise<ConfiguracionSistema> {
    try {
      const response: AxiosResponse<ConfiguracionSistema> = await axios.put(
        `${API_BASE_URL}/sistema/`,
        config,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar configuración del sistema:', error);
      throw new Error('Error al actualizar la configuración del sistema.');
    }
  }

  // =======================================================
  // MÉTODOS DE CONFIGURACIÓN DE EMPRESA
  // =======================================================

  /**
   * Obtener datos de la empresa
   */
  static async obtenerEmpresa(): Promise<Empresa> {
    try {
      const response: AxiosResponse<Empresa> = await axios.get(
        `${API_BASE_URL}/empresa/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener datos de empresa:', error);
      throw new Error('Error al obtener los datos de la empresa.');
    }
  }

  /**
   * Actualizar datos de la empresa
   */
  static async actualizarEmpresa(empresa: Partial<Empresa>): Promise<Empresa> {
    try {
      const response: AxiosResponse<Empresa> = await axios.put(
        `${API_BASE_URL}/empresa/`,
        empresa,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar empresa:', error);
      throw new Error('Error al actualizar los datos de la empresa.');
    }
  }

  /**
   * Subir logo de la empresa
   */
  static async subirLogo(archivo: File): Promise<{ logo_url: string }> {
    try {
      const formData = new FormData();
      formData.append('logo', archivo);

      const response = await axios.post(
        `${API_BASE_URL}/empresa/subir-logo/`,
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
      console.error('Error al subir logo:', error);
      throw new Error('Error al subir el logo de la empresa.');
    }
  }

  // =======================================================
  // MÉTODOS DE SUCURSALES
  // =======================================================

  /**
   * Obtener todas las sucursales
   */
  static async obtenerSucursales(): Promise<Sucursal[]> {
    try {
      const response: AxiosResponse<{ results: Sucursal[] }> = await axios.get(
        `${API_BASE_URL}/sucursales/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener sucursales:', error);
      throw new Error('Error al obtener las sucursales.');
    }
  }

  /**
   * Crear nueva sucursal
   */
  static async crearSucursal(sucursal: {
    codigo: string;
    nombre: string;
    direccion: string;
    telefono?: string;
    email?: string;
    es_principal?: boolean;
    activo?: boolean;
  }): Promise<Sucursal> {
    try {
      const response: AxiosResponse<Sucursal> = await axios.post(
        `${API_BASE_URL}/sucursales/`,
        sucursal,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear sucursal:', error);
      throw new Error('Error al crear la sucursal.');
    }
  }

  /**
   * Actualizar sucursal
   */
  static async actualizarSucursal(id: number, sucursal: Partial<Sucursal>): Promise<Sucursal> {
    try {
      const response: AxiosResponse<Sucursal> = await axios.put(
        `${API_BASE_URL}/sucursales/${id}/`,
        sucursal,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar sucursal:', error);
      throw new Error('Error al actualizar la sucursal.');
    }
  }

  // =======================================================
  // MÉTODOS DE CONFIGURACIÓN SUNAT
  // =======================================================

  /**
   * Obtener configuración SUNAT
   */
  static async obtenerConfiguracionSunat(): Promise<ConfiguracionSunat> {
    try {
      const response: AxiosResponse<ConfiguracionSunat> = await axios.get(
        `${API_BASE_URL}/sunat/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener configuración SUNAT:', error);
      throw new Error('Error al obtener la configuración SUNAT.');
    }
  }

  /**
   * Actualizar configuración SUNAT
   */
  static async actualizarConfiguracionSunat(config: Partial<ConfiguracionSunat>): Promise<ConfiguracionSunat> {
    try {
      const response: AxiosResponse<ConfiguracionSunat> = await axios.put(
        `${API_BASE_URL}/sunat/`,
        config,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar configuración SUNAT:', error);
      throw new Error('Error al actualizar la configuración SUNAT.');
    }
  }

  /**
   * Probar conexión SUNAT
   */
  static async probarConexionSunat(): Promise<{
    exitoso: boolean;
    mensaje: string;
    tiempo_respuesta: number;
    estado_servicio: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sunat/probar-conexion/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al probar conexión SUNAT:', error);
      throw new Error('Error al probar la conexión con SUNAT.');
    }
  }

  // =======================================================
  // MÉTODOS DE CERTIFICADOS DIGITALES
  // =======================================================

  /**
   * Subir certificado digital
   */
  static async subirCertificado(
    archivo: File,
    password: string,
    alias?: string
  ): Promise<CertificadoDigital> {
    try {
      const formData = new FormData();
      formData.append('certificado', archivo);
      formData.append('password', password);
      if (alias) formData.append('alias', alias);

      const response: AxiosResponse<CertificadoDigital> = await axios.post(
        `${API_BASE_URL}/certificados/`,
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
      console.error('Error al subir certificado:', error);
      throw new Error('Error al subir el certificado digital.');
    }
  }

  /**
   * Obtener certificados disponibles
   */
  static async obtenerCertificados(): Promise<CertificadoDigital[]> {
    try {
      const response: AxiosResponse<{ results: CertificadoDigital[] }> = await axios.get(
        `${API_BASE_URL}/certificados/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener certificados:', error);
      throw new Error('Error al obtener los certificados.');
    }
  }

  /**
   * Validar certificado
   */
  static async validarCertificado(id: number): Promise<{
    valido: boolean;
    fecha_vencimiento: string;
    dias_vencimiento: number;
    emisor: string;
    titular: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/certificados/${id}/validar/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al validar certificado:', error);
      throw new Error('Error al validar el certificado.');
    }
  }

  // =======================================================
  // MÉTODOS DE SERIES DE DOCUMENTOS
  // =======================================================

  /**
   * Obtener series de documentos
   */
  static async obtenerSeriesDocumentos(): Promise<SerieDocumento[]> {
    try {
      const response: AxiosResponse<{ results: SerieDocumento[] }> = await axios.get(
        `${API_BASE_URL}/series-documento/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener series:', error);
      throw new Error('Error al obtener las series de documentos.');
    }
  }

  /**
   * Crear nueva serie
   */
  static async crearSerieDocumento(serie: {
    tipo_documento_id: number;
    sucursal_id: number;
    serie: string;
    numero_inicial: number;
    numero_actual?: number;
    activo?: boolean;
  }): Promise<SerieDocumento> {
    try {
      const response: AxiosResponse<SerieDocumento> = await axios.post(
        `${API_BASE_URL}/series-documento/`,
        serie,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear serie:', error);
      throw new Error('Error al crear la serie de documento.');
    }
  }

  /**
   * Actualizar serie
   */
  static async actualizarSerieDocumento(id: number, serie: Partial<SerieDocumento>): Promise<SerieDocumento> {
    try {
      const response: AxiosResponse<SerieDocumento> = await axios.put(
        `${API_BASE_URL}/series-documento/${id}/`,
        serie,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar serie:', error);
      throw new Error('Error al actualizar la serie.');
    }
  }

  // =======================================================
  // MÉTODOS DE CONFIGURACIÓN DE FACTURACIÓN
  // =======================================================

  /**
   * Obtener configuración de facturación
   */
  static async obtenerConfiguracionFacturacion(): Promise<ConfiguracionFacturacion> {
    try {
      const response: AxiosResponse<ConfiguracionFacturacion> = await axios.get(
        `${API_BASE_URL}/facturacion/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener configuración de facturación:', error);
      throw new Error('Error al obtener la configuración de facturación.');
    }
  }

  /**
   * Actualizar configuración de facturación
   */
  static async actualizarConfiguracionFacturacion(config: Partial<ConfiguracionFacturacion>): Promise<ConfiguracionFacturacion> {
    try {
      const response: AxiosResponse<ConfiguracionFacturacion> = await axios.put(
        `${API_BASE_URL}/facturacion/`,
        config,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar configuración de facturación:', error);
      throw new Error('Error al actualizar la configuración de facturación.');
    }
  }

  // =======================================================
  // MÉTODOS DE CONFIGURACIÓN POS
  // =======================================================

  /**
   * Obtener configuración POS
   */
  static async obtenerConfiguracionPOS(): Promise<ConfiguracionPOS> {
    try {
      const response: AxiosResponse<ConfiguracionPOS> = await axios.get(
        `${API_BASE_URL}/pos/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener configuración POS:', error);
      throw new Error('Error al obtener la configuración del POS.');
    }
  }

  /**
   * Actualizar configuración POS
   */
  static async actualizarConfiguracionPOS(config: Partial<ConfiguracionPOS>): Promise<ConfiguracionPOS> {
    try {
      const response: AxiosResponse<ConfiguracionPOS> = await axios.put(
        `${API_BASE_URL}/pos/`,
        config,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar configuración POS:', error);
      throw new Error('Error al actualizar la configuración del POS.');
    }
  }

  // =======================================================
  // MÉTODOS DE CONFIGURACIÓN DE CORREO
  // =======================================================

  /**
   * Obtener configuración de correo
   */
  static async obtenerConfiguracionCorreo(): Promise<ConfiguracionCorreo> {
    try {
      const response: AxiosResponse<ConfiguracionCorreo> = await axios.get(
        `${API_BASE_URL}/correo/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener configuración de correo:', error);
      throw new Error('Error al obtener la configuración de correo.');
    }
  }

  /**
   * Actualizar configuración de correo
   */
  static async actualizarConfiguracionCorreo(config: Partial<ConfiguracionCorreo>): Promise<ConfiguracionCorreo> {
    try {
      const response: AxiosResponse<ConfiguracionCorreo> = await axios.put(
        `${API_BASE_URL}/correo/`,
        config,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar configuración de correo:', error);
      throw new Error('Error al actualizar la configuración de correo.');
    }
  }

  /**
   * Probar configuración de correo
   */
  static async probarCorreo(emailDestino: string): Promise<{ exitoso: boolean; mensaje: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/correo/probar/`,
        { email_destino: emailDestino },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al probar correo:', error);
      throw new Error('Error al probar la configuración de correo.');
    }
  }

  // =======================================================
  // MÉTODOS DE BACKUP
  // =======================================================

  /**
   * Crear backup del sistema
   */
  static async crearBackup(incluirArchivos: boolean = true): Promise<{
    id: number;
    nombre_archivo: string;
    tamaño: number;
    fecha_creacion: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/backup/crear/`,
        { incluir_archivos: incluirArchivos },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear backup:', error);
      throw new Error('Error al crear el backup del sistema.');
    }
  }

  /**
   * Obtener lista de backups
   */
  static async obtenerBackups(): Promise<BackupConfiguracion[]> {
    try {
      const response: AxiosResponse<{ results: BackupConfiguracion[] }> = await axios.get(
        `${API_BASE_URL}/backup/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener backups:', error);
      throw new Error('Error al obtener la lista de backups.');
    }
  }

  /**
   * Descargar backup
   */
  static async descargarBackup(id: number): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/backup/${id}/descargar/`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al descargar backup:', error);
      throw new Error('Error al descargar el backup.');
    }
  }

  /**
   * Restaurar backup
   */
  static async restaurarBackup(archivo: File): Promise<{ mensaje: string }> {
    try {
      const formData = new FormData();
      formData.append('backup', archivo);

      const response = await axios.post(
        `${API_BASE_URL}/backup/restaurar/`,
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
      console.error('Error al restaurar backup:', error);
      throw new Error('Error al restaurar el backup.');
    }
  }

  // =======================================================
  // MÉTODOS DE LOGS Y AUDITORÍA
  // =======================================================

  /**
   * Obtener logs del sistema
   */
  static async obtenerLogs(
    nivel?: string,
    fechaDesde?: string,
    fechaHasta?: string,
    limite?: number
  ): Promise<LogSistema[]> {
    try {
      const params = new URLSearchParams();
      if (nivel) params.append('nivel', nivel);
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);
      if (limite) params.append('limit', limite.toString());

      const response: AxiosResponse<{ results: LogSistema[] }> = await axios.get(
        `${API_BASE_URL}/logs/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener logs:', error);
      throw new Error('Error al obtener los logs del sistema.');
    }
  }

  /**
   * Limpiar logs antiguos
   */
  static async limpiarLogs(diasAtras: number): Promise<{ registros_eliminados: number }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/logs/limpiar/`,
        { dias_atras: diasAtras },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al limpiar logs:', error);
      throw new Error('Error al limpiar los logs.');
    }
  }

  // =======================================================
  // MÉTODOS DE DATOS MAESTROS
  // =======================================================

  /**
   * Obtener unidades de medida
   */
  static async obtenerUnidadesMedida(): Promise<UnidadMedida[]> {
    try {
      const response: AxiosResponse<{ results: UnidadMedida[] }> = await axios.get(
        `${API_BASE_URL}/unidades-medida/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener unidades de medida:', error);
      throw new Error('Error al obtener las unidades de medida.');
    }
  }

  /**
   * Obtener monedas del sistema
   */
  static async obtenerMonedas(): Promise<MonedaSistema[]> {
    try {
      const response: AxiosResponse<{ results: MonedaSistema[] }> = await axios.get(
        `${API_BASE_URL}/monedas/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener monedas:', error);
      throw new Error('Error al obtener las monedas del sistema.');
    }
  }

  // =======================================================
  // MÉTODOS DE UTILIDADES
  // =======================================================

  /**
   * Obtener información del sistema
   */
  static async obtenerInfoSistema(): Promise<{
    version: string;
    base_datos: string;
    servidor: string;
    memoria_usada: string;
    espacio_disco: string;
    ultima_actualizacion: string;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/info-sistema/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener info del sistema:', error);
      throw new Error('Error al obtener la información del sistema.');
    }
  }

  /**
   * Ejecutar mantenimiento del sistema
   */
  static async ejecutarMantenimiento(): Promise<{
    tareas_ejecutadas: string[];
    tiempo_total: number;
    errores: string[];
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/mantenimiento/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al ejecutar mantenimiento:', error);
      throw new Error('Error al ejecutar el mantenimiento del sistema.');
    }
  }

  /**
   * Limpiar cache del servicio
   */
  static limpiarCache(): void {
    console.log('Cache de configuración limpiado');
  }
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default ConfiguracionAPI;