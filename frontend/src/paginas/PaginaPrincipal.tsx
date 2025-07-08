/**
 * Página Principal - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Landing page y página de bienvenida del sistema
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Package, 
  BarChart3,
  CheckCircle,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Play,
  Star,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  Award,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

interface PropiedadesFeature {
  id: string;
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
  color: string;
}

interface PropiedadesTestimonio {
  id: string;
  nombre: string;
  empresa: string;
  rol: string;
  testimonio: string;
  avatar: string;
  rating: number;
}

interface PropiedadesPlan {
  id: string;
  nombre: string;
  precio: number;
  periodo: string;
  descripcion: string;
  caracteristicas: string[];
  destacado?: boolean;
  color: string;
}

// =======================================================
// DATOS MOCK
// =======================================================

const features: PropiedadesFeature[] = [
  {
    id: 'facturacion',
    icono: <FileText className="h-8 w-8" />,
    titulo: 'Facturación Electrónica',
    descripcion: 'Emisión automática de facturas, boletas y notas según normativa SUNAT',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'inventario',
    icono: <Package className="h-8 w-8" />,
    titulo: 'Control de Inventario',
    descripcion: 'Gestión completa de stock con método PEPS y alertas automáticas',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'clientes',
    icono: <Users className="h-8 w-8" />,
    titulo: 'Gestión de Clientes',
    descripcion: 'Base de datos completa con historial de compras y estados de cuenta',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'reportes',
    icono: <BarChart3 className="h-8 w-8" />,
    titulo: 'Reportes Avanzados',
    descripcion: 'Analytics completo con reportes PLE y dashboards ejecutivos',
    color: 'from-orange-500 to-orange-600'
  }
];

const testimonios: PropiedadesTestimonio[] = [
  {
    id: '1',
    nombre: 'María González',
    empresa: 'Distribuidora Lima Norte',
    rol: 'Gerente General',
    testimonio: 'FELICITAFAC nos ayudó a automatizar completamente nuestra facturación. Ahora procesamos el triple de documentos en menos tiempo.',
    avatar: 'MG',
    rating: 5
  },
  {
    id: '2',
    nombre: 'Carlos Mendoza',
    empresa: 'Servicios Integrales SAC',
    rol: 'Contador',
    testimonio: 'La integración con SUNAT es perfecta. Los reportes PLE se generan automáticamente y el soporte es excelente.',
    avatar: 'CM',
    rating: 5
  },
  {
    id: '3',
    nombre: 'Ana Rodríguez',
    empresa: 'Comercial El Progreso',
    rol: 'Administradora',
    testimonio: 'Interface muy intuitiva y fácil de usar. Nuestro equipo se adaptó rápidamente y ahora trabajamos más eficientemente.',
    avatar: 'AR',
    rating: 5
  }
];

const planes: PropiedadesPlan[] = [
  {
    id: 'basico',
    nombre: 'Básico',
    precio: 89,
    periodo: 'mes',
    descripcion: 'Perfecto para pequeños negocios',
    caracteristicas: [
      'Hasta 100 documentos/mes',
      'Facturación electrónica SUNAT',
      'Gestión básica de clientes',
      'Reportes estándar',
      'Soporte por email'
    ],
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'profesional',
    nombre: 'Profesional',
    precio: 159,
    periodo: 'mes',
    descripcion: 'Para empresas en crecimiento',
    caracteristicas: [
      'Hasta 500 documentos/mes',
      'Control de inventario PEPS',
      'Múltiples usuarios',
      'Reportes PLE automáticos',
      'Soporte telefónico',
      'Integración contable'
    ],
    destacado: true,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'empresarial',
    nombre: 'Empresarial',
    precio: 299,
    periodo: 'mes',
    descripcion: 'Solución completa para empresas',
    caracteristicas: [
      'Documentos ilimitados',
      'Múltiples sucursales',
      'API personalizada',
      'Dashboard ejecutivo',
      'Soporte prioritario 24/7',
      'Consultoría gratuita'
    ],
    color: 'from-purple-500 to-purple-600'
  }
];

// =======================================================
// COMPONENTES
// =======================================================

const ComponenteFeature: React.FC<{ feature: PropiedadesFeature }> = ({ feature }) => (
  <div className="group relative">
    <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      <div className={cn(
        'p-4 rounded-2xl bg-gradient-to-br text-white mb-6 group-hover:scale-110 transition-transform duration-300',
        feature.color
      )}>
        {feature.icono}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.titulo}</h3>
      <p className="text-gray-600 leading-relaxed">{feature.descripcion}</p>
    </div>
  </div>
);

const ComponenteTestimonio: React.FC<{ testimonio: PropiedadesTestimonio }> = ({ testimonio }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    <div className="flex items-center mb-6">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
        {testimonio.avatar}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{testimonio.nombre}</h4>
        <p className="text-sm text-gray-600">{testimonio.rol}</p>
        <p className="text-sm text-blue-600 font-medium">{testimonio.empresa}</p>
      </div>
    </div>
    
    <div className="flex mb-4">
      {Array.from({ length: testimonio.rating }).map((_, i) => (
        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
      ))}
    </div>
    
    <blockquote className="text-gray-700 italic leading-relaxed">
      "{testimonio.testimonio}"
    </blockquote>
  </div>
);

const ComponentePlan: React.FC<{ plan: PropiedadesPlan }> = ({ plan }) => (
  <div className={cn(
    'relative bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-300',
    plan.destacado && 'ring-2 ring-blue-500 scale-105'
  )}>
    {plan.destacado && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
          Más Popular
        </span>
      </div>
    )}
    
    <div className="text-center mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.nombre}</h3>
      <p className="text-gray-600 mb-6">{plan.descripcion}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">S/ {plan.precio}</span>
        <span className="text-gray-600">/{plan.periodo}</span>
      </div>
    </div>
    
    <ul className="space-y-4 mb-8">
      {plan.caracteristicas.map((caracteristica, index) => (
        <li key={index} className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-gray-700">{caracteristica}</span>
        </li>
      ))}
    </ul>
    
    <button className={cn(
      'w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300',
      plan.destacado
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
    )}>
      Comenzar Prueba Gratuita
    </button>
  </div>
);

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const PaginaPrincipal: React.FC = () => {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const { estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (estaAutenticado && usuario) {
      const redireccion = usuario.rol_detalle?.codigo === 'administrador' 
        ? '/admin' 
        : '/dashboard';
      navigate(redireccion);
    }
  }, [estaAutenticado, usuario, navigate]);

  const handleComenzarDemo = () => {
    navigate('/login');
  };

  const handleComenzarPrueba = () => {
    navigate('/registro');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">FELICITAFAC</h1>
                <p className="text-xs text-gray-500">Facturación Electrónica</p>
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#caracteristicas" className="text-gray-600 hover:text-gray-900 transition-colors">
                Características
              </a>
              <a href="#testimonios" className="text-gray-600 hover:text-gray-900 transition-colors">
                Testimonios
              </a>
              <a href="#precios" className="text-gray-600 hover:text-gray-900 transition-colors">
                Precios
              </a>
              <a href="#contacto" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contacto
              </a>
            </nav>

            {/* Botones de acción */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <button
                onClick={handleComenzarPrueba}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Prueba Gratuita
              </button>
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="md:hidden p-2 text-gray-600"
            >
              {menuMovilAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuMovilAbierto && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <a href="#caracteristicas" className="block text-gray-600">Características</a>
              <a href="#testimonios" className="block text-gray-600">Testimonios</a>
              <a href="#precios" className="block text-gray-600">Precios</a>
              <a href="#contacto" className="block text-gray-600">Contacto</a>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link to="/login" className="block text-gray-600">Iniciar Sesión</Link>
                <button
                  onClick={handleComenzarPrueba}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg"
                >
                  Prueba Gratuita
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Facturación Electrónica
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Simple y Poderosa
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Sistema completo de facturación electrónica para Perú. Cumple 100% con SUNAT, 
              gestiona tu inventario y lleva tu contabilidad de forma automática.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleComenzarDemo}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center"
              >
                <Play className="h-5 w-5 mr-2" />
                Ver Demo en Vivo
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={handleComenzarPrueba}
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                Iniciar Prueba Gratuita
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Prueba gratuita 30 días
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-2" />
                100% seguro
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-green-500 mr-2" />
                Configuración rápida
              </div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              FELICITAFAC incluye todas las herramientas que tu empresa necesita para 
              gestionar la facturación electrónica de forma eficiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <ComponenteFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Miles de empresas confían en FELICITAFAC para su facturación diaria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonios.map((testimonio) => (
              <ComponenteTestimonio key={testimonio.id} testimonio={testimonio} />
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planes diseñados para tu crecimiento
            </h2>
            <p className="text-xl text-gray-600">
              Comienza gratis y escala según las necesidades de tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {planes.map((plan) => (
              <ComponentePlan key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para revolucionar tu facturación?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de empresas que ya confían en FELICITAFAC
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleComenzarPrueba}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              Comenzar Prueba Gratuita
            </button>
            <button
              onClick={handleComenzarDemo}
              className="text-white border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Solicitar Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xl font-bold">FELICITAFAC</h3>
                  <p className="text-sm text-gray-400">Facturación Electrónica</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Sistema completo de facturación electrónica para Perú. 
                Simplificamos tu gestión empresarial con tecnología de vanguardia.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-400">+51 999 123 456</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-400">info@felicitafac.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-400">Lima, Perú</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-400">Lun - Vie: 9AM - 6PM</span>
                </div>
              </div>
            </div>

            {/* Enlaces */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Útiles</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Documentación
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Soporte Técnico
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Términos de Uso
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FELICITAFAC. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaginaPrincipal;