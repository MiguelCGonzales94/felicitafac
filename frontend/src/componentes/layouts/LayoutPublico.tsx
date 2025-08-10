/**
 * Layout Público - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Layout para páginas públicas (login, registro, landing, etc.)
 */

import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Shield, Zap, Users, BarChart3, Settings, ArrowRight, Check } from 'lucide-react';
import { cn } from '../utils/cn';

// =======================================================
// INTERFACES
// =======================================================

export interface PropiedadesLayoutPublico {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  centered?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  background?: 'default' | 'gradient' | 'pattern';
  className?: string;
}

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================

/**
 * Header público
 */
const HeaderPublico: React.FC<{ mostrarNavegacion?: boolean }> = ({ 
  mostrarNavegacion = true 
}) => {
  const location = useLocation();
  
  const enlaces = [
    { href: '/', label: 'Inicio' },
    { href: '/caracteristicas', label: 'Características' },
    { href: '/precios', label: 'Precios' },
    { href: '/soporte', label: 'Soporte' },
  ];
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FELICITAFAC</h1>
              <p className="text-xs text-gray-500 -mt-1">Facturación Electrónica</p>
            </div>
          </Link>
          
          {/* Navegación */}
          {mostrarNavegacion && (
            <nav className="hidden md:flex items-center space-x-8">
              {enlaces.map((enlace) => (
                <Link
                  key={enlace.href}
                  to={enlace.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-blue-600',
                    location.pathname === enlace.href 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-4' 
                      : 'text-gray-700'
                  )}
                >
                  {enlace.label}
                </Link>
              ))}
            </nav>
          )}
          
          {/* Botones de acción */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Prueba Gratuita
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * Footer público
 */
const FooterPublico: React.FC = () => {
  const year = new Date().getFullYear();
  
  const enlaces = {
    producto: [
      { label: 'Características', href: '/caracteristicas' },
      { label: 'Precios', href: '/precios' },
      { label: 'Integraciones', href: '/integraciones' },
      { label: 'API', href: '/api' },
    ],
    empresa: [
      { label: 'Acerca de', href: '/acerca' },
      { label: 'Blog', href: '/blog' },
      { label: 'Carreras', href: '/carreras' },
      { label: 'Contacto', href: '/contacto' },
    ],
    soporte: [
      { label: 'Centro de Ayuda', href: '/ayuda' },
      { label: 'Documentación', href: '/docs' },
      { label: 'Estado del Sistema', href: '/estado' },
      { label: 'Contactar Soporte', href: '/soporte' },
    ],
    legal: [
      { label: 'Términos de Uso', href: '/terminos' },
      { label: 'Política de Privacidad', href: '/privacidad' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Cumplimiento SUNAT', href: '/cumplimiento' },
    ],
  };
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Información de la empresa */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">FELICITAFAC</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              La solución más completa para facturación electrónica en Perú. 
              Cumple con todas las normativas SUNAT.
            </p>
            <div className="mt-4 flex space-x-4">
              <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-xs">📧</span>
              </div>
              <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-xs">📱</span>
              </div>
              <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-xs">🌐</span>
              </div>
            </div>
          </div>
          
          {/* Enlaces organizados */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(enlaces).map(([categoria, items]) => (
              <div key={categoria}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                  {categoria}
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Línea divisoria */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {year} FELICITAFAC. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Hecho en Perú 🇵🇪</span>
              <span className="text-gray-400 text-sm">|</span>
              <span className="text-gray-400 text-sm">SUNAT Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

/**
 * Hero section para landing
 */
const HeroSection: React.FC = () => (
  <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
    {/* Decoración de fondo */}
    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl opacity-10 transform translate-x-48 -translate-y-48" />
    
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Facturación Electrónica
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {' '}Inteligente
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          La plataforma más completa para emisión de documentos electrónicos en Perú. 
          100% compatible con SUNAT, fácil de usar y diseñada para hacer crecer tu negocio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/registro"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Comenzar Gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all shadow-md hover:shadow-lg"
          >
            Ver Demo
          </Link>
        </div>
        
        {/* Insignias de confianza */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>30 días gratis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Sin permanencia</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Soporte 24/7</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Certificado SUNAT</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/**
 * Sección de características
 */
const SeccionCaracteristicas: React.FC = () => {
  const caracteristicas = [
    {
      icono: <FileText className="h-8 w-8" />,
      titulo: 'Facturación Completa',
      descripcion: 'Emite facturas, boletas, notas de crédito y débito con total cumplimiento SUNAT.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icono: <Shield className="h-8 w-8" />,
      titulo: 'Seguridad Garantizada',
      descripcion: 'Certificados digitales, encriptación y respaldos automáticos para proteger tu información.',
      color: 'from-green-500 to-green-600',
    },
    {
      icono: <Zap className="h-8 w-8" />,
      titulo: 'Automatización Total',
      descripcion: 'Contabilidad automática, inventarios PEPS y reportes PLE generados al instante.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icono: <Users className="h-8 w-8" />,
      titulo: 'Multi-usuario',
      descripcion: 'Roles y permisos personalizados para equipos de trabajo colaborativo.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icono: <BarChart3 className="h-8 w-8" />,
      titulo: 'Reportes Avanzados',
      descripcion: 'Dashboard ejecutivo con métricas en tiempo real y analytics de negocio.',
      color: 'from-pink-500 to-red-500',
    },
    {
      icono: <Settings className="h-8 w-8" />,
      titulo: 'Fácil Configuración',
      descripcion: 'Setup rápido en minutos con importación de datos y configuración asistida.',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];
  
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas para facturar
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Una plataforma completa que se adapta a las necesidades de tu empresa
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caracteristicas.map((caracteristica, index) => (
            <div
              key={index}
              className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
            >
              <div className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-r text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform',
                caracteristica.color
              )}>
                {caracteristica.icono}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {caracteristica.titulo}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {caracteristica.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// =======================================================
// COMPONENTE LAYOUT PÚBLICO PRINCIPAL
// =======================================================

const LayoutPublico: React.FC<PropiedadesLayoutPublico> = ({
  children,
  title = 'FELICITAFAC - Facturación Electrónica para Perú',
  description = 'La plataforma más completa para facturación electrónica en Perú. 100% compatible con SUNAT.',
  showHeader = true,
  showFooter = true,
  centered = false,
  maxWidth = 'full',
  background = 'default',
  className,
}) => {
  const location = useLocation();
  
  // Configuración de clases CSS
  const backgroundClasses = {
    default: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    pattern: 'bg-gray-50 bg-grid-pattern',
  };
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg', 
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };
  
  const containerClasses = cn(
    'min-h-screen flex flex-col',
    backgroundClasses[background],
    className
  );
  
  const mainClasses = cn(
    'flex-1',
    centered && 'flex items-center justify-center',
    !showHeader && !showFooter && 'min-h-screen'
  );
  
  const contentClasses = cn(
    'w-full mx-auto px-4 sm:px-6 lg:px-8',
    centered ? maxWidthClasses[maxWidth] : 'max-w-7xl',
    centered && 'py-8'
  );
  
  // Verificar si es la página de inicio para mostrar contenido especial
  const esInicio = location.pathname === '/';
  
  return (
    <>
      {/* Meta tags */}
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="facturación electrónica, SUNAT, Perú, software contable, emisión electrónica" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* Favicons y otros meta tags */}
        <link rel="canonical" href={`https://felicitafac.com${location.pathname}`} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="FELICITAFAC Team" />
        <meta name="language" content="es-PE" />
        <meta name="geo.region" content="PE" />
        <meta name="geo.country" content="Peru" />
      </Helmet>
      
      <div className={containerClasses}>
        {/* Header */}
        {showHeader && (
          <HeaderPublico mostrarNavegacion={!centered} />
        )}
        
        {/* Contenido principal */}
        <main className={mainClasses}>
          {esInicio ? (
            /* Contenido específico de la página de inicio */
            <>
              <HeroSection />
              <SeccionCaracteristicas />
              {children}
            </>
          ) : (
            /* Contenido de otras páginas */
            <div className={contentClasses}>
              {children || <Outlet />}
            </div>
          )}
        </main>
        
        {/* Footer */}
        {showFooter && <FooterPublico />}
      </div>
    </>
  );
};

// =======================================================
// VARIANTES ESPECÍFICAS DEL LAYOUT
// =======================================================

/**
 * Layout para páginas de autenticación (login, registro)
 */
export const LayoutAuth: React.FC<PropiedadesLayoutPublico> = ({ 
  children, 
  ...props 
}) => (
  <LayoutPublico
    showHeader={false}
    showFooter={false}
    centered={true}
    maxWidth="md"
    background="gradient"
    {...props}
  >
    {children}
  </LayoutPublico>
);

/**
 * Layout para landing page
 */
export const LayoutLanding: React.FC<PropiedadesLayoutPublico> = ({ 
  children, 
  ...props 
}) => (
  <LayoutPublico
    showHeader={true}
    showFooter={true}
    centered={false}
    background="default"
    {...props}
  >
    {children}
  </LayoutPublico>
);

/**
 * Layout para páginas de contenido (términos, privacidad, etc.)
 */
export const LayoutContenido: React.FC<PropiedadesLayoutPublico> = ({ 
  children, 
  ...props 
}) => (
  <LayoutPublico
    showHeader={true}
    showFooter={true}
    centered={false}
    maxWidth="2xl"
    background="default"
    className="py-12"
    {...props}
  >
    <div className="prose prose-lg max-w-none">
      {children}
    </div>
  </LayoutPublico>
);

// =======================================================
// EXPORTACIONES
// =======================================================

export default LayoutPublico;