/**
 * Hook useApiBusqueda - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Hook para búsqueda global integrada con BuscadorGeneral
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useApi } from './useApi';
import { useNotificaciones } from '../componentes/comunes/Notificaciones';
import FacturacionAPI from '../servicios/facturacionAPI';
import ClientesAPI from '../servicios/clientesAPI';
import ProductosAPI from '../servicios/productosAPI';
import InventarioAPI from '../servicios/inventarioAPI';
import UsuariosAPI from '../servicios/usuariosAPI';
import { ParametrosBusqueda } from '../types/common';

// =======================================================
// INTERFACES Y TIPOS
// =======================================================

export interface ResultadoBusqueda {
  id: number | string;
  tipo: TipoResultado;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  icono?: string;
  imagen?: string;
  url?: string;
  datos?: any;
  relevancia?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export type TipoResultado = 
  | 'cliente' 
  | 'producto' 
  | 'factura' 
  | 'boleta' 
  | 'nota_credito' 
  | 'nota_debito'
  | 'movimiento'
  | 'usuario'
  | 'almacen'
  | 'categoria';

export interface CategoriaBusqueda {
  id: TipoResultado;
  nombre: string;
  icono: string;
  color: string;
  habilitada: boolean;
  prioridad: number;
}

export interface FiltrosBusqueda {
  categorias?: TipoResultado[];
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  usuario?: number;
  almacen?: number;
  limite?: number;
  incluirInactivos?: boolean;
}

export interface ConfiguracionBusqueda {
  busquedaMinima: number;
  delayBusqueda: number;
  limitePorDefecto: number;
  buscarEnTiempoReal: boolean;
  mostrarSugerencias: boolean;
  guardarHistorial: boolean;
  categoriasHabilitadas: TipoResultado[];
  ordenarPorRelevancia: boolean;
}

export interface EstadoBusqueda {
  termino: string;
  resultados: ResultadoBusqueda[];
  categorias: CategoriaBusqueda[];
  historial: string[];
  sugerencias: string[];
  cargando: boolean;
  error: string | null;
  tieneResultados: boolean;
  totalResultados: number;
  ultimaBusqueda: string;
  filtrosActivos: FiltrosBusqueda;
}

export interface ResultadoCategoria {
  categoria: CategoriaBusqueda;
  resultados: ResultadoBusqueda[];
  total: number;
  cargando: boolean;
}

// =======================================================
// CONFIGURACIÓN POR DEFECTO
// =======================================================

const CONFIGURACION_DEFAULT: ConfiguracionBusqueda = {
  busquedaMinima: 2,
  delayBusqueda: 300,
  limitePorDefecto: 20,
  buscarEnTiempoReal: true,
  mostrarSugerencias: true,
  guardarHistorial: true,
  categoriasHabilitadas: ['cliente', 'producto', 'factura', 'boleta', 'movimiento'],
  ordenarPorRelevancia: true,
};

const CATEGORIAS_DEFAULT: CategoriaBusqueda[] = [
  {
    id: 'cliente',
    nombre: 'Clientes',
    icono: '👥',
    color: 'blue',
    habilitada: true,
    prioridad: 1,
  },
  {
    id: 'producto',
    nombre: 'Productos',
    icono: '📦',
    color: 'green',
    habilitada: true,
    prioridad: 2,
  },
  {
    id: 'factura',
    nombre: 'Facturas',
    icono: '🧾',
    color: 'purple',
    habilitada: true,
    prioridad: 3,
  },
  {
    id: 'boleta',
    nombre: 'Boletas',
    icono: '🧾',
    color: 'orange',
    habilitada: true,
    prioridad: 4,
  },
  {
    id: 'movimiento',
    nombre: 'Movimientos',
    icono: '📊',
    color: 'teal',
    habilitada: true,
    prioridad: 5,
  },
  {
    id: 'usuario',
    nombre: 'Usuarios',
    icono: '👤',
    color: 'indigo',
    habilitada: false,
    prioridad: 6,
  },
];

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export const useApiBusqueda = (configuracion?: Partial<ConfiguracionBusqueda>) => {
  // =======================================================
  // CONFIGURACIÓN
  // =======================================================

  const config = useMemo(() => ({
    ...CONFIGURACION_DEFAULT,
    ...configuracion,
  }), [configuracion]);

  // =======================================================
  // ESTADO LOCAL
  // =======================================================

  const [estado, setEstado] = useState<EstadoBusqueda>({
    termino: '',
    resultados: [],
    categorias: CATEGORIAS_DEFAULT.filter(c => 
      config.categoriasHabilitadas.includes(c.id)
    ),
    historial: [],
    sugerencias: [],
    cargando: false,
    error: null,
    tieneResultados: false,
    totalResultados: 0,
    ultimaBusqueda: '',
    filtrosActivos: {},
  });

  // =======================================================
  // REFS Y TIMERS
  // =======================================================

  const timeoutBusqueda = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const cacheBusqueda = useRef<Map<string, ResultadoBusqueda[]>>(new Map());

  // =======================================================
  // HOOKS EXTERNOS
  // =======================================================

  const { mostrarError } = useNotificaciones();

  // =======================================================
  // EFECTOS
  // =======================================================

  // Cargar historial desde localStorage al inicio
  useEffect(() => {
    if (config.guardarHistorial) {
      try {
        const historialGuardado = localStorage.getItem('felicitafac_historial_busqueda');
        if (historialGuardado) {
          const historial = JSON.parse(historialGuardado);
          setEstado(prev => ({ ...prev, historial }));
        }
      } catch (error) {
        console.error('Error al cargar historial de búsqueda:', error);
      }
    }
  }, [config.guardarHistorial]);

  // Guardar historial en localStorage cuando cambie
  useEffect(() => {
    if (config.guardarHistorial && estado.historial.length > 0) {
      try {
        localStorage.setItem('felicitafac_historial_busqueda', JSON.stringify(estado.historial));
      } catch (error) {
        console.error('Error al guardar historial de búsqueda:', error);
      }
    }
  }, [estado.historial, config.guardarHistorial]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutBusqueda.current) {
        clearTimeout(timeoutBusqueda.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  const generarClaveCache = useCallback((termino: string, filtros: FiltrosBusqueda): string => {
    return `${termino}:${JSON.stringify(filtros)}`;
  }, []);

  const obtenerDelCache = useCallback((termino: string, filtros: FiltrosBusqueda): ResultadoBusqueda[] | null => {
    const clave = generarClaveCache(termino, filtros);
    return cacheBusqueda.current.get(clave) || null;
  }, [generarClaveCache]);

  const guardarEnCache = useCallback((termino: string, filtros: FiltrosBusqueda, resultados: ResultadoBusqueda[]) => {
    const clave = generarClaveCache(termino, filtros);
    cacheBusqueda.current.set(clave, resultados);
    
    // Limpiar cache viejo si hay más de 50 entradas
    if (cacheBusqueda.current.size > 50) {
      const primerasClave = cacheBusqueda.current.keys().next().value;
      cacheBusqueda.current.delete(primerasClave);
    }
  }, [generarClaveCache]);

  const agregarAlHistorial = useCallback((termino: string) => {
    if (!config.guardarHistorial || termino.length < config.busquedaMinima) return;

    setEstado(prev => {
      const nuevoHistorial = [
        termino,
        ...prev.historial.filter(h => h !== termino)
      ].slice(0, 10); // Mantener solo los últimos 10

      return {
        ...prev,
        historial: nuevoHistorial,
      };
    });
  }, [config.guardarHistorial, config.busquedaMinima]);

  const calcularRelevancia = useCallback((resultado: any, termino: string): number => {
    let puntuacion = 0;
    const terminoLower = termino.toLowerCase();

    // Coincidencia exacta en título
    if (resultado.titulo?.toLowerCase() === terminoLower) {
      puntuacion += 100;
    }

    // Coincidencia al inicio del título
    if (resultado.titulo?.toLowerCase().startsWith(terminoLower)) {
      puntuacion += 50;
    }

    // Coincidencia en el título
    if (resultado.titulo?.toLowerCase().includes(terminoLower)) {
      puntuacion += 25;
    }

    // Coincidencia en subtítulo o descripción
    if (resultado.subtitulo?.toLowerCase().includes(terminoLower) ||
        resultado.descripcion?.toLowerCase().includes(terminoLower)) {
      puntuacion += 10;
    }

    // Bonificación por tipo de resultado (más relevantes primero)
    const bonificacionesTipo: Record<string, number> = {
      cliente: 5,
      producto: 4,
      factura: 3,
      boleta: 3,
      movimiento: 2,
      usuario: 1,
    };

    puntuacion += bonificacionesTipo[resultado.tipo] || 0;

    return puntuacion;
  }, []);

  // =======================================================
  // FUNCIONES DE BÚSQUEDA POR CATEGORÍA
  // =======================================================

  const buscarClientes = useCallback(async (termino: string, filtros: FiltrosBusqueda): Promise<ResultadoBusqueda[]> => {
    try {
      const clientes = await ClientesAPI.buscarClientes({
        termino,
        limite: filtros.limite || config.limitePorDefecto,
      });

      return clientes.map(cliente => ({
        id: cliente.id,
        tipo: 'cliente' as TipoResultado,
        titulo: cliente.nombre_completo,
        subtitulo: `${cliente.tipo_documento}: ${cliente.numero_documento}`,
        descripcion: cliente.direccion,
        icono: '👤',
        url: `/admin/clientes/${cliente.id}`,
        datos: cliente,
        relevancia: calcularRelevancia(cliente, termino),
        fechaCreacion: cliente.fecha_creacion,
      }));
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      return [];
    }
  }, [config.limitePorDefecto, calcularRelevancia]);

  const buscarProductos = useCallback(async (termino: string, filtros: FiltrosBusqueda): Promise<ResultadoBusqueda[]> => {
    try {
      const productos = await ProductosAPI.buscarProductos({
        termino,
        limite: filtros.limite || config.limitePorDefecto,
      });

      return productos.map(producto => ({
        id: producto.id,
        tipo: 'producto' as TipoResultado,
        titulo: producto.nombre,
        subtitulo: `Código: ${producto.codigo}`,
        descripcion: `Stock: ${producto.stock_actual} | Precio: S/ ${producto.precio_venta}`,
        icono: '📦',
        imagen: producto.imagen_url,
        url: `/admin/productos/${producto.id}`,
        datos: producto,
        relevancia: calcularRelevancia(producto, termino),
        fechaCreacion: producto.fecha_creacion,
      }));
    } catch (error) {
      console.error('Error al buscar productos:', error);
      return [];
    }
  }, [config.limitePorDefecto, calcularRelevancia]);

  const buscarFacturas = useCallback(async (termino: string, filtros: FiltrosBusqueda): Promise<ResultadoBusqueda[]> => {
    try {
      const facturas = await FacturacionAPI.buscarFacturas({
        termino,
        limite: filtros.limite || config.limitePorDefecto,
      });

      return facturas.map(factura => ({
        id: factura.id,
        tipo: factura.tipo_documento === 'factura' ? 'factura' : 'boleta' as TipoResultado,
        titulo: factura.numero_completo,
        subtitulo: factura.cliente.nombre_o_razon_social,
        descripcion: `Total: S/ ${factura.total} | Estado: ${factura.estado}`,
        icono: factura.tipo_documento === 'factura' ? '🧾' : '🧾',
        url: `/admin/facturacion/${factura.id}`,
        datos: factura,
        relevancia: calcularRelevancia(factura, termino),
        fechaCreacion: factura.created_at,
      }));
    } catch (error) {
      console.error('Error al buscar facturas:', error);
      return [];
    }
  }, [config.limitePorDefecto, calcularRelevancia]);

  const buscarMovimientos = useCallback(async (termino: string, filtros: FiltrosBusqueda): Promise<ResultadoBusqueda[]> => {
    try {
      const movimientos = await InventarioAPI.buscarMovimientos({
        termino,
        limite: filtros.limite || config.limitePorDefecto,
      });

      return movimientos.map(movimiento => ({
        id: movimiento.id,
        tipo: 'movimiento' as TipoResultado,
        titulo: movimiento.numero_documento,
        subtitulo: `${movimiento.tipo_movimiento_nombre} - ${movimiento.almacen_nombre}`,
        descripcion: `Fecha: ${movimiento.fecha_movimiento} | Estado: ${movimiento.estado}`,
        icono: '📊',
        url: `/admin/inventario/movimientos/${movimiento.id}`,
        datos: movimiento,
        relevancia: calcularRelevancia(movimiento, termino),
        fechaCreacion: movimiento.fecha_creacion,
      }));
    } catch (error) {
      console.error('Error al buscar movimientos:', error);
      return [];
    }
  }, [config.limitePorDefecto, calcularRelevancia]);

  const buscarUsuarios = useCallback(async (termino: string, filtros: FiltrosBusqueda): Promise<ResultadoBusqueda[]> => {
    try {
      const usuarios = await UsuariosAPI.buscarUsuarios({
        termino,
        limite: filtros.limite || config.limitePorDefecto,
      });

      return usuarios.map(usuario => ({
        id: usuario.id,
        tipo: 'usuario' as TipoResultado,
        titulo: usuario.nombre_completo,
        subtitulo: `${usuario.email} - ${usuario.rol}`,
        descripcion: `Estado: ${usuario.estado_usuario} | Último login: ${usuario.ultimo_login || 'Nunca'}`,
        icono: '👤',
        url: `/admin/usuarios/${usuario.id}`,
        datos: usuario,
        relevancia: calcularRelevancia(usuario, termino),
        fechaCreacion: usuario.fecha_creacion,
      }));
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      return [];
    }
  }, [config.limitePorDefecto, calcularRelevancia]);

  // =======================================================
  // FUNCIÓN PRINCIPAL DE BÚSQUEDA
  // =======================================================

  const ejecutarBusqueda = useCallback(async (
    termino: string, 
    filtros: FiltrosBusqueda = {},
    forzar: boolean = false
  ): Promise<ResultadoBusqueda[]> => {
    // Validar término mínimo
    if (termino.trim().length < config.busquedaMinima) {
      setEstado(prev => ({
        ...prev,
        resultados: [],
        tieneResultados: false,
        totalResultados: 0,
        error: null,
      }));
      return [];
    }

    // Verificar cache
    if (!forzar) {
      const resultadosCache = obtenerDelCache(termino, filtros);
      if (resultadosCache) {
        setEstado(prev => ({
          ...prev,
          resultados: resultadosCache,
          tieneResultados: resultadosCache.length > 0,
          totalResultados: resultadosCache.length,
          error: null,
        }));
        return resultadosCache;
      }
    }

    // Cancelar búsqueda anterior
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setEstado(prev => ({
      ...prev,
      cargando: true,
      error: null,
      ultimaBusqueda: termino,
      filtrosActivos: filtros,
    }));

    try {
      const categoriasABuscar = filtros.categorias || estado.categorias
        .filter(c => c.habilitada)
        .map(c => c.id);

      const promesasBusqueda: Promise<ResultadoBusqueda[]>[] = [];

      // Ejecutar búsquedas en paralelo
      if (categoriasABuscar.includes('cliente')) {
        promesasBusqueda.push(buscarClientes(termino, filtros));
      }
      if (categoriasABuscar.includes('producto')) {
        promesasBusqueda.push(buscarProductos(termino, filtros));
      }
      if (categoriasABuscar.includes('factura') || categoriasABuscar.includes('boleta')) {
        promesasBusqueda.push(buscarFacturas(termino, filtros));
      }
      if (categoriasABuscar.includes('movimiento')) {
        promesasBusqueda.push(buscarMovimientos(termino, filtros));
      }
      if (categoriasABuscar.includes('usuario')) {
        promesasBusqueda.push(buscarUsuarios(termino, filtros));
      }

      const resultadosPorCategoria = await Promise.all(promesasBusqueda);
      const todosLosResultados = resultadosPorCategoria.flat();

      // Ordenar por relevancia si está habilitado
      if (config.ordenarPorRelevancia) {
        todosLosResultados.sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0));
      }

      // Limitar resultados
      const resultadosLimitados = todosLosResultados.slice(0, filtros.limite || config.limitePorDefecto);

      // Guardar en cache
      guardarEnCache(termino, filtros, resultadosLimitados);

      // Agregar al historial
      agregarAlHistorial(termino);

      setEstado(prev => ({
        ...prev,
        resultados: resultadosLimitados,
        tieneResultados: resultadosLimitados.length > 0,
        totalResultados: todosLosResultados.length,
        cargando: false,
        error: null,
      }));

      return resultadosLimitados;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Búsqueda cancelada, no hacer nada
        return [];
      }

      console.error('Error en búsqueda:', error);
      
      setEstado(prev => ({
        ...prev,
        cargando: false,
        error: error.message || 'Error en la búsqueda',
        resultados: [],
        tieneResultados: false,
        totalResultados: 0,
      }));

      mostrarError('Error en búsqueda', error.message || 'Ocurrió un error al realizar la búsqueda');
      return [];
    }
  }, [
    config.busquedaMinima,
    config.limitePorDefecto,
    config.ordenarPorRelevancia,
    estado.categorias,
    obtenerDelCache,
    guardarEnCache,
    agregarAlHistorial,
    buscarClientes,
    buscarProductos,
    buscarFacturas,
    buscarMovimientos,
    buscarUsuarios,
    mostrarError
  ]);

  // =======================================================
  // FUNCIONES PRINCIPALES
  // =======================================================

  const buscar = useCallback((termino: string, filtros?: FiltrosBusqueda) => {
    setEstado(prev => ({ ...prev, termino }));

    // Limpiar timeout anterior
    if (timeoutBusqueda.current) {
      clearTimeout(timeoutBusqueda.current);
    }

    // Buscar inmediatamente o con delay
    if (config.buscarEnTiempoReal) {
      timeoutBusqueda.current = setTimeout(() => {
        ejecutarBusqueda(termino, filtros);
      }, config.delayBusqueda);
    }
  }, [config.buscarEnTiempoReal, config.delayBusqueda, ejecutarBusqueda]);

  const buscarInmediatamente = useCallback((termino: string, filtros?: FiltrosBusqueda) => {
    setEstado(prev => ({ ...prev, termino }));
    return ejecutarBusqueda(termino, filtros, true);
  }, [ejecutarBusqueda]);

  const limpiarBusqueda = useCallback(() => {
    if (timeoutBusqueda.current) {
      clearTimeout(timeoutBusqueda.current);
    }
    if (abortController.current) {
      abortController.current.abort();
    }

    setEstado(prev => ({
      ...prev,
      termino: '',
      resultados: [],
      tieneResultados: false,
      totalResultados: 0,
      cargando: false,
      error: null,
      filtrosActivos: {},
    }));
  }, []);

  const aplicarFiltros = useCallback((filtros: FiltrosBusqueda) => {
    if (estado.termino) {
      ejecutarBusqueda(estado.termino, filtros);
    }
  }, [estado.termino, ejecutarBusqueda]);

  const alternarCategoria = useCallback((categoriaId: TipoResultado) => {
    setEstado(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat =>
        cat.id === categoriaId
          ? { ...cat, habilitada: !cat.habilitada }
          : cat
      ),
    }));
  }, []);

  const limpiarHistorial = useCallback(() => {
    setEstado(prev => ({ ...prev, historial: [] }));
    if (config.guardarHistorial) {
      localStorage.removeItem('felicitafac_historial_busqueda');
    }
  }, [config.guardarHistorial]);

  const limpiarCache = useCallback(() => {
    cacheBusqueda.current.clear();
  }, []);

  // =======================================================
  // VALORES COMPUTADOS
  // =======================================================

  const resultadosPorCategoria = useMemo((): ResultadoCategoria[] => {
    return estado.categorias.map(categoria => {
      const resultadosCategoria = estado.resultados.filter(r => r.tipo === categoria.id);
      
      return {
        categoria,
        resultados: resultadosCategoria,
        total: resultadosCategoria.length,
        cargando: estado.cargando,
      };
    }).filter(rc => rc.total > 0 || rc.cargando);
  }, [estado.categorias, estado.resultados, estado.cargando]);

  const estadisticas = useMemo(() => ({
    totalResultados: estado.totalResultados,
    resultadosMostrados: estado.resultados.length,
    categoriaConMasResultados: resultadosPorCategoria.reduce(
      (max, actual) => actual.total > max.total ? actual : max,
      { total: 0, categoria: { nombre: 'Ninguna' } }
    ).categoria.nombre,
    tiempoUltimaBusqueda: estado.ultimaBusqueda ? new Date().toISOString() : null,
  }), [estado.totalResultados, estado.resultados.length, estado.ultimaBusqueda, resultadosPorCategoria]);

  // =======================================================
  // RETURN DEL HOOK
  // =======================================================

  return {
    // Estado
    termino: estado.termino,
    resultados: estado.resultados,
    categorias: estado.categorias,
    historial: estado.historial,
    sugerencias: estado.sugerencias,
    cargando: estado.cargando,
    error: estado.error,
    tieneResultados: estado.tieneResultados,
    totalResultados: estado.totalResultados,
    ultimaBusqueda: estado.ultimaBusqueda,
    filtrosActivos: estado.filtrosActivos,

    // Resultados organizados
    resultadosPorCategoria,
    estadisticas,

    // Configuración
    configuracion: config,

    // Funciones principales
    buscar,
    buscarInmediatamente,
    limpiarBusqueda,
    aplicarFiltros,
    alternarCategoria,

    // Utilidades
    limpiarHistorial,
    limpiarCache,
  };
};

export default useApiBusqueda;