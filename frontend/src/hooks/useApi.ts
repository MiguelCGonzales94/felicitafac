/**
 * useApi Hook - FELICITAFAC (CORREGIDO)
 * Sistema de Facturación Electrónica para Perú
 * Hook genérico para manejo de APIs con estados y cache
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface EstadoApi<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface OpcionesUseApi {
  ejecutarInmediatamente?: boolean;
  dependencias?: any[];
  cachear?: boolean;
  tiempoCacheMs?: number;
  reintentos?: number;
  tiempoEspera?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface ResultadoUseApi<T> extends EstadoApi<T> {
  ejecutar: (parametros?: any) => Promise<T | null>;
  limpiar: () => void;
  refrescar: () => Promise<T | null>;
}

// =======================================================
// CACHE GLOBAL
// =======================================================

interface EntradaCache {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, EntradaCache>();

const obtenerDelCache = (key: string): any | null => {
  const entrada = cache.get(key);
  if (!entrada) return null;
  
  if (Date.now() - entrada.timestamp > entrada.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entrada.data;
};

const guardarEnCache = (key: string, data: any, ttl: number) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

const limpiarCache = (patron?: string) => {
  if (!patron) {
    cache.clear();
    return;
  }
  
  for (const key of cache.keys()) {
    if (key.includes(patron)) {
      cache.delete(key);
    }
  }
};

// =======================================================
// HOOK PRINCIPAL
// =======================================================

export function useApi<T = any>(
  requestFunction: (parametros?: any) => Promise<AxiosResponse<T>>,
  opciones: OpcionesUseApi = {}
): ResultadoUseApi<T> {
  const {
    ejecutarInmediatamente = false,
    dependencias = [],
    cachear = false,
    tiempoCacheMs = 5 * 60 * 1000, // 5 minutos
    reintentos = 0,
    tiempoEspera = 30000, // 30 segundos
    onSuccess,
    onError,
  } = opciones;

  // Estados
  const [estado, setEstado] = useState<EstadoApi<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  // Referencias
  const cancelTokenRef = useRef<AbortController | null>(null);
  const ultimosParametrosRef = useRef<any>(null);
  const cacheKeyRef = useRef<string>('');

  // Función para generar clave de cache
  const generarClaveCache = useCallback((params: any) => {
    const functionName = requestFunction.name || 'unnamed';
    const paramsString = JSON.stringify(params) || '';
    return `api_${functionName}_${btoa(paramsString)}`;
  }, [requestFunction]);

  // Función para ejecutar la request con reintentos
  const ejecutarConReintentos = useCallback(async (
    params: any,
    intentosRestantes: number
  ): Promise<T | null> => {
    try {
      // Crear nuevo token de cancelación
      cancelTokenRef.current = new AbortController();

      // Configurar timeout
      const timeoutId = setTimeout(() => {
        cancelTokenRef.current?.abort();
      }, tiempoEspera);

      // Ejecutar request
      const response = await requestFunction(params);
      
      // Limpiar timeout
      clearTimeout(timeoutId);
      
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Request cancelada');
      }

      if (intentosRestantes > 0) {
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 1000));
        return ejecutarConReintentos(params, intentosRestantes - 1);
      }

      throw error;
    }
  }, [requestFunction, tiempoEspera]);

  // Función principal de ejecución
  const ejecutar = useCallback(async (parametros?: any): Promise<T | null> => {
    // Cancelar request anterior si existe
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
    }

    // Generar clave de cache
    const cacheKey = generarClaveCache(parametros);
    cacheKeyRef.current = cacheKey;
    ultimosParametrosRef.current = parametros;

    // Verificar cache si está habilitado
    if (cachear) {
      const datosCache = obtenerDelCache(cacheKey);
      if (datosCache) {
        setEstado({
          data: datosCache,
          loading: false,
          error: null,
          success: true,
        });
        onSuccess?.(datosCache);
        return datosCache;
      }
    }

    // Iniciar loading
    setEstado(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const data = await ejecutarConReintentos(parametros, reintentos);

      // Guardar en cache si está habilitado
      if (cachear && data) {
        guardarEnCache(cacheKey, data, tiempoCacheMs);
      }

      // Actualizar estado con éxito
      setEstado({
        data,
        loading: false,
        error: null,
        success: true,
      });

      onSuccess?.(data);
      return data;

    } catch (error) {
      let mensajeError = 'Error desconocido';

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Error de respuesta del servidor
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 401) {
            mensajeError = 'No autorizado. Inicie sesión nuevamente.';
          } else if (status === 403) {
            mensajeError = 'No tiene permisos para realizar esta acción.';
          } else if (status === 404) {
            mensajeError = 'El recurso solicitado no fue encontrado.';
          } else if (status === 500) {
            mensajeError = 'Error interno del servidor.';
          } else if (data?.message || data?.error) {
            mensajeError = data.message || data.error;
          } else {
            mensajeError = `Error ${status}: ${error.response.statusText}`;
          }
        } else if (error.request) {
          // Error de red
          mensajeError = 'Error de conexión. Verifique su conexión a internet.';
        } else {
          // Error de configuración
          mensajeError = error.message;
        }
      } else if (error instanceof Error) {
        mensajeError = error.message;
      }

      // Actualizar estado con error
      setEstado({
        data: null,
        loading: false,
        error: mensajeError,
        success: false,
      });

      onError?.(mensajeError);
      return null;
    }
  }, [
    generarClaveCache,
    cachear,
    tiempoCacheMs,
    ejecutarConReintentos,
    reintentos,
    onSuccess,
    onError,
  ]);

  // Función para limpiar estado
  const limpiar = useCallback(() => {
    // Cancelar request si está en curso
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
    }

    setEstado({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  // Función para refrescar datos
  const refrescar = useCallback(async (): Promise<T | null> => {
    // Limpiar cache para esta request
    if (cacheKeyRef.current) {
      cache.delete(cacheKeyRef.current);
    }
    
    return ejecutar(ultimosParametrosRef.current);
  }, [ejecutar]);

  // Efecto para ejecución automática
  useEffect(() => {
    if (ejecutarInmediatamente) {
      ejecutar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejecutarInmediatamente, ...dependencias]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort();
      }
    };
  }, []);

  return {
    data: estado.data,
    loading: estado.loading,
    error: estado.error,
    success: estado.success,
    ejecutar,
    limpiar,
    refrescar,
  };
}

// =======================================================
// HOOKS ESPECIALIZADOS
// =======================================================

/**
 * Hook para GET requests
 */
export function useApiGet<T = any>(
  url: string | (() => string),
  config?: AxiosRequestConfig,
  opciones?: OpcionesUseApi
) {
  const requestFunction = useCallback(async () => {
    const finalUrl = typeof url === 'function' ? url() : url;
    return axios.get<T>(finalUrl, config);
  }, [url, config]);

  return useApi<T>(requestFunction, {
    ejecutarInmediatamente: true,
    cachear: true,
    ...opciones,
  });
}

/**
 * Hook para POST requests
 */
export function useApiPost<T = any, D = any>(
  url: string,
  config?: AxiosRequestConfig,
  opciones?: OpcionesUseApi
) {
  const requestFunction = useCallback(async (data: D) => {
    return axios.post<T>(url, data, config);
  }, [url, config]);

  return useApi<T>(requestFunction, opciones);
}

/**
 * Hook para PUT requests
 */
export function useApiPut<T = any, D = any>(
  url: string,
  config?: AxiosRequestConfig,
  opciones?: OpcionesUseApi
) {
  const requestFunction = useCallback(async (data: D) => {
    return axios.put<T>(url, data, config);
  }, [url, config]);

  return useApi<T>(requestFunction, opciones);
}

/**
 * Hook para DELETE requests
 */
export function useApiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig,
  opciones?: OpcionesUseApi
) {
  const requestFunction = useCallback(async () => {
    return axios.delete<T>(url, config);
  }, [url, config]);

  return useApi<T>(requestFunction, opciones);
}

// =======================================================
// HOOKS DE UTILIDAD
// =======================================================

/**
 * Hook para múltiples requests paralelas
 */
export function useApiParalelo<T = any[]>(
  requests: Array<() => Promise<AxiosResponse<any>>>,
  opciones?: OpcionesUseApi
) {
  const requestFunction = useCallback(async () => {
    const responses = await Promise.all(requests.map(req => req()));
    const firstResponse = responses[0];
    
    return {
      data: responses.map(res => res.data) as unknown as T,
      status: firstResponse?.status ?? 200,
      statusText: firstResponse?.statusText ?? 'OK',
      headers: firstResponse?.headers ?? {},
      config: firstResponse?.config ?? {},
      request: firstResponse?.request,
    } as AxiosResponse<T>;
  }, [requests]);

  return useApi<T>(requestFunction, opciones);
}

/**
 * Hook para requests secuenciales
 */
export function useApiSecuencial<T = any[]>(
  requests: Array<(prevResult?: any) => Promise<AxiosResponse<any>>>,
  opciones?: OpcionesUseApi
) {
  const requestFunction = useCallback(async () => {
    const results = [];
    let prevResult = null;
    let firstResponse: AxiosResponse<any> | null = null;

    for (const request of requests) {
      const response = await request(prevResult);
      if (!firstResponse) firstResponse = response;
      results.push(response.data);
      prevResult = response.data;
    }

    if (firstResponse) {
      return {
        data: results as unknown as T,
        status: firstResponse.status,
        statusText: firstResponse.statusText,
        headers: firstResponse.headers,
        config: firstResponse.config,
        request: firstResponse.request,
      } as AxiosResponse<T>;
    } else {
      // Return a fake AxiosResponse if no requests were made
      return {
        data: results as unknown as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        request: undefined,
      } as AxiosResponse<T>;
    }
  }, [requests]);

  return useApi<T>(requestFunction, opciones);
}

/**
 * Hook para pagination
 */
export function useApiPaginacion<T = any>(
  urlBase: string,
  config?: AxiosRequestConfig,
  opciones?: OpcionesUseApi
) {
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(20);

  const requestFunction = useCallback(async () => {
    const params = new URLSearchParams({
      page: pagina.toString(),
      page_size: limite.toString(),
      ...config?.params,
    });

    return axios.get<T>(`${urlBase}?${params.toString()}`, config);
  }, [urlBase, pagina, limite, config]);

  const result = useApi<T>(requestFunction, {
    ejecutarInmediatamente: true,
    dependencias: [pagina, limite],
    ...opciones,
  });

  return {
    ...result,
    pagina,
    limite,
    setPagina,
    setLimite,
    siguientePagina: () => setPagina(prev => prev + 1),
    paginaAnterior: () => setPagina(prev => Math.max(1, prev - 1)),
    irAPagina: (nuevaPagina: number) => setPagina(nuevaPagina),
  };
}

/**
 * Hook para búsqueda con debounce
 */
export function useApiBusqueda<T = any>(
  url: string,
  debounceMs: number = 300,
  config?: AxiosRequestConfig,
  opciones?: OpcionesUseApi
) {
  const [termino, setTermino] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Debounce del término de búsqueda
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTerminoBusqueda(termino);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [termino, debounceMs]);

  const requestFunction = useCallback(async () => {
    if (!terminoBusqueda.trim()) {
      // Return a valid AxiosResponse-like object
      return {
        data: null as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      } as AxiosResponse<T>;
    }

    const params = new URLSearchParams({
      search: terminoBusqueda,
      ...config?.params,
    });

    return axios.get<T>(`${url}?${params.toString()}`, config);
  }, [url, terminoBusqueda, config]);

  const result = useApi<T>(requestFunction, {
    ejecutarInmediatamente: false,
    dependencias: [],
    cachear: true,
    ...opciones,
  });

  // Ejecutar búsqueda cuando cambie el término
  useEffect(() => {
    if (terminoBusqueda.trim()) {
      result.ejecutar();
    } else {
      result.limpiar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminoBusqueda]);

  return {
    ...result,
    termino,
    setTermino,
    limpiarBusqueda: () => {
      setTermino('');
      setTerminoBusqueda('');
      result.limpiar();
    },
  };
}

// =======================================================
// UTILIDADES GLOBALES
// =======================================================

/**
 * Limpiar todo el cache
 */
export const limpiarTodoElCache = () => {
  limpiarCache();
};

/**
 * Limpiar cache por patrón
 */
export const limpiarCachePorPatron = (patron: string) => {
  limpiarCache(patron);
};

/**
 * Obtener estadísticas del cache
 */
export const obtenerEstadisticasCache = () => {
  const entradas = Array.from(cache.values());
  const ahora = Date.now();
  
  const entradasValidas = entradas.filter(
    entrada => ahora - entrada.timestamp < entrada.ttl
  );

  return {
    totalEntradas: cache.size,
    entradasValidas: entradasValidas.length,
    entradasExpiradas: cache.size - entradasValidas.length,
    tamaño: cache.size,
  };
};

export default useApi;