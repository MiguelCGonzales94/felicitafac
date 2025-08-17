/**
 * Buscador General - FELICITAFAC (CORREGIDO)
 * Sistema de Facturación Electrónica para Perú
 * Búsqueda global con múltiples fuentes y resultados categorizados
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Clock, TrendingUp, FileText, Users, Package, 
  Calculator, Settings, ChevronRight, Loader
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useApiGet } from '../../hooks/useApi';
import { Input } from '../ui/input';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface ResultadoBusqueda {
  id: string;
  tipo: TipoResultado;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  ruta?: string;
  accion?: () => void;
  relevancia: number;
  fechaUltimaInteraccion?: Date;
  metadatos?: Record<string, any>;
}

export type TipoResultado = 
  | 'cliente' 
  | 'producto' 
  | 'factura' 
  | 'usuario' 
  | 'configuracion' 
  | 'reporte' 
  | 'accion'
  | 'documento';

export interface ConfiguracionBusqueda {
  mostrarSugerencias: boolean;
  mostrarHistorial: boolean;
  mostrarAccionesRapidas: boolean;
  maxResultados: number;
  retrasoBusqueda: number;
  categoriasHabilitadas: TipoResultado[];
}

export interface PropiedadesBuscadorGeneral {
  placeholder?: string;
  className?: string;
  onResultadoSeleccionado?: (resultado: ResultadoBusqueda) => void;
  configuracion?: Partial<ConfiguracionBusqueda>;
  modalFijo?: boolean;
  abiertoPorDefecto?: boolean;
}

// Interfaces para respuestas de API
interface ClienteRespuesta {
  id: number;
  razon_social: string;
  tipo_documento: string;
  numero_documento: string;
  email?: string;
  telefono?: string;
  relevancia?: number;
}

interface ProductoRespuesta {
  id: number;
  nombre: string;
  codigo: string;
  stock_actual: number;
  precio_venta: number;
  relevancia?: number;
}

interface DocumentoRespuesta {
  id: number;
  tipo_documento: string;
  serie: string;
  numero: string;
  cliente_nombre: string;
  total: number;
  fecha_emision: string;
  relevancia?: number;
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const CONFIGURACION_DEFECTO: ConfiguracionBusqueda = {
  mostrarSugerencias: true,
  mostrarHistorial: true,
  mostrarAccionesRapidas: true,
  maxResultados: 10,
  retrasoBusqueda: 300,
  categoriasHabilitadas: ['cliente', 'producto', 'factura', 'usuario', 'configuracion', 'reporte', 'accion']
};

const ICONOS_TIPO: Record<TipoResultado, React.ReactNode> = {
  cliente: <Users className="h-4 w-4" />,
  producto: <Package className="h-4 w-4" />,
  factura: <FileText className="h-4 w-4" />,
  usuario: <Users className="h-4 w-4" />,
  configuracion: <Settings className="h-4 w-4" />,
  reporte: <Calculator className="h-4 w-4" />,
  accion: <TrendingUp className="h-4 w-4" />,
  documento: <FileText className="h-4 w-4" />
};

const COLORES_TIPO: Record<TipoResultado, string> = {
  cliente: 'text-blue-600',
  producto: 'text-green-600',
  factura: 'text-purple-600',
  usuario: 'text-orange-600',
  configuracion: 'text-gray-600',
  reporte: 'text-indigo-600',
  accion: 'text-red-600',
  documento: 'text-teal-600'
};

const ACCIONES_RAPIDAS: ResultadoBusqueda[] = [
  {
    id: 'nueva-factura',
    tipo: 'accion',
    titulo: 'Nueva Factura',
    descripcion: 'Crear una nueva factura electrónica',
    ruta: '/admin/facturacion/nueva',
    relevancia: 100
  },
  {
    id: 'nuevo-cliente',
    tipo: 'accion',
    titulo: 'Nuevo Cliente',
    descripcion: 'Registrar un nuevo cliente',
    ruta: '/admin/clientes/nuevo',
    relevancia: 90
  },
  {
    id: 'nuevo-producto',
    tipo: 'accion',
    titulo: 'Nuevo Producto',
    descripcion: 'Agregar un nuevo producto',
    ruta: '/admin/productos/nuevo',
    relevancia: 85
  },
  {
    id: 'punto-venta',
    tipo: 'accion',
    titulo: 'Punto de Venta',
    descripcion: 'Ir al punto de venta',
    ruta: '/pos',
    relevancia: 95
  },
  {
    id: 'reportes-ventas',
    tipo: 'reporte',
    titulo: 'Reportes de Ventas',
    descripcion: 'Ver reportes de ventas',
    ruta: '/admin/reportes/ventas',
    relevancia: 80
  }
];

// =======================================================
// UTILIDAD DEBOUNCE
// =======================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// =======================================================
// HOOK PERSONALIZADO PARA BÚSQUEDA
// =======================================================

const useBusquedaGlobal = (termino: string, configuracion: ConfiguracionBusqueda) => {
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([]);
  const [cargando, setCargando] = useState(false);
  const [historialBusquedas, setHistorialBusquedas] = useState<string[]>([]);
  
  // Debounce del término de búsqueda
  const terminoDebounced = useDebounce(termino, configuracion.retrasoBusqueda);

  // Hooks de API para diferentes endpoints
  const {
    data: clientesData,
    loading: cargandoClientes,
    ejecutar: buscarClientes
  } = useApiGet<ClienteRespuesta[]>('', {}, { ejecutarInmediatamente: false });

  const {
    data: productosData,
    loading: cargandoProductos,
    ejecutar: buscarProductos
  } = useApiGet<ProductoRespuesta[]>('', {}, { ejecutarInmediatamente: false });

  const {
    data: documentosData,
    loading: cargandoDocumentos,
    ejecutar: buscarDocumentos
  } = useApiGet<DocumentoRespuesta[]>('', {}, { ejecutarInmediatamente: false });

  // Función de búsqueda principal
  const buscar = useCallback(async (terminoBusqueda: string) => {
    if (!terminoBusqueda.trim()) {
      setResultados([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    
    try {
      const promesasBusqueda: Promise<ResultadoBusqueda[]>[] = [];

      // Buscar clientes
      if (configuracion.categoriasHabilitadas.includes('cliente')) {
        const promesaClientes = buscarClientes(`/clientes/buscar/?q=${encodeURIComponent(terminoBusqueda)}&limit=3`)
          .then(() => {
            return (clientesData || []).map((cliente): ResultadoBusqueda => ({
              id: `cliente-${cliente.id}`,
              tipo: 'cliente',
              titulo: cliente.razon_social,
              subtitulo: `${cliente.tipo_documento} ${cliente.numero_documento}`,
              descripcion: cliente.email || cliente.telefono || '',
              ruta: `/admin/clientes/${cliente.id}`,
              relevancia: cliente.relevancia || 75,
              metadatos: { ...cliente }
            }));
          })
          .catch(() => []);
        
        promesasBusqueda.push(promesaClientes);
      }

      // Buscar productos
      if (configuracion.categoriasHabilitadas.includes('producto')) {
        const promesaProductos = buscarProductos(`/productos/buscar/?q=${encodeURIComponent(terminoBusqueda)}&limit=3`)
          .then(() => {
            return (productosData || []).map((producto): ResultadoBusqueda => ({
              id: `producto-${producto.id}`,
              tipo: 'producto',
              titulo: producto.nombre,
              subtitulo: `Código: ${producto.codigo}`,
              descripcion: `Stock: ${producto.stock_actual} | Precio: S/ ${producto.precio_venta}`,
              ruta: `/admin/productos/${producto.id}`,
              relevancia: producto.relevancia || 70,
              metadatos: { ...producto }
            }));
          })
          .catch(() => []);
        
        promesasBusqueda.push(promesaProductos);
      }

      // Buscar documentos
      if (configuracion.categoriasHabilitadas.includes('factura')) {
        const promesaDocumentos = buscarDocumentos(`/facturacion/buscar/?q=${encodeURIComponent(terminoBusqueda)}&limit=3`)
          .then(() => {
            return (documentosData || []).map((documento): ResultadoBusqueda => ({
              id: `documento-${documento.id}`,
              tipo: 'factura',
              titulo: `${documento.tipo_documento} ${documento.serie}-${documento.numero}`,
              subtitulo: documento.cliente_nombre,
              descripcion: `Total: S/ ${documento.total} | ${documento.fecha_emision}`,
              ruta: `/admin/facturacion/${documento.id}`,
              relevancia: documento.relevancia || 85,
              metadatos: { ...documento }
            }));
          })
          .catch(() => []);
        
        promesasBusqueda.push(promesaDocumentos);
      }

      const resultadosBusqueda = await Promise.all(promesasBusqueda);
      const todosResultados = resultadosBusqueda.flat();

      // Agregar acciones rápidas si coinciden
      const accionesCoincidentes = ACCIONES_RAPIDAS.filter(accion =>
        accion.titulo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        accion.descripcion?.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );

      const resultadosFinales = [
        ...accionesCoincidentes,
        ...todosResultados
      ]
        .sort((a, b) => b.relevancia - a.relevancia)
        .slice(0, configuracion.maxResultados);

      setResultados(resultadosFinales);
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      setResultados([]);
    } finally {
      setCargando(false);
    }
  }, [
    configuracion,
    buscarClientes,
    buscarProductos,
    buscarDocumentos,
    clientesData,
    productosData,
    documentosData
  ]);

  // Ejecutar búsqueda cuando cambie el término debounced
  useEffect(() => {
    buscar(terminoDebounced);
  }, [terminoDebounced, buscar]);

  // Determinar estado de carga
  const cargandoGlobal = cargando || cargandoClientes || cargandoProductos || cargandoDocumentos;

  // Guardar en historial
  const guardarEnHistorial = useCallback((termino: string) => {
    if (termino.trim()) {
      setHistorialBusquedas(prev => {
        const nuevo = [termino, ...prev.filter(t => t !== termino)].slice(0, 10);
        try {
          localStorage.setItem('felicitafac_historial_busquedas', JSON.stringify(nuevo));
        } catch (error) {
          console.error('Error guardando historial:', error);
        }
        return nuevo;
      });
    }
  }, []);

  // Cargar historial al iniciar
  useEffect(() => {
    try {
      const historialGuardado = localStorage.getItem('felicitafac_historial_busquedas');
      if (historialGuardado) {
        setHistorialBusquedas(JSON.parse(historialGuardado));
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  }, []);

  return {
    resultados,
    cargando: cargandoGlobal,
    historialBusquedas,
    guardarEnHistorial
  };
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const BuscadorGeneral: React.FC<PropiedadesBuscadorGeneral> = ({
  placeholder = "Buscar clientes, productos, facturas...",
  className,
  onResultadoSeleccionado,
  configuracion: configuracionProp,
  modalFijo = false,
  abiertoPorDefecto = false
}) => {
  // Estados
  const [termino, setTermino] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(abiertoPorDefecto);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  
  // Referencias
  const inputRef = useRef<HTMLInputElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const navigate = useNavigate();
  const configuracion = useMemo(() => ({
    ...CONFIGURACION_DEFECTO,
    ...configuracionProp
  }), [configuracionProp]);
  
  const { resultados, cargando, historialBusquedas, guardarEnHistorial } = useBusquedaGlobal(termino, configuracion);

  // Función para manejar selección de resultado
  const manejarSeleccionResultado = useCallback((resultado: ResultadoBusqueda) => {
    guardarEnHistorial(termino);
    setMostrarResultados(false);
    setTermino('');
    
    if (onResultadoSeleccionado) {
      onResultadoSeleccionado(resultado);
    } else if (resultado.ruta) {
      navigate(resultado.ruta);
    } else if (resultado.accion) {
      resultado.accion();
    }
  }, [termino, guardarEnHistorial, onResultadoSeleccionado, navigate]);

  // Manejo de teclado
  const manejarTeclado = useCallback((e: React.KeyboardEvent) => {
    if (!mostrarResultados) return;
    
    const resultadosVisibles = termino ? resultados : (configuracion.mostrarAccionesRapidas ? ACCIONES_RAPIDAS.slice(0, 5) : []);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndiceSeleccionado(prev => 
          prev < resultadosVisibles.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndiceSeleccionado(prev => 
          prev > 0 ? prev - 1 : resultadosVisibles.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (indiceSeleccionado >= 0 && resultadosVisibles[indiceSeleccionado]) {
          manejarSeleccionResultado(resultadosVisibles[indiceSeleccionado]);
        }
        break;
      case 'Escape':
        setMostrarResultados(false);
        inputRef.current?.blur();
        break;
    }
  }, [mostrarResultados, termino, resultados, configuracion.mostrarAccionesRapidas, indiceSeleccionado, manejarSeleccionResultado]);

  // Click fuera para cerrar
  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
        setMostrarResultados(false);
      }
    };

    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  // Resultados a mostrar según el contexto
  const resultadosParaMostrar = useMemo(() => {
    if (termino) {
      return resultados;
    } else if (configuracion.mostrarAccionesRapidas) {
      return ACCIONES_RAPIDAS.slice(0, 5);
    }
    return [];
  }, [termino, resultados, configuracion.mostrarAccionesRapidas]);

  // Renderizar resultado individual
  const renderizarResultado = (resultado: ResultadoBusqueda, indice: number) => (
    <button
      key={resultado.id}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-colors group",
        "flex items-center space-x-3 hover:bg-gray-50",
        indice === indiceSeleccionado && "bg-blue-50 border-blue-200"
      )}
      onClick={() => manejarSeleccionResultado(resultado)}
    >
      <div className={cn("flex-shrink-0", COLORES_TIPO[resultado.tipo])}>
        {ICONOS_TIPO[resultado.tipo]}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {resultado.titulo}
          </h4>
          <span className="text-xs text-gray-400 capitalize">
            {resultado.tipo}
          </span>
        </div>
        
        {resultado.subtitulo && (
          <p className="text-xs text-gray-600 truncate">
            {resultado.subtitulo}
          </p>
        )}
        
        {resultado.descripcion && (
          <p className="text-xs text-gray-500 truncate">
            {resultado.descripcion}
          </p>
        )}
      </div>
      
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
    </button>
  );

  return (
    <div ref={contenedorRef} className={cn("relative", className)}>
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onFocus={() => setMostrarResultados(true)}
          onKeyDown={manejarTeclado}
          className="pl-10 pr-10"
        />
        
        {termino && (
          <button
            onClick={() => {
              setTermino('');
              setMostrarResultados(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
        
        {cargando && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Resultados */}
      {mostrarResultados && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50",
          modalFijo ? "fixed top-16 left-4 right-4 max-w-2xl mx-auto" : "max-h-96 overflow-y-auto"
        )}>
          {/* Header con estadísticas */}
          {termino && (
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} para "{termino}"
                </span>
                {cargando && <span>Buscando...</span>}
              </div>
            </div>
          )}
          
          {/* Lista de resultados */}
          <div className="p-2">
            {resultadosParaMostrar.length > 0 ? (
              <div className="space-y-1">
                {!termino && configuracion.mostrarAccionesRapidas && (
                  <div className="px-2 py-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Acciones Rápidas
                    </h3>
                  </div>
                )}
                
                {resultadosParaMostrar.map((resultado, indice) => 
                  renderizarResultado(resultado, indice)
                )}
              </div>
            ) : termino ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No se encontraron resultados para "{termino}"</p>
                <p className="text-xs mt-1">Intenta con otros términos de búsqueda</p>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Escribe para buscar...</p>
              </div>
            )}
          </div>
          
          {/* Historial de búsquedas */}
          {configuracion.mostrarHistorial && historialBusquedas.length > 0 && !termino && (
            <div className="border-t border-gray-100 p-2">
              <div className="px-2 py-1 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Búsquedas Recientes
                </h3>
              </div>
              <div className="space-y-1">
                {historialBusquedas.slice(0, 3).map((busqueda, indice) => (
                  <button
                    key={indice}
                    onClick={() => setTermino(busqueda)}
                    className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    {busqueda}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default BuscadorGeneral;