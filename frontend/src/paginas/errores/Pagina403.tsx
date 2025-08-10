import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Shield, FileText, Lock } from 'lucide-react';
import { Button } from '../../componentes/ui/button';
import { Card, CardContent } from '../../componentes/ui/card';
import { useAuth } from '../../hooks/useAuth';

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const Pagina403: React.FC = () => {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();

  const handleVolverAtras = () => {
    navigate(-1);
  };

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    navigate('/login');
  };

  const getRolDisplay = (rol: string) => {
    const roles = {
      'administrador': 'Administrador',
      'contador': 'Contador',
      'vendedor': 'Vendedor',
      'cliente': 'Cliente'
    };
    return roles[rol as keyof typeof roles] || rol;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-6">
              <FileText className="h-8 w-8 text-white" />
            </div>

            {/* Icono de acceso denegado */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <Lock className="h-12 w-12 text-red-600" />
            </div>

            {/* Título y mensaje */}
            <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              No tienes permisos suficientes para acceder a esta página. 
              Esta funcionalidad está restringida a ciertos roles de usuario.
            </p>

            {/* Información del usuario actual */}
            {usuario && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">
                    Usuario Actual
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> {usuario.email}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Rol:</strong> {getRolDisplay(usuario.rol)}
                </p>
              </div>
            )}

            {/* Información de permisos */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                ¿Necesitas acceso?
              </h3>
              <p className="text-xs text-yellow-700">
                Si crees que deberías tener acceso a esta funcionalidad, 
                contacta al administrador del sistema para solicitar 
                los permisos correspondientes.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button
                onClick={handleVolverAtras}
                variant="outline"
                className="inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver Atrás
              </Button>
              
              <Link to={usuario ? '/dashboard' : '/'}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Home className="mr-2 h-4 w-4" />
                  {usuario ? 'Ir al Dashboard' : 'Ir al Inicio'}
                </Button>
              </Link>
            </div>

            {/* Opción de cerrar sesión */}
            {usuario && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                  ¿Necesitas acceder con una cuenta diferente?
                </p>
                <Button
                  onClick={handleCerrarSesion}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            )}

            {/* Información de contacto */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                ¿Problemas de acceso? Contáctanos:
              </p>
              <p className="text-sm text-gray-700 mt-1">
                📧 soporte@felicitafac.com
              </p>
              <p className="text-sm text-gray-700">
                📞 +51 999 123 456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pagina403;