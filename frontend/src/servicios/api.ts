/**
 * Cliente API Base - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Configuración base para todas las APIs
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// =======================================================
// CONFIGURACIÓN DEL CLIENTE AXIOS
// =======================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// =======================================================
// INTERCEPTORES DE REQUEST
// =======================================================

apiClient.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = localStorage.getItem('felicitafac_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// =======================================================
// INTERCEPTORES DE RESPONSE
// =======================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }

    return response;
  },
  (error) => {
    const { response, request } = error;

    if (response) {
      // Error de respuesta del servidor
      console.error(`❌ API Error ${response.status}:`, response.data);
      
      // Manejar errores específicos
      switch (response.status) {
        case 401:
          // Token expirado o inválido
          localStorage.removeItem('felicitafac_token');
          localStorage.removeItem('felicitafac_refresh_token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Sin permisos para esta acción');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error interno del servidor');
          break;
      }
    } else if (request) {
      // Error de red
      console.error('❌ Error de red:', error.message);
    } else {
      // Error de configuración
      console.error('❌ Error de configuración:', error.message);
    }

    return Promise.reject(error);
  }
);

// =======================================================
// FUNCIONES HELPER
// =======================================================

/**
 * GET request helper
 */
export const apiGet = async <T = any>(
  url: string, 
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.get<T>(url, config);
  return response.data;
};

/**
 * POST request helper
 */
export const apiPost = async <T = any, D = any>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
};

/**
 * PUT request helper
 */
export const apiPut = async <T = any, D = any>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
};

/**
 * DELETE request helper
 */
export const apiDelete = async <T = any>(
  url: string, 
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
};

/**
 * PATCH request helper
 */
export const apiPatch = async <T = any, D = any>(
  url: string, 
  data?: D, 
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
};

export default apiClient;