import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../../componentes/ui/button';
import { Card, CardContent } from '../../componentes/ui/card';

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const Pagina404: React.FC = () => {
  const navigate = useNavigate();

  const handleVolverAtras = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-6">
              <FileText className="h-8 w-8 text-white" />
            </div>

            {/* Icono de error */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>

            {/* Título y mensaje */}
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Página No Encontrada
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Lo sentimos, la página que estás buscando no existe o ha sido movida. 
              Verifica la URL o regresa al inicio para continuar navegando.
            </p>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleVolverAtras}
                variant="outline"
                className="inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver Atrás
              </Button>
              
              <Link to="/">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Ir al Inicio
                </Button>
              </Link>
            </div>

            {/* Enlaces útiles */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Páginas más visitadas:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Crear Cuenta
                </Link>
                <Link 
                  to="/soporte" 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Soporte
                </Link>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                ¿Necesitas ayuda? Contáctanos:
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

export default Pagina404;