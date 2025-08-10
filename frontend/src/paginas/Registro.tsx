import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building, FileText, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../componentes/ui/button';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../componentes/ui/card';
import { Alert, AlertDescription } from '../componentes/ui/alert';
import { Checkbox } from '../componentes/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../componentes/ui/select';

// =======================================================
// TIPOS Y INTERFACES
// =======================================================

interface FormularioRegistro {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  empresa: string;
  cargo: string;
  password: string;
  confirmarPassword: string;
  aceptarTerminos: boolean;
  recibirNotificaciones: boolean;
}

interface ErroresFormulario {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  empresa?: string;
  cargo?: string;
  password?: string;
  confirmarPassword?: string;
  aceptarTerminos?: string;
  general?: string;
}

// =======================================================
// CONSTANTES
// =======================================================

const CARGOS_DISPONIBLES = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'contador', label: 'Contador' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'otro', label: 'Otro' }
];

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const Registro: React.FC = () => {
  // Estados
  const [formulario, setFormulario] = useState<FormularioRegistro>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    empresa: '',
    cargo: '',
    password: '',
    confirmarPassword: '',
    aceptarTerminos: false,
    recibirNotificaciones: true
  });
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);

  // Hooks
  const { registrarUsuario, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  // =======================================================
  // EFECTOS
  // =======================================================

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (estaAutenticado) {
      navigate('/admin', { replace: true });
    }
  }, [estaAutenticado, navigate]);

  // =======================================================
  // FUNCIONES DE VALIDACIÓN
  // =======================================================

  const validarPaso1 = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};

    // Validar nombre
    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (formulario.nombre.length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    if (!formulario.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es requerido';
    } else if (formulario.apellido.length < 2) {
      nuevosErrores.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formulario.email.trim()) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formulario.email)) {
      nuevosErrores.email = 'Email inválido';
    }

    // Validar teléfono
    if (!formulario.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es requerido';
    } else if (!/^\d{9}$/.test(formulario.telefono.replace(/\D/g, ''))) {
      nuevosErrores.telefono = 'Teléfono inválido (9 dígitos)';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const validarPaso2 = (): boolean => {
    const nuevosErrores: ErroresFormulario = {};

    // Validar empresa
    if (!formulario.empresa.trim()) {
      nuevosErrores.empresa = 'El nombre de la empresa es requerido';
    } else if (formulario.empresa.length < 3) {
      nuevosErrores.empresa = 'El nombre de la empresa debe tener al menos 3 caracteres';
    }

    // Validar cargo
    if (!formulario.cargo) {
      nuevosErrores.cargo = 'El cargo es requerido';
    }

    // Validar password
    if (!formulario.password.trim()) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (formulario.password.length < 8) {
      nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formulario.password)) {
      nuevosErrores.password = 'La contraseña debe tener al menos una mayúscula, una minúscula y un número';
    }

    // Validar confirmar password
    if (!formulario.confirmarPassword.trim()) {
      nuevosErrores.confirmarPassword = 'Confirma tu contraseña';
    } else if (formulario.password !== formulario.confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    // Validar términos
    if (!formulario.aceptarTerminos) {
      nuevosErrores.aceptarTerminos = 'Debes aceptar los términos y condiciones';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // =======================================================
  // FUNCIONES DE MANEJO
  // =======================================================

  const manejarCambioFormulario = (campo: keyof FormularioRegistro, valor: any) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
    // Limpiar error específico
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    }
  };

  const manejarSiguientePaso = () => {
    if (pasoActual === 1 && validarPaso1()) {
      setPasoActual(2);
    }
  };

  const manejarPasoAnterior = () => {
    if (pasoActual === 2) {
      setPasoActual(1);
    }
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarPaso2()) return;

    setCargando(true);
    setErrores({});

    try {
      await registrarUsuario({
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        email: formulario.email.trim(),
        telefono: formulario.telefono.trim(),
        empresa: formulario.empresa.trim(),
        cargo: formulario.cargo,
        password: formulario.password,
        recibirNotificaciones: formulario.recibirNotificaciones
      });

      // Redirigir al login con mensaje de éxito
      navigate('/login', {
        state: {
          mensaje: 'Registro exitoso. Puedes iniciar sesión con tus credenciales.'
        }
      });
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      
      const mensajeError = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error al registrar usuario. Intenta nuevamente.';
      
      setErrores({ general: mensajeError });
    } finally {
      setCargando(false);
    }
  };

  // =======================================================
  // COMPONENTES DE RENDER
  // =======================================================

  const renderPaso1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="nombre"
              type="text"
              placeholder="Tu nombre"
              value={formulario.nombre}
              onChange={(e) => manejarCambioFormulario('nombre', e.target.value)}
              className={`pl-10 ${errores.nombre ? 'border-red-300' : ''}`}
              disabled={cargando}
            />
          </div>
          {errores.nombre && (
            <p className="text-sm text-red-600">{errores.nombre}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="apellido"
              type="text"
              placeholder="Tu apellido"
              value={formulario.apellido}
              onChange={(e) => manejarCambioFormulario('apellido', e.target.value)}
              className={`pl-10 ${errores.apellido ? 'border-red-300' : ''}`}
              disabled={cargando}
            />
          </div>
          {errores.apellido && (
            <p className="text-sm text-red-600">{errores.apellido}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
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

      {/* Teléfono */}
      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          type="tel"
          placeholder="999 123 456"
          value={formulario.telefono}
          onChange={(e) => manejarCambioFormulario('telefono', e.target.value)}
          className={errores.telefono ? 'border-red-300' : ''}
          disabled={cargando}
        />
        {errores.telefono && (
          <p className="text-sm text-red-600">{errores.telefono}</p>
        )}
      </div>

      <Button
        type="button"
        onClick={manejarSiguientePaso}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        disabled={cargando}
      >
        Continuar
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderPaso2 = () => (
    <div className="space-y-4">
      {/* Empresa */}
      <div className="space-y-2">
        <Label htmlFor="empresa">Empresa *</Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="empresa"
            type="text"
            placeholder="Nombre de tu empresa"
            value={formulario.empresa}
            onChange={(e) => manejarCambioFormulario('empresa', e.target.value)}
            className={`pl-10 ${errores.empresa ? 'border-red-300' : ''}`}
            disabled={cargando}
          />
        </div>
        {errores.empresa && (
          <p className="text-sm text-red-600">{errores.empresa}</p>
        )}
      </div>

      {/* Cargo */}
      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo *</Label>
        <Select
          value={formulario.cargo}
          onValueChange={(value) => manejarCambioFormulario('cargo', value)}
          disabled={cargando}
        >
          <SelectTrigger className={errores.cargo ? 'border-red-300' : ''}>
            <SelectValue placeholder="Selecciona tu cargo" />
          </SelectTrigger>
          <SelectContent>
            {CARGOS_DISPONIBLES.map((cargo) => (
              <SelectItem key={cargo.value} value={cargo.value}>
                {cargo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errores.cargo && (
          <p className="text-sm text-red-600">{errores.cargo}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña *</Label>
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
        <p className="text-xs text-gray-500">
          Mínimo 8 caracteres, incluye mayúscula, minúscula y número
        </p>
      </div>

      {/* Confirmar Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmarPassword">Confirmar Contraseña *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirmarPassword"
            type={mostrarConfirmarPassword ? 'text' : 'password'}
            placeholder="Confirma tu contraseña"
            value={formulario.confirmarPassword}
            onChange={(e) => manejarCambioFormulario('confirmarPassword', e.target.value)}
            className={`pl-10 pr-10 ${errores.confirmarPassword ? 'border-red-300' : ''}`}
            disabled={cargando}
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            disabled={cargando}
          >
            {mostrarConfirmarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errores.confirmarPassword && (
          <p className="text-sm text-red-600">{errores.confirmarPassword}</p>
        )}
      </div>

      {/* Términos y condiciones */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="aceptarTerminos"
            checked={formulario.aceptarTerminos}
            onCheckedChange={(checked) => manejarCambioFormulario('aceptarTerminos', checked)}
            disabled={cargando}
            className={errores.aceptarTerminos ? 'border-red-300' : ''}
          />
          <Label htmlFor="aceptarTerminos" className="text-sm leading-tight">
            Acepto los{' '}
            <Link to="/terminos" className="text-blue-600 hover:underline">
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link to="/privacidad" className="text-blue-600 hover:underline">
              política de privacidad
            </Link>
          </Label>
        </div>
        {errores.aceptarTerminos && (
          <p className="text-sm text-red-600">{errores.aceptarTerminos}</p>
        )}

        <div className="flex items-start space-x-2">
          <Checkbox
            id="recibirNotificaciones"
            checked={formulario.recibirNotificaciones}
            onCheckedChange={(checked) => manejarCambioFormulario('recibirNotificaciones', checked)}
            disabled={cargando}
          />
          <Label htmlFor="recibirNotificaciones" className="text-sm">
            Quiero recibir notificaciones sobre actualizaciones y nuevas funcionalidades
          </Label>
        </div>
      </div>

      {/* Botones */}
      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={manejarPasoAnterior}
          disabled={cargando}
          className="flex-1"
        >
          Anterior
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registrando...
            </>
          ) : (
            <>
              Crear Cuenta
              <CheckCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // =======================================================
  // RENDER PRINCIPAL
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
          <p className="text-gray-600">Crea tu cuenta gratuita</p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              pasoActual >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`h-1 w-8 ${pasoActual >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              pasoActual >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Formulario de registro */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {pasoActual === 1 ? 'Información Personal' : 'Información Profesional'}
            </CardTitle>
            <CardDescription className="text-center">
              {pasoActual === 1 
                ? 'Ingresa tus datos personales para comenzar'
                : 'Completa tu perfil profesional'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={manejarSubmit}>
              {/* Error general */}
              {errores.general && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errores.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Contenido del paso */}
              {pasoActual === 1 ? renderPaso1() : renderPaso2()}
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Inicia sesión aquí
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
            Prueba gratuita por 30 días
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Sin compromiso de permanencia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;