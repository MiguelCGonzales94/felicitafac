/**
 * Servicio API de Usuarios - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Servicio completo para gestión de usuarios y roles
 */

import axios, { AxiosResponse } from 'axios';
import { 
  Usuario, 
  UsuarioResumen,
  Rol,
  PerfilUsuario,
  SesionUsuario,
  DatosLogin,
  DatosRegistro,
  CambiarPasswordDatos,
  FiltrosUsuarios,
  EstadisticasUsuario,
  ConfiguracionUsuario,
  PermisosUsuario
} from '../types/usuario';
import { RespuestaPaginada, ParametrosBusqueda } from '../types/common';
import { obtenerToken } from '../utils/auth';

// =======================================================
// CONFIGURACIÓN BASE
// =======================================================

const API_BASE_URL = '/api/usuarios';

const obtenerConfiguracion = () => ({
  headers: {
    'Authorization': `Bearer ${obtenerToken()}`,
    'Content-Type': 'application/json',
  },
});

// =======================================================
// CLASE PRINCIPAL DEL SERVICIO
// =======================================================

export class UsuariosAPI {
  // =======================================================
  // MÉTODOS DE AUTENTICACIÓN
  // =======================================================

  /**
   * Iniciar sesión
   */
  static async iniciarSesion(credenciales: DatosLogin): Promise<{
    access: string;
    refresh: string;
    usuario: Usuario;
    mensaje: string;
    expires_in: number;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login/`,
        {
          email: credenciales.email,
          password: credenciales.password,
          recordarme: credenciales.recordarme || false,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      throw new Error(
        error.response?.data?.message || 
        'Credenciales incorrectas. Verifique su email y contraseña.'
      );
    }
  }

  /**
   * Refrescar token
   */
  static async refrescarToken(refreshToken: string): Promise<{
    access: string;
    expires_in: number;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/token/refresh/`,
        { refresh: refreshToken }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al refrescar token:', error);
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
  }

  /**
   * Cerrar sesión
   */
  static async cerrarSesion(refreshToken: string): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/logout/`,
        { refresh: refreshToken },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      // No lanzar error aquí, cerrar sesión localmente de todos modos
      return { mensaje: 'Sesión cerrada localmente' };
    }
  }

  /**
   * Registrar nuevo usuario
   */
  static async registrarUsuario(datosRegistro: DatosRegistro): Promise<{
    usuario: Usuario;
    mensaje: string;
    requiere_activacion: boolean;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/registro/`,
        {
          email: datosRegistro.email,
          password: datosRegistro.password,
          password_confirmation: datosRegistro.password_confirmation,
          nombre: datosRegistro.nombre,
          apellidos: datosRegistro.apellidos,
          telefono: datosRegistro.telefono,
          terminos_aceptados: datosRegistro.terminos_aceptados,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al registrar el usuario. Verifique los datos e intente nuevamente.'
      );
    }
  }

  // =======================================================
  // MÉTODOS CRUD DE USUARIOS
  // =======================================================

  /**
   * Crear nuevo usuario (admin)
   */
  static async crearUsuario(datosUsuario: {
    email: string;
    nombre: string;
    apellidos: string;
    telefono?: string;
    rol_id: number;
    activo?: boolean;
    password?: string;
    enviar_credenciales?: boolean;
  }): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await axios.post(
        `${API_BASE_URL}/usuarios/`,
        datosUsuario,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al crear el usuario. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async obtenerUsuario(id: number): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await axios.get(
        `${API_BASE_URL}/usuarios/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener usuario:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener el usuario. Verifique el ID e intente nuevamente.'
      );
    }
  }

  /**
   * Actualizar usuario
   */
  static async actualizarUsuario(id: number, datosUsuario: Partial<Usuario>): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await axios.put(
        `${API_BASE_URL}/usuarios/${id}/`,
        datosUsuario,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar el usuario. Verifique los datos e intente nuevamente.'
      );
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  static async eliminarUsuario(id: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.delete(
        `${API_BASE_URL}/usuarios/${id}/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al eliminar el usuario.'
      );
    }
  }

  // =======================================================
  // MÉTODOS DE BÚSQUEDA Y LISTADO
  // =======================================================

  /**
   * Listar usuarios con filtros y paginación
   */
  static async listarUsuarios(filtros: FiltrosUsuarios = {}): Promise<RespuestaPaginada<UsuarioResumen>> {
    try {
      const params = new URLSearchParams();

      // Aplicar filtros
      if (filtros.busqueda) params.append('search', filtros.busqueda);
      if (filtros.rol_id) params.append('rol', filtros.rol_id.toString());
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.activo !== undefined) params.append('activo', filtros.activo.toString());
      if (filtros.fecha_creacion_desde) params.append('fecha_creacion_desde', filtros.fecha_creacion_desde);
      if (filtros.fecha_creacion_hasta) params.append('fecha_creacion_hasta', filtros.fecha_creacion_hasta);
      if (filtros.ultimo_login_desde) params.append('ultimo_login_desde', filtros.ultimo_login_desde);
      if (filtros.ultimo_login_hasta) params.append('ultimo_login_hasta', filtros.ultimo_login_hasta);
      
      // Paginación
      if (filtros.pagina) params.append('page', filtros.pagina.toString());
      if (filtros.limite) params.append('page_size', filtros.limite.toString());
      
      // Ordenamiento
      if (filtros.ordenar_por) {
        const orden = filtros.orden === 'desc' ? `-${filtros.ordenar_por}` : filtros.ordenar_por;
        params.append('ordering', orden);
      }

      const response: AxiosResponse<RespuestaPaginada<UsuarioResumen>> = await axios.get(
        `${API_BASE_URL}/usuarios/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al listar usuarios:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener la lista de usuarios.'
      );
    }
  }

  /**
   * Buscar usuarios por múltiples criterios
   */
  static async buscarUsuarios(parametros: ParametrosBusqueda): Promise<UsuarioResumen[]> {
    try {
      const params = new URLSearchParams();
      params.append('search', parametros.termino);
      if (parametros.limite) params.append('limit', parametros.limite.toString());

      const response: AxiosResponse<{ results: UsuarioResumen[] }> = await axios.get(
        `${API_BASE_URL}/usuarios/buscar/?${params.toString()}`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al buscar usuarios:', error);
      throw new Error('Error en la búsqueda de usuarios.');
    }
  }

  // =======================================================
  // MÉTODOS DE PERFIL Y CONFIGURACIÓN
  // =======================================================

  /**
   * Obtener perfil del usuario actual
   */
  static async obtenerPerfilActual(): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await axios.get(
        `${API_BASE_URL}/perfil/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener perfil:', error);
      throw new Error('Error al obtener el perfil del usuario.');
    }
  }

  /**
   * Actualizar perfil del usuario actual
   */
  static async actualizarPerfil(datosPerfil: {
    nombre?: string;
    apellidos?: string;
    telefono?: string;
    avatar?: string;
    preferencias?: Record<string, any>;
  }): Promise<Usuario> {
    try {
      const response: AxiosResponse<Usuario> = await axios.put(
        `${API_BASE_URL}/perfil/`,
        datosPerfil,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      throw new Error('Error al actualizar el perfil.');
    }
  }

  /**
   * Cambiar contraseña
   */
  static async cambiarPassword(datos: CambiarPasswordDatos): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/cambiar-password/`,
        {
          password_actual: datos.password_actual,
          password_nuevo: datos.password_nuevo,
          password_nuevo_confirmacion: datos.password_nuevo_confirmacion,
        },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cambiar la contraseña. Verifique la contraseña actual.'
      );
    }
  }

  /**
   * Subir avatar
   */
  static async subirAvatar(archivo: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', archivo);

      const response = await axios.post(
        `${API_BASE_URL}/subir-avatar/`,
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
      console.error('Error al subir avatar:', error);
      throw new Error('Error al subir la imagen de avatar.');
    }
  }

  // =======================================================
  // MÉTODOS DE ROLES Y PERMISOS
  // =======================================================

  /**
   * Obtener todos los roles
   */
  static async obtenerRoles(): Promise<Rol[]> {
    try {
      const response: AxiosResponse<{ results: Rol[] }> = await axios.get(
        `${API_BASE_URL}/roles/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener roles:', error);
      throw new Error('Error al obtener los roles.');
    }
  }

  /**
   * Crear nuevo rol
   */
  static async crearRol(rol: {
    nombre: string;
    codigo: string;
    descripcion?: string;
    permisos: string[];
    activo?: boolean;
  }): Promise<Rol> {
    try {
      const response: AxiosResponse<Rol> = await axios.post(
        `${API_BASE_URL}/roles/`,
        rol,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al crear rol:', error);
      throw new Error('Error al crear el rol.');
    }
  }

  /**
   * Actualizar rol
   */
  static async actualizarRol(id: number, rol: Partial<Rol>): Promise<Rol> {
    try {
      const response: AxiosResponse<Rol> = await axios.put(
        `${API_BASE_URL}/roles/${id}/`,
        rol,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar rol:', error);
      throw new Error('Error al actualizar el rol.');
    }
  }

  /**
   * Obtener permisos del usuario actual
   */
  static async obtenerPermisosActuales(): Promise<PermisosUsuario> {
    try {
      const response: AxiosResponse<PermisosUsuario> = await axios.get(
        `${API_BASE_URL}/mis-permisos/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener permisos:', error);
      throw new Error('Error al obtener los permisos del usuario.');
    }
  }

  /**
   * Verificar permiso específico
   */
  static async verificarPermiso(permiso: string): Promise<{ tiene_permiso: boolean }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/verificar-permiso/?permiso=${permiso}`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al verificar permiso:', error);
      return { tiene_permiso: false };
    }
  }

  // =======================================================
  // MÉTODOS DE SESIONES
  // =======================================================

  /**
   * Obtener sesiones activas del usuario
   */
  static async obtenerSesionesActivas(): Promise<SesionUsuario[]> {
    try {
      const response: AxiosResponse<{ results: SesionUsuario[] }> = await axios.get(
        `${API_BASE_URL}/sesiones-activas/`,
        obtenerConfiguracion()
      );

      return response.data.results;
    } catch (error: any) {
      console.error('Error al obtener sesiones:', error);
      throw new Error('Error al obtener las sesiones activas.');
    }
  }

  /**
   * Cerrar sesión específica
   */
  static async cerrarSesionEspecifica(sesionId: number): Promise<{ mensaje: string }> {
    try {
      const response: AxiosResponse<{ mensaje: string }> = await axios.post(
        `${API_BASE_URL}/cerrar-sesion/${sesionId}/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al cerrar sesión específica:', error);
      throw new Error('Error al cerrar la sesión.');
    }
  }

  /**
   * Cerrar todas las demás sesiones
   */
  static async cerrarTodasLasDemasSesiones(): Promise<{ mensaje: string; sesiones_cerradas: number }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cerrar-otras-sesiones/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al cerrar otras sesiones:', error);
      throw new Error('Error al cerrar las demás sesiones.');
    }
  }

  // =======================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =======================================================

  /**
   * Obtener estadísticas del usuario
   */
  static async obtenerEstadisticasUsuario(id: number): Promise<EstadisticasUsuario> {
    try {
      const response: AxiosResponse<EstadisticasUsuario> = await axios.get(
        `${API_BASE_URL}/usuarios/${id}/estadisticas/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('Error al obtener las estadísticas del usuario.');
    }
  }

  /**
   * Obtener estadísticas generales de usuarios
   */
  static async obtenerEstadisticasGenerales(): Promise<{
    total_usuarios: number;
    usuarios_activos: number;
    usuarios_inactivos: number;
    nuevos_usuarios_mes: number;
    sesiones_activas: number;
    por_rol: Array<{
      rol: string;
      cantidad: number;
    }>;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/estadisticas-generales/`,
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas generales:', error);
      throw new Error('Error al obtener las estadísticas generales.');
    }
  }

  // =======================================================
  // MÉTODOS DE ACCIONES MASIVAS
  // =======================================================

  /**
   * Activar/Desactivar múltiples usuarios
   */
  static async cambiarEstadoMasivo(ids: number[], activo: boolean): Promise<{ procesados: number; errores: string[] }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/usuarios/cambiar-estado-masivo/`,
        { ids, activo },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error en cambio masivo de estado:', error);
      throw new Error('Error al cambiar el estado de los usuarios.');
    }
  }

  /**
   * Asignar rol masivo
   */
  static async asignarRolMasivo(ids: number[], rolId: number): Promise<{ procesados: number; errores: string[] }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/usuarios/asignar-rol-masivo/`,
        { ids, rol_id: rolId },
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error en asignación masiva de rol:', error);
      throw new Error('Error al asignar el rol a los usuarios.');
    }
  }

  // =======================================================
  // MÉTODOS DE EXPORTACIÓN
  // =======================================================

  /**
   * Exportar usuarios a Excel
   */
  static async exportarExcel(filtros: FiltrosUsuarios = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response: AxiosResponse<Blob> = await axios.get(
        `${API_BASE_URL}/usuarios/exportar-excel/?${params.toString()}`,
        {
          ...obtenerConfiguracion(),
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al exportar a Excel:', error);
      throw new Error('Error al exportar los usuarios a Excel.');
    }
  }

  // =======================================================
  // MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
  // =======================================================

  /**
   * Solicitar recuperación de contraseña
   */
  static async solicitarRecuperacionPassword(email: string): Promise<{ mensaje: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/recuperar-password/`,
        { email }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al solicitar recuperación:', error);
      throw new Error('Error al solicitar la recuperación de contraseña.');
    }
  }

  /**
   * Restablecer contraseña con token
   */
  static async restablecerPassword(
    token: string,
    passwordNuevo: string,
    passwordConfirmacion: string
  ): Promise<{ mensaje: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/restablecer-password/`,
        {
          token,
          password_nuevo: passwordNuevo,
          password_confirmacion: passwordConfirmacion,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error);
      throw new Error('Error al restablecer la contraseña. El token puede haber expirado.');
    }
  }

  // =======================================================
  // MÉTODOS DE UTILIDADES
  // =======================================================

  /**
   * Verificar disponibilidad de email
   */
  static async verificarEmailDisponible(email: string, usuarioId?: number): Promise<{ disponible: boolean }> {
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      if (usuarioId) params.append('excluir_id', usuarioId.toString());

      const response = await axios.get(
        `${API_BASE_URL}/verificar-email/?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al verificar email:', error);
      throw new Error('Error al verificar la disponibilidad del email.');
    }
  }

  /**
   * Enviar email de activación
   */
  static async enviarEmailActivacion(usuarioId: number): Promise<{ mensaje: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/enviar-activacion/${usuarioId}/`,
        {},
        obtenerConfiguracion()
      );

      return response.data;
    } catch (error: any) {
      console.error('Error al enviar email de activación:', error);
      throw new Error('Error al enviar el email de activación.');
    }
  }

  /**
   * Limpiar cache del servicio
   */
  static limpiarCache(): void {
    console.log('Cache de usuarios limpiado');
  }
}

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default UsuariosAPI;