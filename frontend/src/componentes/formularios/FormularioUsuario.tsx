/**
 * Formulario de Usuario - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Formulario completo para gestión de usuarios, roles y permisos
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  User, Shield, Eye, EyeOff, Lock, Mail, Phone, MapPin, 
  Save, X, Upload, Settings, UserCog, Key, AlertTriangle, Camera
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Importar tipos y utilidades
import { 
  Usuario, 
  FormularioUsuario, 
  RolDetalle, 
  PermisoDetalle,
  CodigoRol,
  EstadoUsuario,
  ConfiguracionDashboard,
  ConfiguracionPOS,
  ConfiguracionReportes
} from '../../types/usuario';
import { validarEmail, validarTelefono, validarPassword } from '../../utils/validaciones';
import { formatearTelefono } from '../../utils/formatters';
import { DEPARTAMENTOS_PERU } from '../../utils/constants';
import { useApi } from '../../hooks/useApi';
import { useNotificaciones } from '../comunes/Notificaciones';
import { useCarga } from '../comunes/ComponenteCarga';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesFormularioUsuario {
  usuarioInicial?: Partial<Usuario>;
  modoEdicion?: boolean;
  onGuardar: (datos: FormularioUsuario) => Promise<void>;
  onCancelar: () => void;
  onEliminar?: (id: number) => Promise<void>;
  onResetearPassword?: (id: number) => Promise<void>;
  rolesDisponibles?: RolDetalle[];
  permisosDisponibles?: PermisoDetalle[];
  esPerfilPropio?: boolean;
  className?: string;
}

interface FormularioUsuarioData {
  // Datos personales
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  
  // Datos de cuenta
  password: string;
  confirmar_password: string;
  cambiar_password: boolean;
  
  // Rol y permisos
  rol_id: number | null;
  permisos_adicionales: number[];
  permisos_denegados: number[];
  
  // Estado y configuración
  estado_usuario: EstadoUsuario;
  requiere_cambio_password: boolean;
  fecha_expiracion_password: string;
  intentos_fallidos_max: number;
  
  // Información adicional
  avatar: string;
  telefono_emergencia: string;
  fecha_nacimiento: string;
  numero_documento: string;
  tipo_documento: string;
  
  // Configuración personal
  configuracion_dashboard: ConfiguracionDashboard;
  configuracion_pos: ConfiguracionPOS;
  configuracion_reportes: ConfiguracionReportes;
  
  // Observaciones
  biografia: string;
  notas_administrador: string;
  
  // Control
  activo: boolean;
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const ESTADOS_USUARIO: Array<{value: EstadoUsuario; label: string; descripcion: string; color: string}> = [
  { value: 'activo', label: 'Activo', descripcion: 'Usuario activo y operativo', color: 'bg-green-100 text-green-800' },
  { value: 'inactivo', label: 'Inactivo', descripcion: 'Usuario temporalmente desactivado', color: 'bg-gray-100 text-gray-800' },
  { value: 'bloqueado', label: 'Bloqueado', descripcion: 'Usuario bloqueado por seguridad', color: 'bg-red-100 text-red-800' },
  { value: 'suspendido', label: 'Suspendido', descripcion: 'Usuario suspendido por políticas', color: 'bg-yellow-100 text-yellow-800' }
];

const TIPOS_DOCUMENTO_PERSONA = [
  { value: '1', label: 'DNI', descripcion: 'Documento Nacional de Identidad' },
  { value: '4', label: 'Carnet de Extranjería', descripcion: 'Para extranjeros residentes' },
  { value: '7', label: 'Pasaporte', descripcion: 'Documento de viaje' }
];

// =======================================================
// HOOK PARA GESTIÓN DE ROLES Y PERMISOS
// =======================================================

const useGestionPermisos = (rolesDisponibles: RolDetalle[], permisosDisponibles: PermisoDetalle[]) => {
  const [rolSeleccionado, setRolSeleccionado] = useState<RolDetalle | null>(null);
  const [permisosRol, setPermisosRol] = useState<PermisoDetalle[]>([]);
  const [permisosAdicionales, setPermisosAdicionales] = useState<PermisoDetalle[]>([]);
  const [permisosDenegados, setPermisosDenegados] = useState<PermisoDetalle[]>([]);

  const actualizarRol = useCallback((rolId: number | null) => {
    const rol = rolesDisponibles.find(r => r.id === rolId);
    setRolSeleccionado(rol || null);
    setPermisosRol(rol?.permisos || []);
  }, [rolesDisponibles]);

  const obtenerPermisosFinales = useCallback(() => {
    const permisosBase = new Set(permisosRol.map(p => p.id));
    
    // Agregar permisos adicionales
    permisosAdicionales.forEach(p => permisosBase.add(p.id));
    
    // Remover permisos denegados
    permisosDenegados.forEach(p => permisosBase.delete(p.id));
    
    return Array.from(permisosBase);
  }, [permisosRol, permisosAdicionales, permisosDenegados]);

  return {
    rolSeleccionado,
    permisosRol,
    permisosAdicionales,
    permisosDenegados,
    actualizarRol,
    setPermisosAdicionales,
    setPermisosDenegados,
    obtenerPermisosFinales
  };
};

// =======================================================
// COMPONENTE CONFIGURACIÓN DE PERMISOS
// =======================================================

const ConfiguracionPermisos: React.FC<{
  rolesDisponibles: RolDetalle[];
  permisosDisponibles: PermisoDetalle[];
  rolSeleccionado: number | null;
  permisosAdicionales: number[];
  permisosDenegados: number[];
  onRolChange: (rolId: number | null) => void;
  onPermisosAdicionalesChange: (permisos: number[]) => void;
  onPermisosDenegadosChange: (permisos: number[]) => void;
  readonly?: boolean;
}> = ({
  rolesDisponibles,
  permisosDisponibles,
  rolSeleccionado,
  permisosAdicionales,
  permisosDenegados,
  onRolChange,
  onPermisosAdicionalesChange,
  onPermisosDenegadosChange,
  readonly = false
}) => {
  const rol = rolesDisponibles.find(r => r.id === rolSeleccionado);
  const permisosRol = rol?.permisos || [];
  
  // Agrupar permisos por módulo
  const permisosPorModulo = permisosDisponibles.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) acc[permiso.modulo] = [];
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {} as Record<string, PermisoDetalle[]>);

  const tienePermiso = (permisoId: number): 'rol' | 'adicional' | 'denegado' | 'no' => {
    if (permisosDenegados.includes(permisoId)) return 'denegado';
    if (permisosRol.some(p => p.id === permisoId)) return 'rol';
    if (permisosAdicionales.includes(permisoId)) return 'adicional';
    return 'no';
  };

  const togglePermisoAdicional = (permisoId: number) => {
    if (readonly) return;
    
    const estado = tienePermiso(permisoId);
    
    if (estado === 'adicional') {
      // Remover de adicionales
      onPermisosAdicionalesChange(permisosAdicionales.filter(id => id !== permisoId));
    } else if (estado === 'rol') {
      // Denegar permiso del rol
      onPermisosDenegadosChange([...permisosDenegados, permisoId]);
    } else if (estado === 'denegado') {
      // Remover de denegados
      onPermisosDenegadosChange(permisosDenegados.filter(id => id !== permisoId));
    } else {
      // Agregar como adicional
      onPermisosAdicionalesChange([...permisosAdicionales, permisoId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de rol */}
      <div>
        <Label>Rol Principal</Label>
        <Select 
          value={rolSeleccionado?.toString() || ''} 
          onValueChange={(value) => onRolChange(value ? parseInt(value) : null)}
          disabled={readonly}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar rol..." />
          </SelectTrigger>
          <SelectContent>
            {rolesDisponibles.map(rol => (
              <SelectItem key={rol.id} value={rol.id.toString()}>
                <div className="flex items-center space-x-2">
                  <div className={cn("w-3 h-3 rounded-full", rol.color || 'bg-gray-400')} />
                  <div>
                    <div className="font-medium">{rol.nombre}</div>
                    <div className="text-xs text-gray-500">{rol.descripcion}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {rol && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={rol.color || 'bg-blue-100 text-blue-800'}>
                {rol.nombre}
              </Badge>
              <span className="text-sm text-blue-700">
                {rol.total_permisos} permiso(s) incluido(s)
              </span>
            </div>
            <p className="text-sm text-blue-700">{rol.descripcion}</p>
          </div>
        )}
      </div>

      {/* Configuración detallada de permisos */}
      {Object.keys(permisosPorModulo).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Permisos Detallados</h3>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Del rol</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Adicional</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Denegado</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(permisosPorModulo).map(([modulo, permisos]) => (
              <Card key={modulo}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{modulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permisos.map(permiso => {
                      const estado = tienePermiso(permiso.id);
                      const colorClases = {
                        rol: 'border-blue-200 bg-blue-50',
                        adicional: 'border-green-200 bg-green-50',
                        denegado: 'border-red-200 bg-red-50',
                        no: 'border-gray-200 bg-white'
                      };

                      return (
                        <div
                          key={permiso.id}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-colors",
                            colorClases[estado],
                            readonly && "cursor-not-allowed opacity-60"
                          )}
                          onClick={() => togglePermisoAdicional(permiso.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{permiso.nombre}</div>
                              <div className="text-xs text-gray-600">{permiso.descripcion}</div>
                              {permiso.es_critico && (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  Crítico
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              {estado === 'rol' && <Shield className="h-4 w-4 text-blue-600" />}
                              {estado === 'adicional' && <span className="text-green-600">+</span>}
                              {estado === 'denegado' && <X className="h-4 w-4 text-red-600" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =======================================================
// COMPONENTE CONFIGURACIÓN PERSONAL
// =======================================================

const ConfiguracionPersonal: React.FC<{
  control: any;
  esPerfilPropio: boolean;
}> = ({ control, esPerfilPropio }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuración del Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Columnas en Dashboard</Label>
              <Controller
                name="configuracion_dashboard.columnas_dashboard"
                control={control}
                render={({ field }) => (
                  <Select value={field.value?.toString() || '3'} onValueChange={(v) => field.onChange(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 columnas</SelectItem>
                      <SelectItem value="3">3 columnas</SelectItem>
                      <SelectItem value="4">4 columnas</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Intervalo de Actualización (segundos)</Label>
              <Controller
                name="configuracion_dashboard.intervalo_actualizacion"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="30"
                    max="300"
                    step="30"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="configuracion_dashboard.mostrar_atajos"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="mostrar-atajos"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="mostrar-atajos">Mostrar atajos rápidos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="configuracion_dashboard.auto_actualizar"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="auto-actualizar"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="auto-actualizar">Actualización automática</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuración del Punto de Venta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Productos por Página</Label>
              <Controller
                name="configuracion_pos.productos_por_pagina"
                control={control}
                render={({ field }) => (
                  <Select value={field.value?.toString() || '20'} onValueChange={(v) => field.onChange(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 productos</SelectItem>
                      <SelectItem value="20">20 productos</SelectItem>
                      <SelectItem value="50">50 productos</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Descuento Máximo sin Autorización (%)</Label>
              <Controller
                name="configuracion_pos.descuento_maximo_sin_autorizacion"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Controller
                name="configuracion_pos.mostrar_imagenes_productos"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="mostrar-imagenes"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="mostrar-imagenes">Mostrar imágenes de productos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="configuracion_pos.imprimir_automatico"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="imprimir-auto"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="imprimir-auto">Imprimir automáticamente</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuración de Reportes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Formato Preferido</Label>
              <Controller
                name="configuracion_reportes.formato_preferido"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || 'pdf'} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="configuracion_reportes.incluir_graficos"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="incluir-graficos"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="incluir-graficos">Incluir gráficos</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const FormularioUsuario: React.FC<PropiedadesFormularioUsuario> = ({
  usuarioInicial,
  modoEdicion = false,
  onGuardar,
  onCancelar,
  onEliminar,
  onResetearPassword,
  rolesDisponibles = [],
  permisosDisponibles = [],
  esPerfilPropio = false,
  className
}) => {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormularioUsuarioData>({
    defaultValues: {
      nombres: usuarioInicial?.nombres || '',
      apellidos: usuarioInicial?.apellidos || '',
      email: usuarioInicial?.email || '',
      telefono: usuarioInicial?.telefono || '',
      direccion: usuarioInicial?.direccion || '',
      departamento: usuarioInicial?.departamento || '',
      provincia: usuarioInicial?.provincia || '',
      distrito: usuarioInicial?.distrito || '',
      password: '',
      confirmar_password: '',
      cambiar_password: false,
      rol_id: usuarioInicial?.rol?.id || null,
      permisos_adicionales: usuarioInicial?.permisos_adicionales?.map(p => p.id) || [],
      permisos_denegados: [],
      estado_usuario: usuarioInicial?.estado_usuario || 'activo',
      requiere_cambio_password: usuarioInicial?.requiere_cambio_password || false,
      fecha_expiracion_password: usuarioInicial?.fecha_expiracion_password || '',
      intentos_fallidos_max: usuarioInicial?.intentos_fallidos_max || 5,
      avatar: usuarioInicial?.avatar || '',
      telefono_emergencia: usuarioInicial?.telefono_emergencia || '',
      fecha_nacimiento: usuarioInicial?.fecha_nacimiento || '',
      numero_documento: usuarioInicial?.numero_documento || '',
      tipo_documento: usuarioInicial?.tipo_documento || '1',
      configuracion_dashboard: usuarioInicial?.configuracion_dashboard || {
        widgets_visibles: [],
        orden_widgets: [],
        tamaño_widgets: {},
        columnas_dashboard: 3,
        mostrar_atajos: true,
        mostrar_notificaciones: true,
        auto_actualizar: false,
        intervalo_actualizacion: 60
      },
      configuracion_pos: usuarioInicial?.configuracion_pos || {
        mostrar_imagenes_productos: true,
        productos_por_pagina: 20,
        auto_buscar_cliente: true,
        solicitar_email_cliente: false,
        imprimir_automatico: false,
        abrir_caja_automatico: false,
        sonidos_habilitados: true,
        metodos_pago_habilitados: [],
        descuento_maximo_sin_autorizacion: 10
      },
      configuracion_reportes: usuarioInicial?.configuracion_reportes || {
        formato_preferido: 'pdf',
        incluir_graficos: true,
        enviar_email_automatico: false,
        destinatarios_email: [],
        programar_reportes: false,
        reportes_favoritos: [],
        filtros_guardados: {}
      },
      biografia: usuarioInicial?.biografia || '',
      notas_administrador: usuarioInicial?.notas_administrador || '',
      activo: usuarioInicial?.activo !== undefined ? usuarioInicial.activo : true
    }
  });

  const { mostrarExito, mostrarError } = useNotificaciones();
  const { mostrarCargaConProgreso, ocultarCarga, actualizarProgreso } = useCarga();

  const valoresForm = watch();

  // Función para manejar envío
  const manejarEnvio = async (datos: FormularioUsuarioData) => {
    try {
      mostrarCargaConProgreso('Guardando usuario', 'Validando datos...');
      actualizarProgreso(25);

      // Validar contraseñas si se está cambiando
      if (datos.cambiar_password || !modoEdicion) {
        if (!datos.password) {
          mostrarError('Validation Error', 'La contraseña es requerida');
          return;
        }
        if (datos.password !== datos.confirmar_password) {
          mostrarError('Validation Error', 'Las contraseñas no coinciden');
          return;
        }
      }

      // Construir datos del usuario
      const datosUsuario: FormularioUsuario = {
        id: usuarioInicial?.id,
        ...datos,
        nombre_completo: `${datos.nombres} ${datos.apellidos}`,
        fecha_creacion: usuarioInicial?.fecha_creacion || new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        usuario_creacion: usuarioInicial?.usuario_creacion || 1,
        usuario_actualizacion: 1
      };

      // Remover campos de contraseña si no se está cambiando
      if (!datos.cambiar_password && modoEdicion) {
        delete (datosUsuario as any).password;
        delete (datosUsuario as any).confirmar_password;
      }

      actualizarProgreso(75, 'Guardando usuario...');
      
      await onGuardar(datosUsuario);
      
      actualizarProgreso(100, 'Completado');
      mostrarExito('Usuario guardado', 'El usuario se ha guardado correctamente');
      
    } catch (error) {
      console.error('Error guardando usuario:', error);
      mostrarError('Error', 'Error al guardar el usuario');
    } finally {
      setTimeout(ocultarCarga, 1000);
    }
  };

  // Función para resetear contraseña
  const manejarResetPassword = async () => {
    if (!usuarioInicial?.id || !onResetearPassword) return;
    
    try {
      await onResetearPassword(usuarioInicial.id);
      mostrarExito('Contraseña reseteada', 'Se ha enviado una nueva contraseña al usuario');
    } catch (error) {
      mostrarError('Error', 'Error al resetear la contraseña');
    }
  };

  const iniciales = `${valoresForm.nombres.charAt(0)}${valoresForm.apellidos.charAt(0)}`.toUpperCase();

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit(manejarEnvio)} className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{modoEdicion ? 'Editar' : 'Nuevo'} Usuario</span>
              </div>
              <div className="flex space-x-2">
                {modoEdicion && onResetearPassword && !esPerfilPropio && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={manejarResetPassword}
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Resetear Contraseña
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="datos-personales" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="datos-personales">Datos Personales</TabsTrigger>
                <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
                <TabsTrigger value="permisos">Permisos</TabsTrigger>
                <TabsTrigger value="configuracion">Configuración</TabsTrigger>
                <TabsTrigger value="adicional">Adicional</TabsTrigger>
              </TabsList>

              {/* Tab Datos Personales */}
              <TabsContent value="datos-personales" className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={valoresForm.avatar} />
                    <AvatarFallback className="text-lg font-semibold">
                      {iniciales}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label>Foto de Perfil</Label>
                    <div className="flex space-x-2 mt-1">
                      <Button type="button" variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-1" />
                        Cambiar Foto
                      </Button>
                      {valoresForm.avatar && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setValue('avatar', '')}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombres *</Label>
                    <Controller
                      name="nombres"
                      control={control}
                      rules={{ required: 'Nombres son requeridos' }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Nombres del usuario" />
                      )}
                    />
                    {errors.nombres && (
                      <p className="text-sm text-red-600 mt-1">{errors.nombres.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Apellidos *</Label>
                    <Controller
                      name="apellidos"
                      control={control}
                      rules={{ required: 'Apellidos son requeridos' }}
                      render={({ field }) => (
                        <Input {...field} placeholder="Apellidos del usuario" />
                      )}
                    />
                    {errors.apellidos && (
                      <p className="text-sm text-red-600 mt-1">{errors.apellidos.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{ 
                        required: 'Email es requerido',
                        validate: (value) => validarEmail(value) || 'Email inválido'
                      }}
                      render={({ field }) => (
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="usuario@empresa.com"
                          icon={<Mail className="h-4 w-4" />}
                        />
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Teléfono</Label>
                    <Controller
                      name="telefono"
                      control={control}
                      rules={{ 
                        validate: (value) => {
                          if (!value) return true;
                          return validarTelefono(value) || 'Teléfono inválido';
                        }
                      }}
                      render={({ field }) => (
                        <Input 
                          {...field} 
                          placeholder="+51 999 999 999"
                          icon={<Phone className="h-4 w-4" />}
                        />
                      )}
                    />
                    {errors.telefono && (
                      <p className="text-sm text-red-600 mt-1">{errors.telefono.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Tipo de Documento</Label>
                    <Controller
                      name="tipo_documento"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_DOCUMENTO_PERSONA.map(tipo => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                <div>
                                  <div className="font-medium">{tipo.label}</div>
                                  <div className="text-xs text-gray-500">{tipo.descripcion}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Número de Documento</Label>
                    <Controller
                      name="numero_documento"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} placeholder="12345678" />
                      )}
                    />
                  </div>

                  <div>
                    <Label>Fecha de Nacimiento</Label>
                    <Controller
                      name="fecha_nacimiento"
                      control={control}
                      render={({ field }) => (
                        <Input type="date" {...field} />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Label>Dirección</Label>
                  <Controller
                    name="direccion"
                    control={control}
                    render={({ field }) => (
                      <Textarea 
                        {...field} 
                        placeholder="Dirección completa..."
                        rows={2}
                      />
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tab Cuenta */}
              <TabsContent value="cuenta" className="space-y-4">
                {/* Estado del usuario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Estado del Usuario</Label>
                    <Controller
                      name="estado_usuario"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={esPerfilPropio}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ESTADOS_USUARIO.map(estado => (
                              <SelectItem key={estado.value} value={estado.value}>
                                <div className="flex items-center space-x-2">
                                  <Badge className={estado.color}>{estado.label}</Badge>
                                  <span className="text-sm">{estado.descripcion}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div>
                    <Label>Intentos Fallidos Máximos</Label>
                    <Controller
                      name="intentos_fallidos_max"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="3"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                          disabled={esPerfilPropio}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Configuración de contraseña */}
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuración de Contraseña</h3>
                  
                  {modoEdicion && (
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="cambiar_password"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="cambiar-password"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="cambiar-password">Cambiar contraseña</Label>
                    </div>
                  )}

                  {(valoresForm.cambiar_password || !modoEdicion) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nueva Contraseña *</Label>
                        <div className="relative">
                          <Controller
                            name="password"
                            control={control}
                            rules={{ 
                              required: 'Contraseña es requerida',
                              validate: (value) => validarPassword(value) || 'Contraseña debe tener al menos 8 caracteres'
                            }}
                            render={({ field }) => (
                              <Input 
                                {...field} 
                                type={mostrarPassword ? 'text' : 'password'}
                                placeholder="Mínimo 8 caracteres"
                              />
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                        )}
                      </div>

                      <div>
                        <Label>Confirmar Contraseña *</Label>
                        <div className="relative">
                          <Controller
                            name="confirmar_password"
                            control={control}
                            rules={{ 
                              required: 'Confirmación de contraseña es requerida',
                              validate: (value) => value === watch('password') || 'Las contraseñas no coinciden'
                            }}
                            render={({ field }) => (
                              <Input 
                                {...field} 
                                type={mostrarConfirmarPassword ? 'text' : 'password'}
                                placeholder="Confirma la contraseña"
                              />
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {mostrarConfirmarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmar_password && (
                          <p className="text-sm text-red-600 mt-1">{errors.confirmar_password.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {!esPerfilPropio && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Controller
                          name="requiere_cambio_password"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="requiere-cambio"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor="requiere-cambio">Requiere cambio en próximo login</Label>
                      </div>

                      <div>
                        <Label>Fecha de Expiración de Contraseña</Label>
                        <Controller
                          name="fecha_expiracion_password"
                          control={control}
                          render={({ field }) => (
                            <Input type="date" {...field} />
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab Permisos */}
              <TabsContent value="permisos">
                {!esPerfilPropio ? (
                  <ConfiguracionPermisos
                    rolesDisponibles={rolesDisponibles}
                    permisosDisponibles={permisosDisponibles}
                    rolSeleccionado={valoresForm.rol_id}
                    permisosAdicionales={valoresForm.permisos_adicionales}
                    permisosDenegados={valoresForm.permisos_denegados}
                    onRolChange={(rolId) => setValue('rol_id', rolId)}
                    onPermisosAdicionalesChange={(permisos) => setValue('permisos_adicionales', permisos)}
                    onPermisosDenegadosChange={(permisos) => setValue('permisos_denegados', permisos)}
                  />
                ) : (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      No puedes modificar tus propios permisos. Contacta a un administrador si necesitas cambios en tu rol o permisos.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Tab Configuración */}
              <TabsContent value="configuracion">
                <ConfiguracionPersonal
                  control={control}
                  esPerfilPropio={esPerfilPropio}
                />
              </TabsContent>

              {/* Tab Adicional */}
              <TabsContent value="adicional" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Teléfono de Emergencia</Label>
                    <Controller
                      name="telefono_emergencia"
                      control={control}
                      render={({ field }) => (
                        <Input 
                          {...field} 
                          placeholder="+51 999 999 999"
                          icon={<Phone className="h-4 w-4" />}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <Controller
                      name="activo"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          id="activo"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={esPerfilPropio}
                        />
                      )}
                    />
                    <Label htmlFor="activo">Usuario activo</Label>
                  </div>
                </div>

                <div>
                  <Label>Biografía</Label>
                  <Controller
                    name="biografia"
                    control={control}
                    render={({ field }) => (
                      <Textarea 
                        {...field} 
                        placeholder="Información adicional sobre el usuario..."
                        rows={3}
                      />
                    )}
                  />
                </div>

                {!esPerfilPropio && (
                  <div>
                    <Label>Notas del Administrador</Label>
                    <Controller
                      name="notas_administrador"
                      control={control}
                      render={({ field }) => (
                        <Textarea 
                          {...field} 
                          placeholder="Notas internas del administrador..."
                          rows={3}
                        />
                      )}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-between">
          <div>
            {modoEdicion && onEliminar && usuarioInicial?.id && !esPerfilPropio && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => onEliminar(usuarioInicial.id!)}
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
            
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {modoEdicion ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </div>
      </form>
    </TooltipProvider>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default FormularioUsuario;