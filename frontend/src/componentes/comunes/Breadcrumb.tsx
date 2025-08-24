/**
 * Componente Breadcrumb - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Navegación jerárquica para el sistema
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

// =======================================================
// TIPOS E INTERFACES
// =======================================================

export interface ElementoBreadcrumb {
  label: string;
  href?: string | undefined;
  icono?: React.ReactNode;
  activo?: boolean;
}

export interface PropiedadesBreadcrumb {
  elementos?: ElementoBreadcrumb[];
  separator?: React.ReactNode;
  mostrarInicio?: boolean;
  className?: string;
  maxElementos?: number;
  contraerEn?: number;
}

// =======================================================
// CONFIGURACIÓN DE RUTAS
// =======================================================

const MAPEO_RUTAS: Record<string, ElementoBreadcrumb> = {
  '/admin': { label: 'Dashboard', icono: <Home className="h-4 w-4" /> },
  '/admin/clientes': { label: 'Clientes' },
  '/admin/clientes/nuevo': { label: 'Nuevo Cliente' },
  '/admin/clientes/editar': { label: 'Editar Cliente' },
  '/admin/productos': { label: 'Productos' },
  '/admin/productos/nuevo': { label: 'Nuevo Producto' },
  '/admin/productos/editar': { label: 'Editar Producto' },
  '/admin/productos/categorias': { label: 'Categorías' },
  '/admin/facturacion': { label: 'Facturación' },
  '/admin/facturacion/nueva': { label: 'Nueva Factura' },
  '/admin/facturacion/boletas': { label: 'Boletas' },
  '/admin/facturacion/notas-credito': { label: 'Notas de Crédito' },
  '/admin/facturacion/notas-debito': { label: 'Notas de Débito' },
  '/admin/inventario': { label: 'Inventario' },
  '/admin/inventario/movimientos': { label: 'Movimientos' },
  '/admin/inventario/ajustes': { label: 'Ajustes' },
  '/admin/reportes': { label: 'Reportes' },
  '/admin/reportes/ventas': { label: 'Ventas' },
  '/admin/reportes/sunat': { label: 'SUNAT' },
  '/admin/reportes/inventario': { label: 'Inventario' },
  '/admin/usuarios': { label: 'Usuarios' },
  '/admin/usuarios/nuevo': { label: 'Nuevo Usuario' },
  '/admin/usuarios/roles': { label: 'Roles y Permisos' },
  '/admin/configuraciones': { label: 'Configuración' },
  '/admin/configuracion/empresa': { label: 'Datos de Empresa' },
  '/admin/configuracion/sistema': { label: 'Sistema' },
  '/admin/configuracion/integraciones': { label: 'Integraciones' },
  '/pos': { label: 'Punto de Venta' },
  '/pos/venta': { label: 'Nueva Venta' },
  '/pos/historial': { label: 'Historial' },
};

// =======================================================
// HOOK PARA GENERAR BREADCRUMBS AUTOMÁTICAMENTE
// =======================================================

const useBreadcrumbsAutomatico = (): ElementoBreadcrumb[] => {
  const location = useLocation();
  const segmentosRuta = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbs: ElementoBreadcrumb[] = [];
  let rutaAcumulada = '';
  
  segmentosRuta.forEach((segmento, indice) => {
    rutaAcumulada += `/${segmento}`;
    const elemento = MAPEO_RUTAS[rutaAcumulada];
    
    if (elemento) {
      breadcrumbs.push({
        ...elemento,
        href: indice === segmentosRuta.length - 1 ? undefined : rutaAcumulada,
        activo: indice === segmentosRuta.length - 1
      });
    } else {
      // Crear breadcrumb por defecto
      breadcrumbs.push({
        label: segmento.charAt(0).toUpperCase() + segmento.slice(1).replace('-', ' '),
        href: indice === segmentosRuta.length - 1 ? undefined : rutaAcumulada,
        activo: indice === segmentosRuta.length - 1
      });
    }
  });
  
  return breadcrumbs;
};

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export const Breadcrumb: React.FC<PropiedadesBreadcrumb> = ({
  elementos,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
  mostrarInicio = true,
  className,
  maxElementos = 5,
  contraerEn = 3
}) => {
  const breadcrumbsAutomaticos = useBreadcrumbsAutomatico();
  const elementosFinales = elementos || breadcrumbsAutomaticos;
  
  // Agregar inicio si es necesario
  const elementosCompletos = mostrarInicio && elementosFinales.length > 0 
    ? [
        { 
          label: 'Inicio', 
          href: '/admin', 
          icono: <Home className="h-4 w-4" />,
          activo: false
        },
        ...elementosFinales
      ]
    : elementosFinales;
  
  // Manejar contracción si hay muchos elementos
  let elementosMostrar = elementosCompletos;
  if (elementosCompletos.length > maxElementos) {
    const primerElemento = elementosCompletos[0];
    const ultimosElementos = elementosCompletos.slice(-contraerEn);
    if (primerElemento) {
      elementosMostrar = [
        primerElemento,
        { label: '...', href: undefined },
        ...ultimosElementos
      ];
    } else {
      elementosMostrar = [
        { label: '...', href: undefined },
        ...ultimosElementos
      ];
    }
  }
  
  if (elementosMostrar.length === 0) return null;
  
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-600",
        className
      )}
    >
      <ol className="flex items-center space-x-1">
        {elementosMostrar.map((elemento, indice) => (
          <li key={indice} className="flex items-center">
            {indice > 0 && (
              <span className="mx-2 flex-shrink-0">
                {separator}
              </span>
            )}
            
            {elemento.href ? (
              <Link
                to={elemento.href}
                className={cn(
                  "flex items-center space-x-1 hover:text-blue-600 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm px-1"
                )}
              >
                {elemento.icono && (
                  <span className="flex-shrink-0">
                    {elemento.icono}
                  </span>
                )}
                <span>{elemento.label}</span>
              </Link>
            ) : (
              <span 
                className={cn(
                  "flex items-center space-x-1",
                  elemento.activo ? "text-gray-900 font-medium" : "text-gray-500"
                )}
                aria-current={elemento.activo ? "page" : undefined}
              >
                {elemento.icono && (
                  <span className="flex-shrink-0">
                    {elemento.icono}
                  </span>
                )}
                <span>{elemento.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// =======================================================
// COMPONENTES AUXILIARES
// =======================================================

export const BreadcrumbPersonalizado: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-600",
        className
      )}
    >
      {children}
    </nav>
  );
};

export const ElementoBreadcrumbPersonalizado: React.FC<{
  children: React.ReactNode;
  href?: string;
  activo?: boolean;
  className?: string;
}> = ({ children, href, activo, className }) => {
  const contenido = (
    <span 
      className={cn(
        "flex items-center space-x-1 transition-colors",
        activo 
          ? "text-gray-900 font-medium" 
          : href 
            ? "text-gray-600 hover:text-blue-600 cursor-pointer" 
            : "text-gray-500",
        className
      )}
      aria-current={activo ? "page" : undefined}
    >
      {children}
    </span>
  );
  
  if (href && !activo) {
    return (
      <Link 
        to={href}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm px-1"
      >
        {contenido}
      </Link>
    );
  }
  
  return contenido;
};

// =======================================================
// EXPORT DEFAULT
// =======================================================

export default Breadcrumb;