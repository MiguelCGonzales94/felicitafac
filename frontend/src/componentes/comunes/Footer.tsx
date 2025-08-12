/**
 * Footer - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Pie de página con información de la empresa y enlaces
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Mail, Phone, MapPin, ExternalLink, 
  Shield, Heart, Globe, Github, Twitter, Linkedin,
  Building, Users, Package, Calculator, BookOpen,
  Clock, CheckCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/bagde';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface PropiedadesFooter {
  variant?: 'default' | 'minimal' | 'completo';
  mostrarInformacionEmpresa?: boolean;
  mostrarEnlacesRapidos?: boolean;
  mostrarRedesSociales?: boolean;
  mostrarEstadisticas?: boolean;
  mostrarSoporte?: boolean;
  className?: string;
  tema?: 'claro' | 'oscuro';
  compacto?: boolean;
}

interface EnlaceFooter {
  titulo: string;
  href: string;
  externo?: boolean;
  icono?: React.ReactNode;
}

interface SeccionFooter {
  titulo: string;
  enlaces: EnlaceFooter[];
}

interface EstadisticaFooter {
  label: string;
  valor: string | number;
  icono: React.ReactNode;
  color?: string;
}

// =======================================================
// CONFIGURACIÓN
// =======================================================

const INFORMACION_EMPRESA = {
  nombre: 'FELICITAFAC',
  descripcion: 'Sistema de Facturación Electrónica líder en Perú',
  direccion: 'Av. Javier Prado Este 123, San Isidro, Lima',
  telefono: '+51 999 888 777',
  email: 'contacto@felicitafac.com',
  website: 'https://felicitafac.com',
  ruc: '20123456789',
  razonSocial: 'FELICITAFAC SOLUTIONS S.A.C.'
};

const SECCIONES_ENLACES: SeccionFooter[] = [
  {
    titulo: 'Productos',
    enlaces: [
      { titulo: 'Facturación Electrónica', href: '/productos/facturacion', icono: <FileText className="h-4 w-4" /> },
      { titulo: 'Punto de Venta', href: '/productos/pos', icono: <Package className="h-4 w-4" /> },
      { titulo: 'Gestión de Inventarios', href: '/productos/inventario', icono: <Package className="h-4 w-4" /> },
      { titulo: 'Reportes SUNAT', href: '/productos/reportes', icono: <Calculator className="h-4 w-4" /> }
    ]
  },
  {
    titulo: 'Empresa',
    enlaces: [
      { titulo: 'Acerca de Nosotros', href: '/empresa/nosotros', icono: <Building className="h-4 w-4" /> },
      { titulo: 'Nuestro Equipo', href: '/empresa/equipo', icono: <Users className="h-4 w-4" /> },
      { titulo: 'Casos de Éxito', href: '/empresa/casos', icono: <CheckCircle className="h-4 w-4" /> },
      { titulo: 'Trabajar con Nosotros', href: '/empresa/carreras', icono: <Heart className="h-4 w-4" /> }
    ]
  },
  {
    titulo: 'Soporte',
    enlaces: [
      { titulo: 'Centro de Ayuda', href: '/soporte/ayuda', icono: <BookOpen className="h-4 w-4" /> },
      { titulo: 'Documentación', href: '/soporte/docs', icono: <FileText className="h-4 w-4" /> },
      { titulo: 'Contactar Soporte', href: '/soporte/contacto', icono: <Mail className="h-4 w-4" /> },
      { titulo: 'Estado del Sistema', href: '/soporte/estado', icono: <CheckCircle className="h-4 w-4" /> }
    ]
  },
  {
    titulo: 'Legal',
    enlaces: [
      { titulo: 'Términos de Servicio', href: '/legal/terminos', icono: <Shield className="h-4 w-4" /> },
      { titulo: 'Política de Privacidad', href: '/legal/privacidad', icono: <Shield className="h-4 w-4" /> },
      { titulo: 'Política de Cookies', href: '/legal/cookies', icono: <Shield className="h-4 w-4" /> },
      { titulo: 'Compliance SUNAT', href: '/legal/sunat', icono: <CheckCircle className="h-4 w-4" /> }
    ]
  }
];

const REDES_SOCIALES = [
  { 
    nombre: 'LinkedIn', 
    href: 'https://linkedin.com/company/felicitafac', 
    icono: <Linkedin className="h-5 w-5" />,
    color: 'text-blue-600 hover:text-blue-700'
  },
  { 
    nombre: 'Twitter', 
    href: 'https://twitter.com/felicitafac', 
    icono: <Twitter className="h-5 w-5" />,
    color: 'text-sky-500 hover:text-sky-600'
  },
  { 
    nombre: 'GitHub', 
    href: 'https://github.com/felicitafac', 
    icono: <Github className="h-5 w-5" />,
    color: 'text-gray-700 hover:text-gray-800'
  }
];

const ESTADISTICAS_EJEMPLO: EstadisticaFooter[] = [
  { 
    label: 'Documentos Procesados', 
    valor: '2.5M+', 
    icono: <FileText className="h-4 w-4" />,
    color: 'text-blue-600'
  },
  { 
    label: 'Empresas Atendidas', 
    valor: '15,000+', 
    icono: <Building className="h-4 w-4" />,
    color: 'text-green-600'
  },
  { 
    label: 'Uptime del Sistema', 
    valor: '99.9%', 
    icono: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-600'
  },
  { 
    label: 'Soporte 24/7', 
    valor: 'Activo', 
    icono: <Clock className="h-4 w-4" />,
    color: 'text-orange-600'
  }
];

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================

const InformacionEmpresa: React.FC<{ tema: 'claro' | 'oscuro' }> = ({ tema }) => (
  <div className="space-y-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-blue-600 rounded-lg">
        <FileText className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className={cn(
          "text-lg font-bold",
          tema === 'oscuro' ? "text-white" : "text-gray-900"
        )}>
          {INFORMACION_EMPRESA.nombre}
        </h3>
        <p className={cn(
          "text-sm",
          tema === 'oscuro' ? "text-gray-300" : "text-gray-600"
        )}>
          {INFORMACION_EMPRESA.descripcion}
        </p>
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm">
        <MapPin className={cn(
          "h-4 w-4 flex-shrink-0",
          tema === 'oscuro' ? "text-gray-400" : "text-gray-500"
        )} />
        <span className={cn(
          tema === 'oscuro' ? "text-gray-300" : "text-gray-600"
        )}>
          {INFORMACION_EMPRESA.direccion}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 text-sm">
        <Phone className={cn(
          "h-4 w-4 flex-shrink-0",
          tema === 'oscuro' ? "text-gray-400" : "text-gray-500"
        )} />
        <a 
          href={`tel:${INFORMACION_EMPRESA.telefono}`}
          className={cn(
            "hover:underline",
            tema === 'oscuro' ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          {INFORMACION_EMPRESA.telefono}
        </a>
      </div>
      
      <div className="flex items-center space-x-2 text-sm">
        <Mail className={cn(
          "h-4 w-4 flex-shrink-0",
          tema === 'oscuro' ? "text-gray-400" : "text-gray-500"
        )} />
        <a 
          href={`mailto:${INFORMACION_EMPRESA.email}`}
          className={cn(
            "hover:underline",
            tema === 'oscuro' ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          {INFORMACION_EMPRESA.email}
        </a>
      </div>
    </div>

    <div className="flex items-center space-x-3">
      <Badge variant="secondary" className="text-xs">
        RUC: {INFORMACION_EMPRESA.ruc}
      </Badge>
      <Badge variant="outline" className="text-xs">
        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
        Certificado SUNAT
      </Badge>
    </div>
  </div>
);

const SeccionEnlaces: React.FC<{ 
  seccion: SeccionFooter; 
  tema: 'claro' | 'oscuro' 
}> = ({ seccion, tema }) => (
  <div className="space-y-3">
    <h4 className={cn(
      "text-sm font-semibold uppercase tracking-wide",
      tema === 'oscuro' ? "text-gray-200" : "text-gray-900"
    )}>
      {seccion.titulo}
    </h4>
    <ul className="space-y-2">
      {seccion.enlaces.map((enlace, index) => (
        <li key={index}>
          <Link
            to={enlace.href}
            className={cn(
              "text-sm flex items-center space-x-2 hover:underline transition-colors",
              tema === 'oscuro' 
                ? "text-gray-400 hover:text-white" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {enlace.icono && (
              <span className="flex-shrink-0">
                {enlace.icono}
              </span>
            )}
            <span>{enlace.titulo}</span>
            {enlace.externo && (
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            )}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const RedesSociales: React.FC<{ tema: 'claro' | 'oscuro' }> = ({ tema }) => (
  <div className="space-y-3">
    <h4 className={cn(
      "text-sm font-semibold uppercase tracking-wide",
      tema === 'oscuro' ? "text-gray-200" : "text-gray-900"
    )}>
      Síguenos
    </h4>
    <div className="flex space-x-3">
      {REDES_SOCIALES.map((red, index) => (
        <a
          key={index}
          href={red.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "p-2 rounded-lg transition-colors",
            tema === 'oscuro' 
              ? "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
              : "bg-gray-100 hover:bg-gray-200",
            red.color
          )}
          aria-label={red.nombre}
        >
          {red.icono}
        </a>
      ))}
    </div>
  </div>
);

const EstadisticasFooter: React.FC<{ tema: 'claro' | 'oscuro' }> = ({ tema }) => (
  <div className="space-y-3">
    <h4 className={cn(
      "text-sm font-semibold uppercase tracking-wide",
      tema === 'oscuro' ? "text-gray-200" : "text-gray-900"
    )}>
      En Números
    </h4>
    <div className="grid grid-cols-2 gap-3">
      {ESTADISTICAS_EJEMPLO.map((stat, index) => (
        <div key={index} className="text-center space-y-1">
          <div className={cn("flex justify-center", stat.color)}>
            {stat.icono}
          </div>
          <div className={cn(
            "text-lg font-bold",
            tema === 'oscuro' ? "text-white" : "text-gray-900"
          )}>
            {stat.valor}
          </div>
          <div className={cn(
            "text-xs",
            tema === 'oscuro' ? "text-gray-400" : "text-gray-600"
          )}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const Footer: React.FC<PropiedadesFooter> = ({
  variant = 'default',
  mostrarInformacionEmpresa = true,
  mostrarEnlacesRapidos = true,
  mostrarRedesSociales = true,
  mostrarEstadisticas = false,
  mostrarSoporte = true,
  className,
  tema = 'claro',
  compacto = false
}) => {
  const esCompleto = variant === 'completo';
  const esMinimal = variant === 'minimal';

  // Footer minimal
  if (esMinimal) {
    return (
      <footer className={cn(
        "border-t py-4",
        tema === 'oscuro' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
        className
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className={cn(
                "h-5 w-5",
                tema === 'oscuro' ? "text-white" : "text-gray-900"
              )} />
              <span className={cn(
                "font-semibold",
                tema === 'oscuro' ? "text-white" : "text-gray-900"
              )}>
                FELICITAFAC
              </span>
            </div>
            <div className={cn(
              "text-sm",
              tema === 'oscuro' ? "text-gray-400" : "text-gray-600"
            )}>
              © {new Date().getFullYear()} Todos los derechos reservados
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn(
      "border-t",
      tema === 'oscuro' ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      className
    )}>
      <div className="container mx-auto px-4 py-8">
        {/* Contenido principal */}
        <div className={cn(
          "grid gap-8",
          compacto ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}>
          {/* Información de la empresa */}
          {mostrarInformacionEmpresa && (
            <div className={compacto ? "md:col-span-1" : "lg:col-span-1"}>
              <InformacionEmpresa tema={tema} />
            </div>
          )}

          {/* Enlaces rápidos */}
          {mostrarEnlacesRapidos && !compacto && (
            <>
              {SECCIONES_ENLACES.map((seccion, index) => (
                <SeccionEnlaces key={index} seccion={seccion} tema={tema} />
              ))}
            </>
          )}

          {/* Enlaces compactos */}
          {mostrarEnlacesRapidos && compacto && (
            <div className="md:col-span-1">
              <div className="space-y-3">
                <h4 className={cn(
                  "text-sm font-semibold uppercase tracking-wide",
                  tema === 'oscuro' ? "text-gray-200" : "text-gray-900"
                )}>
                  Enlaces Rápidos
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {SECCIONES_ENLACES.slice(0, 2).map((seccion) => 
                    seccion.enlaces.slice(0, 3).map((enlace, index) => (
                      <Link
                        key={index}
                        to={enlace.href}
                        className={cn(
                          "text-sm hover:underline transition-colors",
                          tema === 'oscuro' 
                            ? "text-gray-400 hover:text-white" 
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        {enlace.titulo}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Redes sociales y estadísticas */}
          <div className={compacto ? "md:col-span-1" : "lg:col-span-1"} >
            <div className="space-y-6">
              {mostrarRedesSociales && <RedesSociales tema={tema} />}
              {mostrarEstadisticas && <EstadisticasFooter tema={tema} />}
            </div>
          </div>
        </div>

        {/* Información de soporte */}
        {mostrarSoporte && esCompleto && (
          <>
            <Separator className={cn(
              "my-6",
              tema === 'oscuro' ? "bg-gray-800" : "bg-gray-200"
            )} />
            
            <div className={cn(
              "text-center p-4 rounded-lg",
              tema === 'oscuro' ? "bg-gray-800" : "bg-gray-50"
            )}>
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                tema === 'oscuro' ? "text-white" : "text-gray-900"
              )}>
                ¿Necesitas Ayuda?
              </h3>
              <p className={cn(
                "text-sm mb-4",
                tema === 'oscuro' ? "text-gray-300" : "text-gray-600"
              )}>
                Nuestro equipo de soporte está disponible 24/7 para ayudarte
              </p>
              <div className="flex justify-center space-x-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/soporte/contacto">
                    <Mail className="h-4 w-4 mr-2" />
                    Contactar Soporte
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/soporte/ayuda">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Centro de Ayuda
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Copyright y enlaces legales */}
        <Separator className={cn(
          "my-6",
          tema === 'oscuro' ? "bg-gray-800" : "bg-gray-200"
        )} />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className={cn(
            "text-sm",
            tema === 'oscuro' ? "text-gray-400" : "text-gray-600"
          )}>
            © {new Date().getFullYear()} {INFORMACION_EMPRESA.razonSocial}. Todos los derechos reservados.
          </div>
          
          <div className="flex flex-wrap items-center space-x-4 text-sm">
            <Link 
              to="/legal/terminos"
              className={cn(
                "hover:underline",
                tema === 'oscuro' 
                  ? "text-gray-400 hover:text-white" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Términos
            </Link>
            <Link 
              to="/legal/privacidad"
              className={cn(
                "hover:underline",
                tema === 'oscuro' 
                  ? "text-gray-400 hover:text-white" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Privacidad
            </Link>
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span className={cn(
                tema === 'oscuro' ? "text-gray-400" : "text-gray-600"
              )}>
                Perú
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              SUNAT Verified
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default Footer;