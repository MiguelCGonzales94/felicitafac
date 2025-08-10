import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../componentes/ui/button';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../componentes/ui/card';
import { Alert, AlertDescription } from '../componentes/ui/alert';
import { Checkbox } from '../componentes/ui/checkbox';

// =======================================================
// TIPOS Y INTERFACES
// =======================================================

interface FormularioLogin {
  email: string;
  password: string;
  recordarme: boolean;
}

interface ErroresFormulario {
  email?: string;
  password?: string;
  general?: string;
}

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const Login: React.FC = () => {
  // Estados
  const [formulario, setFormulario] = useState<FormularioLogin>({
    email: '',
    password: '',
    recordarme: false
  });
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Hooks
  const { iniciarSesion, estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // =======================================================
  // EFECTOS
  // =======================================================

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (estaAutenticado && usuario) {
      const origen = location.state?.from?.pathname || '/admin';
      navigate(origen, { replace: true });
    }
  }, [estaAutenticado, usuario, navigate, location]);

  // Mostrar mensaje de éxito desde registro
  useEffect(() => {
    if (location.state?.mensaje) {
      setMensajeExito(location.state.mensaje);
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setMensajeExito(''), 5000);
    }
  }, [location.state]);

  // =======================================================
  // FUNCIONES
  // =======================================================

  const validarFormulario = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};

    // Validar email
    if (!formulario.email.trim()) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formulario.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    // Validar password
    if (!formulario.password.trim()) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (formulario.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarCambioFormulario = (campo: keyof FormularioLogin, valor: any) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
    // Limpiar error específico
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    }
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCargando(true);
    setErrores({});

    try {
      await iniciarSesion({
        email: formulario.email.trim(),
        password: formulario.password,
        recordarme: formulario.recordarme
      });

      // La redirección se maneja en el useEffect
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      
      const mensajeError = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error al iniciar sesión. Verifique sus credenciales.';
      
      setErrores({ general: mensajeError });
    } finally {
      setCargando(false);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FELICITAFAC</h1>
          <p className="text-gray-600">Sistema de Facturación Electrónica</p>
        </div>

        {/* Mensaje de éxito */}
        {mensajeExito && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {mensajeExito}
            </AlertDescription>
          </Alert>
        )}

        {/* Formulario de login */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={manejarSubmit} className="space-y-4">
              {/* Error general */}
              {errores.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errores.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formulario.email}
                    onChange={(e) => manejarCambioFormulario('email', e.target.value)}
                    className={`pl-10 ${errores.email ? 'border-red-300' : ''}`}
                    disabled={cargando}
                  />
                </div>
                {errores.email && (
                  <p className="text-sm text-red-600">{errores.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={mostrarPassword ? 'text' : 'password'}
                    placeholder="Tu contraseña"
                    value={formulario.password}
                    onChange={(e) => manejarCambioFormulario('password', e.target.value)}
                    className={`pl-10 pr-10 ${errores.password ? 'border-red-300' : ''}`}
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={cargando}
                  >
                    {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errores.password && (
                  <p className="text-sm text-red-600">{errores.password}</p>
                )}
              </div>

              {/* Recordarme y recuperar contraseña */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recordarme"
                    checked={formulario.recordarme}
                    onCheckedChange={(checked) => manejarCambioFormulario('recordarme', checked)}
                    disabled={cargando}
                  />
                  <Label htmlFor="recordarme" className="text-sm">
                    Recordarme
                  </Label>
                </div>
                <Link
                  to="/recuperar-password"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón de submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/registro"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Regístrate aquí
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                <Link
                  to="/"
                  className="text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Volver al inicio
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Sistema seguro con certificado SSL
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Compatible con normativa SUNAT
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;