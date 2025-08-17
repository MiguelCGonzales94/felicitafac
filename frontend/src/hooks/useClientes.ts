/**
 * Hook useClientes - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook completo para gestión de clientes con validaciones SUNAT
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApi } from './useApi';
import { useNotificaciones } from '../componentes/comunes/Notificaciones';
import { useCarga } from '../componentes/comunes/ComponenteCarga';
import ClientesAPI from '../servicios/clientesAPI';
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
import { validarRuc, validarDni, validarEmail } from '../utils/validaciones';
import { formatearDocumento, formatearTelefono } from '../utils/formateo';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

interface EstadoClientes {
  clientes: ResumenCliente[];
  clienteActual: Cliente | null;
  detalleCliente: DetalleClienteResponse | null;
  tiposDocumento: Array<{ codigo: string; descripcion: string; activo: boolean }>;
  totalClientes: number;
  paginaActual: number;
  totalPaginas: number;
  cargandoClientes: boolean;
  cargandoCliente: boolean;
  cargandoTipos: boolean;
  error: string | null;
}

interface ConfiguracionClientes {
  autoCompletarDatos: boolean;
  validarDocumentosAutomatico: boolean;
  consultarSunatAutomatico: boolean;
  consultarReniecAutomatico: boolean;
  permitirClientesDuplicados: boolean;
  marcarFavoritoNuevos: boolean;
}

interface ResultadoConsulta {
  exitoso: boolean;
  datos?: {
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    razonSocial?: string;
    direccion?: string;
    estado?: string;
    condicion?: string;
  };
  mensaje?: string;
}

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useClientes = () => {
  // =======================================================
  // ESTADO LOCAL
  // =======================================================

  const [estado, setEstado] = useState<EstadoClientes>({
    clientes: [],
    clienteActual: null,
    detalleCliente: null,
    tiposDocumento: [],
    totalClientes: 0,
    paginaActual: 1,
    totalPaginas: 1,
    cargandoClientes: false,
    cargandoCliente: false,
    cargandoTipos: false,
    error: null,
  });

  const [configuracion, setConfiguracion] = useState<ConfiguracionClientes>({
    autoCompletarDatos: true,
    validarDocumentosAutomatico: true,
    consultarSunatAutomatico: true,
    consultarReniecAutomatico: true,
    permitirClientesDuplicados: false,
    marcarFavoritoNuevos: false,
  });

  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosClientes>({});

  // =======================================================
  // HOOKS EXTERNOS
  // =======================================================

  const { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useNotificaciones();
  const { mostrarCarga, ocultarCarga } = useCarga();

  // Hooks API especializados
  const {
    data: dataClientes,
    loading: cargandoListaClientes,
    ejecutar: ejecutarListarClientes,
    error: errorListaClientes
  } = useApi(
    () => ClientesAPI.listarClientes(filtrosActivos),
    { 
      ejecutarInmediatamente: false,
      cachear: true,
      tiempoCacheMs: 60000 // 1 minuto
    }
  );

  const {
    ejecutar: ejecutarCrearCliente,
    loading: cargandoCrearCliente
  } = useApi(
    (datosCliente: FormularioCliente) => ClientesAPI.crearCliente(datosCliente),
    { ejecutarInmediatamente: false }
  );

  const {
    ejecutar: ejecutarObtenerCliente,
    loading: cargandoObtenerCliente
  } = useApi(
    (id: number) => ClientesAPI.obtenerCliente(id),
    { ejecutarInmediatamente: false }
  );

  // =======================================================
  // EFECTOS
  // =======================================================

  // Actualizar estado cuando cambien los datos de clientes
  useEffect(() => {
    if (dataClientes) {
      setEstado(prev => ({
        ...prev,
        clientes: dataClientes.resultados || [],
        totalClientes: dataClientes.total || 0,
        paginaActual: dataClientes.pagina || 1,
        totalPaginas: dataClientes.total_paginas || 1,
        cargandoClientes: false,
        error: null,
      }));
    }
  }, [dataClientes]);

  // Manejar errores
  useEffect(() => {
    if (errorListaClientes) {
      setEstado(prev => ({
        ...prev,
        error: errorListaClientes,
        cargandoClientes: false,
      }));
      mostrarError('Error al cargar clientes', errorListaClientes);
    }
  }, [errorListaClientes, mostrarError]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const cargarDatosIniciales = useCallback(async () => {
    try {
      setEstado(prev => ({ ...prev, cargandoTipos: true }));
      
      const tiposDocumento = await ClientesAPI.obtenerTiposDocumento();

      setEstado(prev => ({
        ...prev,
        tiposDocumento,
        cargandoTipos: false,
      }));

    } catch (error: any) {
      console.error('Error al cargar datos iniciales:', error);
      setEstado(prev => ({
        ...prev,
        cargandoTipos: false,
        error: error.message,
      }));
      mostrarError('Error al cargar datos', 'No se pudieron cargar los tipos de documento');
    }
  }, [mostrarError]);

  const detectarTipoDocumento = useCallback((numeroDocumento: string): TipoDocumentoCliente | null => {
    if (!numeroDocumento) return null;
    
    const numero = numeroDocumento.replace(/\D/g, '');
    
    if (numero.length === 8) return '1'; // DNI
    if (numero.length === 11) return '6'; // RUC
    if (numero.length === 12) return '4'; // Carnet de extranjería
    
    return null;
  }, []);

  const validarDocumentoSegunTipo = useCallback((
    numeroDocumento: string, 
    tipoDocumento: TipoDocumentoCliente
  ): { valido: boolean; mensaje?: string } => {
    if (!numeroDocumento) {
      return { valido: false, mensaje: 'El número de documento es requerido' };
    }

    switch (tipoDocumento) {
      case '1': // DNI
        return validarDni(numeroDocumento);
      case '6': // RUC
        return validarRuc(numeroDocumento);
      case '4': // Carnet de extranjería
        if (numeroDocumento.length < 8 || numeroDocumento.length > 12) {
          return { valido: false, mensaje: 'El carnet de extranjería debe tener entre 8 y 12 caracteres' };
        }
        return { valido: true };
      default:
        return { valido: true };
    }
  }, []);

  // =======================================================
  // FUNCIONES PRINCIPALES
  // =======================================================

  /**
   * Listar clientes con filtros
   */
  const listarClientes = useCallback(async (filtros: FiltrosClientes = {}) => {
    try {
      setFiltrosActivos(filtros);
      setEstado(prev => ({ ...prev, cargandoClientes: true, error: null }));
      
      await ejecutarListarClientes();
      
    } catch (error: any) {
      console.error('Error al listar clientes:', error);
      mostrarError('Error al cargar clientes', error.message);
    }
  }, [ejecutarListarClientes, mostrarError]);

  /**
   * Crear nuevo cliente
   */
  const crearCliente = useCallback(async (datosCliente: FormularioCliente): Promise<Cliente | null> => {
    try {
      mostrarCarga('Creando cliente...');
      
      // Validar datos del cliente
      const validacion = await ClientesAPI.validarCliente(datosCliente);
      
      if (!validacion.numero_documento.valido) {
        mostrarError('Documento inválido', validacion.numero_documento.mensaje || 'Número de documento inválido');
        return null;
      }

      if (!validacion.email.valido && datosCliente.email) {
        mostrarError('Email inválido', validacion.email.mensaje || 'Formato de email inválido');
        return null;
      }

      // Verificar si el documento ya existe
      if (!configuracion.permitirClientesDuplicados) {
        const verificacion = await ClientesAPI.verificarDocumentoExistente(datosCliente.numero_documento);
        if (verificacion.existe) {
          mostrarAdvertencia('Cliente ya existe', `Ya existe un cliente con el documento ${datosCliente.numero_documento}`);
          return null;
        }
      }

      const cliente = await ejecutarCrearCliente(datosCliente);
      
      if (cliente) {
        mostrarExito('¡Cliente creado!', `Cliente ${cliente.nombre_completo} creado exitosamente`);
        
        // Actualizar lista de clientes
        await listarClientes(filtrosActivos);
        
        return cliente;
      }

      return null;
    } catch (error: any) {
      console.error('Error al crear cliente:', error);
      mostrarError('Error al crear cliente', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [
    configuracion.permitirClientesDuplicados,
    ejecutarCrearCliente, 
    mostrarCarga, 
    ocultarCarga, 
    mostrarExito, 
    mostrarError, 
    mostrarAdvertencia,
    filtrosActivos,
    listarClientes
  ]);

  /**
   * Obtener cliente por ID
   */
  const obtenerCliente = useCallback(async (id: number): Promise<DetalleClienteResponse | null> => {
    try {
      setEstado(prev => ({ ...prev, cargandoCliente: true }));
      
      const detalle = await ejecutarObtenerCliente(id);
      
      if (detalle) {
        setEstado(prev => ({
          ...prev,
          clienteActual: detalle.cliente,
          detalleCliente: detalle,
          cargandoCliente: false,
        }));
        return detalle;
      }

      return null;
    } catch (error: any) {
      console.error('Error al obtener cliente:', error);
      setEstado(prev => ({
        ...prev,
        cargandoCliente: false,
        error: error.message,
      }));
      mostrarError('Error al cargar cliente', error.message);
      return null;
    }
  }, [ejecutarObtenerCliente, mostrarError]);

  /**
   * Actualizar cliente
   */
  const actualizarCliente = useCallback(async (id: number, datosCliente: Partial<FormularioCliente>): Promise<boolean> => {
    try {
      mostrarCarga('Actualizando cliente...');
      
      const cliente = await ClientesAPI.actualizarCliente(id, datosCliente);
      
      if (cliente) {
        mostrarExito('Cliente actualizado', 'Los cambios se guardaron correctamente');
        
        // Actualizar en el estado si es el cliente actual
        if (estado.clienteActual?.id === id) {
          setEstado(prev => ({
            ...prev,
            clienteActual: cliente,
            detalleCliente: prev.detalleCliente ? {
              ...prev.detalleCliente,
              cliente
            } : null,
          }));
        }

        // Actualizar lista
        await listarClientes(filtrosActivos);
        
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error);
      mostrarError('Error al actualizar', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.clienteActual, filtrosActivos, listarClientes, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Eliminar cliente
   */
  const eliminarCliente = useCallback(async (id: number): Promise<boolean> => {
    try {
      mostrarCarga('Eliminando cliente...');
      
      await ClientesAPI.eliminarCliente(id);
      
      mostrarExito('Cliente eliminado', 'El cliente fue eliminado correctamente');
      
      // Actualizar lista
      await listarClientes(filtrosActivos);
      
      // Limpiar cliente actual si es el mismo
      if (estado.clienteActual?.id === id) {
        setEstado(prev => ({
          ...prev,
          clienteActual: null,
          detalleCliente: null,
        }));
      }
      
      return true;
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error);
      mostrarError('Error al eliminar', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.clienteActual, filtrosActivos, listarClientes, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Buscar cliente por documento
   */
  const buscarPorDocumento = useCallback(async (numeroDocumento: string): Promise<Cliente | null> => {
    try {
      const cliente = await ClientesAPI.buscarPorDocumento(numeroDocumento);
      
      if (cliente) {
        mostrarInfo('Cliente encontrado', `Se encontró el cliente: ${cliente.nombre_completo}`);
      }
      
      return cliente;
    } catch (error: any) {
      console.error('Error al buscar por documento:', error);
      mostrarError('Error en búsqueda', error.message);
      return null;
    }
  }, [mostrarInfo, mostrarError]);

  /**
   * Consultar datos en SUNAT por RUC
   */
  const consultarSunat = useCallback(async (ruc: string): Promise<ResultadoConsulta> => {
    try {
      mostrarCarga('Consultando SUNAT...');
      
      const resultado = await ClientesAPI.consultarSunat(ruc);
      
      if (resultado.encontrado) {
        mostrarExito('Datos encontrados en SUNAT', 'Se obtuvieron los datos de la empresa');
        return {
          exitoso: true,
          datos: {
            razonSocial: resultado.razon_social,
            direccion: resultado.direccion,
            estado: resultado.estado,
            condicion: resultado.condicion,
          }
        };
      } else {
        mostrarAdvertencia('No encontrado', 'No se encontraron datos en SUNAT para este RUC');
        return { exitoso: false, mensaje: 'RUC no encontrado en SUNAT' };
      }
    } catch (error: any) {
      console.error('Error al consultar SUNAT:', error);
      mostrarError('Error en consulta SUNAT', error.message);
      return { exitoso: false, mensaje: error.message };
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarExito, mostrarError, mostrarAdvertencia]);

  /**
   * Consultar datos en RENIEC por DNI
   */
  const consultarReniec = useCallback(async (dni: string): Promise<ResultadoConsulta> => {
    try {
      mostrarCarga('Consultando RENIEC...');
      
      const resultado = await ClientesAPI.consultarReniec(dni);
      
      if (resultado.encontrado) {
        mostrarExito('Datos encontrados en RENIEC', 'Se obtuvieron los datos de la persona');
        return {
          exitoso: true,
          datos: {
            nombres: resultado.nombres,
            apellidoPaterno: resultado.apellido_paterno,
            apellidoMaterno: resultado.apellido_materno,
          }
        };
      } else {
        mostrarAdvertencia('No encontrado', 'No se encontraron datos en RENIEC para este DNI');
        return { exitoso: false, mensaje: 'DNI no encontrado en RENIEC' };
      }
    } catch (error: any) {
      console.error('Error al consultar RENIEC:', error);
      mostrarError('Error en consulta RENIEC', error.message);
      return { exitoso: false, mensaje: error.message };
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarExito, mostrarError, mostrarAdvertencia]);

  /**
   * Autocompletar datos del cliente según el documento
   */
  const autocompletarDatos = useCallback(async (
    numeroDocumento: string,
    tipoDocumento?: TipoDocumentoCliente
  ): Promise<Partial<FormularioCliente>> => {
    if (!configuracion.autoCompletarDatos) {
      return {};
    }

    const tipo = tipoDocumento || detectarTipoDocumento(numeroDocumento);
    
    if (!tipo) return {};

    try {
      let datos: Partial<FormularioCliente> = {};

      if (tipo === '6' && configuracion.consultarSunatAutomatico) {
        // Consultar RUC en SUNAT
        const resultado = await consultarSunat(numeroDocumento);
        if (resultado.exitoso && resultado.datos) {
          datos = {
            razon_social: resultado.datos.razonSocial,
            direccion: resultado.datos.direccion,
            tipo_cliente: 'juridica',
          };
        }
      } else if (tipo === '1' && configuracion.consultarReniecAutomatico) {
        // Consultar DNI en RENIEC
        const resultado = await consultarReniec(numeroDocumento);
        if (resultado.exitoso && resultado.datos) {
          datos = {
            nombres: resultado.datos.nombres,
            apellido_paterno: resultado.datos.apellidoPaterno,
            apellido_materno: resultado.datos.apellidoMaterno,
            tipo_cliente: 'natural',
          };
        }
      }

      return datos;
    } catch (error) {
      console.error('Error en autocompletado:', error);
      return {};
    }
  }, [
    configuracion.autoCompletarDatos,
    configuracion.consultarSunatAutomatico,
    configuracion.consultarReniecAutomatico,
    detectarTipoDocumento,
    consultarSunat,
    consultarReniec
  ]);

  /**
   * Gestión de contactos
   */
  const agregarContacto = useCallback(async (
    clienteId: number, 
    contacto: Omit<ContactoCliente, 'id' | 'cliente_id'>
  ): Promise<ContactoCliente | null> => {
    try {
      mostrarCarga('Agregando contacto...');
      
      const nuevoContacto = await ClientesAPI.agregarContacto(clienteId, contacto);
      
      mostrarExito('Contacto agregado', 'El contacto se agregó correctamente');
      
      // Actualizar cliente actual si corresponde
      if (estado.clienteActual?.id === clienteId) {
        await obtenerCliente(clienteId);
      }
      
      return nuevoContacto;
    } catch (error: any) {
      console.error('Error al agregar contacto:', error);
      mostrarError('Error al agregar contacto', error.message);
      return null;
    } finally {
      ocultarCarga();
    }
  }, [estado.clienteActual, obtenerCliente, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  const actualizarContacto = useCallback(async (
    id: number, 
    contacto: Partial<ContactoCliente>
  ): Promise<boolean> => {
    try {
      mostrarCarga('Actualizando contacto...');
      
      await ClientesAPI.actualizarContacto(id, contacto);
      
      mostrarExito('Contacto actualizado', 'Los cambios se guardaron correctamente');
      
      // Refrescar datos del cliente si está cargado
      if (estado.clienteActual) {
        await obtenerCliente(estado.clienteActual.id);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error al actualizar contacto:', error);
      mostrarError('Error al actualizar contacto', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.clienteActual, obtenerCliente, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  const eliminarContacto = useCallback(async (id: number): Promise<boolean> => {
    try {
      mostrarCarga('Eliminando contacto...');
      
      await ClientesAPI.eliminarContacto(id);
      
      mostrarExito('Contacto eliminado', 'El contacto fue eliminado correctamente');
      
      // Refrescar datos del cliente si está cargado
      if (estado.clienteActual) {
        await obtenerCliente(estado.clienteActual.id);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error al eliminar contacto:', error);
      mostrarError('Error al eliminar contacto', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [estado.clienteActual, obtenerCliente, mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  /**
   * Marcar/desmarcar favorito
   */
  const alternarFavorito = useCallback(async (clienteId: number): Promise<boolean> => {
    try {
      const cliente = estado.clientes.find(c => c.id === clienteId);
      if (!cliente) return false;

      const nuevoEstado = !cliente.favorito;
      
      await ClientesAPI.marcarFavoritosMasivo([clienteId], nuevoEstado);
      
      mostrarInfo(
        nuevoEstado ? 'Marcado como favorito' : 'Desmarcado como favorito',
        `Cliente ${nuevoEstado ? 'agregado a' : 'removido de'} favoritos`
      );
      
      // Actualizar en el estado local
      setEstado(prev => ({
        ...prev,
        clientes: prev.clientes.map(c => 
          c.id === clienteId ? { ...c, favorito: nuevoEstado } : c
        ),
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error al cambiar favorito:', error);
      mostrarError('Error', error.message);
      return false;
    }
  }, [estado.clientes, mostrarInfo, mostrarError]);

  /**
   * Exportar clientes
   */
  const exportarExcel = useCallback(async (filtros: FiltrosClientes = {}): Promise<boolean> => {
    try {
      mostrarCarga('Generando Excel...');
      
      const blob = await ClientesAPI.exportarExcel(filtros);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      mostrarExito('Excel generado', 'El archivo se descargó correctamente');
      
      return true;
    } catch (error: any) {
      console.error('Error al exportar:', error);
      mostrarError('Error en exportación', error.message);
      return false;
    } finally {
      ocultarCarga();
    }
  }, [mostrarCarga, ocultarCarga, mostrarExito, mostrarError]);

  // =======================================================
  // FUNCIONES DE UTILIDADES
  // =======================================================

  /**
   * Limpiar estado de clientes
   */
  const limpiarEstado = useCallback(() => {
    setEstado({
      clientes: [],
      clienteActual: null,
      detalleCliente: null,
      tiposDocumento: estado.tiposDocumento,
      totalClientes: 0,
      paginaActual: 1,
      totalPaginas: 1,
      cargandoClientes: false,
      cargandoCliente: false,
      cargandoTipos: false,
      error: null,
    });
    setFiltrosActivos({});
  }, [estado.tiposDocumento]);

  /**
   * Actualizar configuración
   */
  const actualizarConfiguracion = useCallback((nuevaConfig: Partial<ConfiguracionClientes>) => {
    setConfiguracion(prev => ({ ...prev, ...nuevaConfig }));
  }, []);

  /**
   * Validar formulario de cliente
   */
  const validarFormulario = useCallback((datosCliente: FormularioCliente): { 
    valido: boolean; 
    errores: string[] 
  } => {
    const errores: string[] = [];

    // Validar tipo de documento
    if (!datosCliente.tipo_documento) {
      errores.push('El tipo de documento es requerido');
    }

    // Validar número de documento
    if (!datosCliente.numero_documento) {
      errores.push('El número de documento es requerido');
    } else {
      const validacionDoc = validarDocumentoSegunTipo(
        datosCliente.numero_documento, 
        datosCliente.tipo_documento
      );
      if (!validacionDoc.valido) {
        errores.push(validacionDoc.mensaje || 'Número de documento inválido');
      }
    }

    // Validar nombres según tipo de cliente
    if (datosCliente.tipo_cliente === 'natural') {
      if (!datosCliente.nombres) {
        errores.push('Los nombres son requeridos');
      }
      if (!datosCliente.apellido_paterno) {
        errores.push('El apellido paterno es requerido');
      }
    } else {
      if (!datosCliente.razon_social) {
        errores.push('La razón social es requerida');
      }
    }

    // Validar email
    if (datosCliente.email) {
      const validacionEmail = validarEmail(datosCliente.email);
      if (!validacionEmail.valido) {
        errores.push(validacionEmail.mensaje || 'Email inválido');
      }
    }

    // Validar dirección
    if (!datosCliente.direccion) {
      errores.push('La dirección es requerida');
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }, [validarDocumentoSegunTipo]);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const estadisticas = useMemo(() => {
    const clientes = estado.clientes;
    
    return {
      totalClientes: clientes.length,
      clientesActivos: clientes.filter(c => c.estado === 'activo').length,
      clientesInactivos: clientes.filter(c => c.estado === 'inactivo').length,
      clientesFavoritos: clientes.filter(c => c.favorito).length,
      totalFacturado: clientes.reduce((acc, c) => acc + c.total_facturado, 0),
      promedioFacturado: clientes.length > 0 
        ? clientes.reduce((acc, c) => acc + c.total_facturado, 0) / clientes.length 
        : 0,
    };
  }, [estado.clientes]);

  const clientesFavoritos = useMemo(() => {
    return estado.clientes.filter(cliente => cliente.favorito);
  }, [estado.clientes]);

  const cargando = useMemo(() => ({
    clientes: estado.cargandoClientes || cargandoListaClientes,
    cliente: estado.cargandoCliente || cargandoObtenerCliente,
    tipos: estado.cargandoTipos,
    creando: cargandoCrearCliente,
  }), [
    estado.cargandoClientes,
    estado.cargandoCliente,
    estado.cargandoTipos,
    cargandoListaClientes,
    cargandoObtenerCliente,
    cargandoCrearCliente
  ]);

  // =======================================================
  // RETURN DEL HOOK
  // =======================================================

  return {
    // Estado
    clientes: estado.clientes,
    clienteActual: estado.clienteActual,
    detalleCliente: estado.detalleCliente,
    tiposDocumento: estado.tiposDocumento,
    totalClientes: estado.totalClientes,
    paginaActual: estado.paginaActual,
    totalPaginas: estado.totalPaginas,
    filtrosActivos,
    configuracion,
    estadisticas,
    clientesFavoritos,
    error: estado.error,
    cargando,

    // Funciones principales
    listarClientes,
    crearCliente,
    obtenerCliente,
    actualizarCliente,
    eliminarCliente,
    buscarPorDocumento,
    consultarSunat,
    consultarReniec,
    autocompletarDatos,

    // Gestión de contactos
    agregarContacto,
    actualizarContacto,
    eliminarContacto,

    // Utilidades
    alternarFavorito,
    exportarExcel,
    limpiarEstado,
    actualizarConfiguracion,
    validarFormulario,
    detectarTipoDocumento,
    validarDocumentoSegunTipo,
    cargarDatosIniciales,

    // Formatters útiles
    formatearDocumento: (doc: string, tipo: TipoDocumentoCliente) => formatearDocumento(doc, tipo),
    formatearTelefono: (tel: string) => formatearTelefono(tel),
  };
};

export default useClientes;