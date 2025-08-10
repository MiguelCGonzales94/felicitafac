import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../componentes/ui/button';
import { Input } from '../componentes/ui/input';
import { Label } from '../componentes/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../componentes/ui/card';
import { Alert, AlertDescription } from '../componentes/ui/alert';

// =======================================================
// TIPOS Y INTERFACES
// =======================================================

interface FormularioRecuperacion {
  email: string;
}

interface ErroresFormulario {
  email?: string;
  general?: string;
}

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const RecuperarPassword: React.FC = () => {
  // Estados
  const [formulario, setFormulario] = useState<FormularioRecuperacion>({
    email: ''
  });
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [cargando, setCargando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [tiempoEspera, setTiempoEspera] = useState(0);

  // Hooks
  const navigate = useNavigate();

  // =======================================================
  // EFECTOS
  // =======================================================

  // Contador de tiempo de espera
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tiempoEspera > 0) {
      interval = setInterval(() => {
        setTiempoEspera((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tiempoEspera]);

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

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarCambioFormulario = (campo: keyof FormularioRecuperacion, valor: string) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
    // Limpiar error específico
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    }
  };

  const enviarEmailRecuperacion = async (email: string): Promise<void> => {
    // Simular API call - reemplazar con llamada real
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular diferentes escenarios
        if (email === 'error@test.com') {
          reject(new Error('Email no encontrado en el sistema'));
        } else {
          resolve();
        }
      }, 2000);
    });
  };

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setCargando(true);
    setErrores({});

    try {
      await enviarEmailRecuperacion(formulario.email.trim());
      
      setEmailEnviado(true);
      setTiempoEspera(60); // 60 segundos de espera
      
    } catch (error: any) {
      console.error('Error al enviar email de recuperación:', error);
      
      const mensajeError = error.message || 
                          'Error al enviar email de recuperación. Intenta nuevamente.';
      
      setErrores({ general: mensajeError });
    } finally {
      setCargando(false);
    }
  };

  const manejarReenviarEmail = async () => {
    if (tiempoEspera > 0) return;
    
    setCargando(true);
    setErrores({});

    try {
      await enviarEmailRecuperacion(formulario.email.trim());
      setTiempoEspera(60); // Reiniciar contador
    } catch (error: any) {
      console.error('Error al reenviar email:', error);
      setErrores({ general: 'Error al reenviar email. Intenta nuevamente.' });
    } finally {
      setCargando(false);
    }
  };

  const handleVolverLogin = () => {
    navigate('/login');
  };

  // =======================================================
  // COMPONENTES DE RENDER
  // =======================================================

  const renderFormularioRecuperacion = () => (
    <form onSubmit={manejarSubmit} className="space-y-6">
      {/* Error general */}
      {errores.general && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errores.general}
          </AlertDescription>
        </Alert>
      )}

      {/* Instrucciones */}
      <div className="text-center space-y-2">
        <p className="text-gray-600">
          Ingresa tu dirección de email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

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
            autoFocus
          />
        </div>
        {errores.email && (
          <p className="text-sm text-red-600">{errores.email}</p>
        )}
      </div>

      {/* Botón de envío */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        disabled={cargando}
      >
        {cargando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Enviando...
          </>
        ) : (
          <>
            Enviar Email de Recuperación
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Enlace para volver */}
      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleVolverLogin}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesión
        </Button>
      </div>
    </form>
  );

  const renderEmailEnviado = () => (
    <div className="space-y-6 text-center">
      {/* Icono de éxito */}
      <div className="flex justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Mensaje de éxito */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          ¡Email Enviado!
        </h3>
        <p className="text-gray-600">
          Hemos enviado un enlace de recuperación a:
        </p>
        <p className="font-medium text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
          {formulario.email}
        </p>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside text-left">
          <li>Revisa tu bandeja de entrada (y spam)</li>
          <li>Haz clic en el enlace del email</li>
          <li>Crea tu nueva contraseña</li>
          <li>Inicia sesión con tus nuevas credenciales</li>
        </ol>
      </div>

      {/* Botón de reenvío */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          ¿No recibiste el email?
        </p>
        <Button
          onClick={manejarReenviarEmail}
          variant="outline"
          disabled={cargando || tiempoEspera > 0}
          className="w-full"
        >
          {cargando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              Reenviando...
            </>
          ) : tiempoEspera > 0 ? (
            `Reenviar en ${tiempoEspera}s`
          ) : (
            <>
              Reenviar Email
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Contacto y volver */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          ¿Problemas para recuperar tu cuenta?
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            📧 soporte@felicitafac.com
          </p>
          <p className="text-sm text-gray-600">
            📞 +51 999 123 456
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={handleVolverLogin}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesión
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
          <p className="text-gray-600">
            {emailEnviado ? 'Revisa tu email' : 'Recuperar contraseña'}
          </p>
        </div>

        {/* Tarjeta principal */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {emailEnviado ? 'Email Enviado' : 'Recuperar Contraseña'}
            </CardTitle>
            <CardDescription className="text-center">
              {emailEnviado 
                ? 'Sigue las instrucciones del email para continuar'
                : 'Te ayudamos a recuperar el acceso a tu cuenta'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {emailEnviado ? renderEmailEnviado() : renderFormularioRecuperacion()}
          </CardContent>
        </Card>

        {/* Información adicional */}
        {!emailEnviado && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              El enlace de recuperación expira en 24 horas
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Por tu seguridad, solo se puede usar una vez
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecuperarPassword;