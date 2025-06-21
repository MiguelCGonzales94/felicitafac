/**
 * Login Component - Formulario de Login FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Componente de autenticación con validaciones
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { DatosLogin } from '../types/auth';
import { Button } from '../componentes/ui/button';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../componentes/ui/card';
import { Alert, AlertDescription } from '../componentes/ui/alert';
import { Checkbox } from '../componentes/ui/checkbox';

// Esquema de validación con Zod
const esquemaLogin = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  recordar_sesion: z.boolean().optional().default(false),
});

type DatosFormularioLogin = z.infer<typeof esquemaLogin>;

interface PropiedadesLogin {
  redirigirDespuesLogin?: string;
  mostrarRegistro?: boolean;
  titulo?: string;
  subtitulo?: string;
}

const Login: React.FC<PropiedadesLogin> = ({
  redirigirDespuesLogin = '/dashboard',
  mostrarRegistro = true,
  titulo = 'Iniciar Sesión',
  subtitulo = 'Accede a tu cuenta de FELICITAFAC',
}) => {
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { iniciarSesion, estado } = useAuth();

  // Estados locales
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarCredenciales, setRecordarCredenciales] = useState(false);

  // Formulario con React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<DatosFormularioLogin>({
    resolver: zodResolver(esquemaLogin),
    mode: 'onChange',
  });

  // Obtener valores del formulario
  const emailValue = watch('email');
  const passwordValue = watch('password');

  // Efectos
  useEffect(() => {
    // Cargar credenciales recordadas
    cargarCredencialesRecordadas();
  }, []);

  useEffect(() => {
    // Redirigir si ya está autenticado
    if (estado.estaAutenticado) {
      const destino = location.state?.from?.pathname || redirigirDespuesLogin;
      navigate(destino, { replace: true });
    }
  }, [estado.estaAutenticado, navigate, location.state, redirigirDespuesLogin]);

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
    }
  };

  /**
   * Guardar credenciales si el usuario lo solicita
   */
  const guardarCredenciales = (email: string, recordar: boolean): void => {
    try {
      if (recordar) {
        const credenciales = {
          email,
          recordar: true,
        };
        localStorage.setItem('felicitafac_credenciales_recordadas', JSON.stringify(credenciales));
      } else {
        localStorage.removeItem('felicitafac_credenciales_recordadas');
      }
    } catch (error) {
      console.warn('Error guardando credenciales:', error);
    }
  };

  /**
   * Manejar envío del formulario
   */
  const onSubmit = async (datos: DatosFormularioLogin): Promise<void> => {
    try {
      // Guardar credenciales si es necesario
      guardarCredenciales(datos.email, datos.recordar_sesion || false);

      // Intentar login
      await iniciarSesion({
        email: datos.email,
        password: datos.password,
        recordar_sesion: datos.recordar_sesion,
      });

      // La redirección se maneja en el useEffect
    } catch (error) {
      console.error('Error en login:', error);
      // El error se maneja en el contexto de autenticación
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
    setValue('recordar_sesion', checked);
  };

  /**
   * Obtener mensaje de error amigable
   */
  const obtenerMensajeError = (error: string): string => {
    const mensajesError: Record<string, string> = {
      'Credenciales inválidas.': 'Email o contraseña incorrectos',
      'Usuario bloqueado. Contacte al administrador.': 'Tu cuenta ha sido bloqueada',
      'Usuario suspendido temporalmente.': 'Tu cuenta está suspendida',
      'Usuario desactivado.': 'Tu cuenta está desactivada',
      'Error de conexión': 'No se pudo conectar con el servidor',
    };

    return mensajesError[error] || error || 'Error desconocido';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo y Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FELICITAFAC</h1>
          <p className="text-gray-600 mt-2">Sistema de Facturación Electrónica</p>
        </div>

        {/* Formulario de Login */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">{titulo}</CardTitle>
            <CardDescription className="text-center text-gray-600">
              {subtitulo}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mensaje de error */}
            {estado.error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {obtenerMensajeError(estado.error)}
                </AlertDescription>
              </Alert>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={estado.estaLoginCargando}
                    autoComplete="email"
                    autoFocus
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={mostrarPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={estado.estaLoginCargando}
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={alternarVisibilidadPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    disabled={estado.estaLoginCargando}
                    tabIndex={-1}
                  >
                    {mostrarPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Recordar sesión */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recordar_sesion"
                    checked={recordarCredenciales}
                    onCheckedChange={manejarRecordarSesion}
                    disabled={estado.estaLoginCargando}
                  />
                  <Label
                    htmlFor="recordar_sesion"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Recordar credenciales
                  </Label>
                </div>

                <Link
                  to="/recuperar-password"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de Login */}
              <Button
                type="submit"
                disabled={estado.estaLoginCargando || !isValid}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                {estado.estaLoginCargando ? (
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

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">o</span>
              </div>
            </div>

            {/* Enlaces adicionales */}
            <div className="space-y-4">
              {/* Demo login */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Cuentas de demostración:</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><strong>Admin:</strong> admin@felicitafac.com / admin123</p>
                  <p><strong>Vendedor:</strong> vendedor@felicitafac.com / vendedor123</p>
                  <p><strong>Cliente:</strong> cliente@felicitafac.com / cliente123</p>
                </div>
              </div>

              {/* Registro */}
              {mostrarRegistro && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    ¿No tienes una cuenta?{' '}
                    <Link
                      to="/registro"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>FELICITAFAC © 2024 - Sistema de Facturación Electrónica para Perú</p>
          <p className="mt-1">
            <Link to="/terminos" className="hover:text-gray-700">Términos de Uso</Link>
            {' • '}
            <Link to="/privacidad" className="hover:text-gray-700">Política de Privacidad</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;