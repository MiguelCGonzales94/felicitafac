/**
 * Login Component - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente de autenticación actualizado con todas las dependencias
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Loader2,
  FileText,
  ArrowLeft
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { Button } from '../componentes/ui/button';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../componentes/ui/card';
import { Alert, AlertDescription } from '../componentes/ui/alert';
import { Checkbox } from '../componentes/ui/checkbox';

// =======================================================
// ESQUEMAS DE VALIDACIÓN
// =======================================================

const esquemaLogin = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .toLowerCase()
    .refine(
      (email) => email.length <= 254,
      'El email es demasiado largo'
    ),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
  recordar_sesion: z.boolean().optional().default(false),
});

type DatosFormularioLogin = z.infer<typeof esquemaLogin>;

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesLogin {
  redirigirDespuesLogin?: string;
  mostrarRegistro?: boolean;
  titulo?: string;
  subtitulo?: string;
}

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const Login: React.FC<PropiedadesLogin> = ({
  redirigirDespuesLogin = '/dashboard',
  mostrarRegistro = true,
  titulo = 'Bienvenido a FELICITAFAC',
  subtitulo = 'Ingresa a tu cuenta para gestionar tu facturación',
}) => {
  // =======================================================
  // HOOKS Y ESTADOS
  // =======================================================

  const navigate = useNavigate();
  const location = useLocation();
  const { iniciarSesion, estaAutenticado, estaCargando, error, limpiarError } = useAuth();

  // Estados locales
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarCredenciales, setRecordarCredenciales] = useState(false);
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);

  // Configuración del formulario
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<DatosFormularioLogin>({
    resolver: zodResolver(esquemaLogin),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      recordar_sesion: false,
    },
  });

  // Observar valores del formulario
  const formValues = watch();

  // =======================================================
  // EFECTOS
  // =======================================================

  /**
   * Cargar credenciales recordadas al montar
   */
  useEffect(() => {
    cargarCredencialesRecordadas();
  }, []);

  /**
   * Redirigir si ya está autenticado
   */
  useEffect(() => {
    if (estaAutenticado) {
      const destino = (location.state as any)?.from?.pathname || redirigirDespuesLogin;
      navigate(destino, { replace: true });
    }
  }, [estaAutenticado, navigate, location.state, redirigirDespuesLogin]);

  /**
   * Limpiar errores cuando el usuario empiece a escribir
   */
  useEffect(() => {
    if (error && (formValues.email || formValues.password)) {
      limpiarError();
    }
  }, [formValues.email, formValues.password, error, limpiarError]);

  // =======================================================
  // FUNCIONES DE UTILIDAD
  // =======================================================

  /**
   * Cargar credenciales recordadas del localStorage
   */
  const cargarCredencialesRecordadas = (): void => {
    try {
      const credencialesGuardadas = localStorage.getItem('felicitafac_credenciales_recordadas');
      
      if (credencialesGuardadas) {
        const { email, recordar } = JSON.parse(credencialesGuardadas);
        
        if (recordar && email) {
          setValue('email', email);
          setRecordarCredenciales(true);
          setValue('recordar_sesion', true);
        }
      }
    } catch (error) {
      console.warn('Error cargando credenciales recordadas:', error);
      // Limpiar localStorage corrupto
      localStorage.removeItem('felicitafac_credenciales_recordadas');
    }
  };

  /**
   * Guardar credenciales si el usuario lo solicita
   */
  const guardarCredenciales = (email: string, recordar: boolean): void => {
    try {
      if (recordar && email) {
        const credenciales = { email, recordar: true };
        localStorage.setItem('felicitafac_credenciales_recordadas', JSON.stringify(credenciales));
      } else {
        localStorage.removeItem('felicitafac_credenciales_recordadas');
      }
    } catch (error) {
      console.warn('Error guardando credenciales:', error);
    }
  };

  /**
   * Obtener mensaje de error amigable
   */
  const obtenerMensajeError = (error: string): string => {
    const mensajesError: Record<string, string> = {
      'Credenciales inválidas.': 'Email o contraseña incorrectos',
      'Invalid credentials': 'Email o contraseña incorrectos',
      'Usuario bloqueado. Contacte al administrador.': 'Tu cuenta ha sido bloqueada. Contacta al administrador.',
      'Usuario suspendido temporalmente.': 'Tu cuenta está suspendida temporalmente',
      'Usuario desactivado.': 'Tu cuenta ha sido desactivada',
      'Network Error': 'Error de conexión. Verifica tu internet.',
      'Request timeout': 'La solicitud tardó demasiado. Intenta nuevamente.',
    };

    return mensajesError[error] || error || 'Error inesperado. Intenta nuevamente.';
  };

  // =======================================================
  // MANEJADORES DE EVENTOS
  // =======================================================

  /**
   * Manejar envío del formulario
   */
  const onSubmit = async (datos: DatosFormularioLogin): Promise<void> => {
    if (enviandoFormulario) return;

    setEnviandoFormulario(true);
    limpiarError();

    try {
      // Guardar credenciales si es necesario
      guardarCredenciales(datos.email, datos.recordar_sesion || false);

      // Intentar login
      await iniciarSesion({
        email: datos.email,
        password: datos.password,
        recordarme: datos.recordar_sesion,
      });

      // La redirección se maneja en el useEffect
    } catch (error) {
      console.error('Error en login:', error);
      // El error se maneja automáticamente por el contexto de auth
    } finally {
      setEnviandoFormulario(false);
    }
  };

  /**
   * Alternar visibilidad de contraseña
   */
  const alternarVisibilidadPassword = (): void => {
    setMostrarPassword(!mostrarPassword);
  };

  /**
   * Manejar cambio de checkbox recordar sesión
   */
  const manejarRecordarSesion = (checked: boolean): void => {
    setRecordarCredenciales(checked);
    setValue('recordar_sesion', checked, { shouldValidate: true });
  };

  /**
   * Volver a la página anterior
   */
  const volverAtras = (): void => {
    navigate(-1);
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header con logo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
            <p className="text-gray-600 mt-1">{subtitulo}</p>
          </div>
        </div>

        {/* Formulario de login */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Accede con tu email y contraseña
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Mostrar error general */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {obtenerMensajeError(error)}
                </AlertDescription>
              </Alert>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" requerido error={!!errors.email}>
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    className="pl-10"
                    estado={errors.email ? 'error' : 'default'}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" requerido error={!!errors.password}>
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={mostrarPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    estado={errors.password ? 'error' : 'default'}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={alternarVisibilidadPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Checkbox Recordar Sesión */}
              <div className="flex items-center justify-between">
                <Checkbox
                  id="recordar_sesion"
                  checked={recordarCredenciales}
                  onCheckedChange={manejarRecordarSesion}
                  label="Recordar sesión"
                />
                <Link
                  to="/recuperar-password"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || enviandoFormulario || estaCargando}
              >
                {(enviandoFormulario || estaCargando) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            {/* Enlaces adicionales */}
            {mostrarRegistro && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    to="/registro"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón volver */}
        <div className="text-center">
          <button
            onClick={volverAtras}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </button>
        </div>

        {/* Información de desarrollo */}
        {import.meta.env.DEV && (
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              <p className="font-medium mb-1">🚀 Modo Desarrollo</p>
              <p>Credenciales de prueba:</p>
              <p><strong>Email:</strong> admin@felicitafac.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;