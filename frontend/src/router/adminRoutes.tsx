/**
 * Configuración de Rutas Administrativas - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Rutas protegidas del panel administrativo
 */

import React, { Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { RutaProtegida } from '../componentes/comunes/RutaProtegida';
import LayoutAdmin from '../componentes/layouts/LayoutAdmin';
import ComponenteCarga from '../componentes/comunes/ComponenteCarga';

// =======================================================
// LAZY LOADING DE COMPONENTES
// =======================================================

// Dashboard Principal
const DashboardAdmin = React.lazy(() => import('../paginas/admin/DashboardAdmin'));

// Módulo Facturación
const DashboardFacturacion = React.lazy(() => import('../paginas/admin/facturacion/DashboardFacturacion'));
const PuntoVenta = React.lazy(() => import('../paginas/admin/facturacion/PuntoVenta'));
const GestionDocumentos = React.lazy(() => import('../paginas/admin/facturacion/GestionDocumentos'));
const EstadosSUNAT = React.lazy(() => import('../paginas/admin/facturacion/EstadosSUNAT'));
const ConfiguracionFacturacion = React.lazy(() => import('../paginas/admin/facturacion/ConfiguracionFacturacion'));

// Módulo Comercial
const GestionClientes = React.lazy(() => import('../paginas/admin/comercial/GestionClientes'));
const GestionProductos = React.lazy(() => import('../paginas/admin/comercial/GestionProductos'));
const ListaPrecios = React.lazy(() => import('../paginas/admin/comercial/ListaPrecios'));
const ConfiguracionComercial = React.lazy(() => import('../paginas/admin/comercial/ConfiguracionComercial'));

// Módulo Inventario
const DashboardInventario = React.lazy(() => import('../paginas/admin/inventario/DashboardInventario'));
const GestionAlmacenes = React.lazy(() => import('../paginas/admin/inventario/GestionAlmacenes'));
const MovimientosInventario = React.lazy(() => import('../paginas/admin/inventario/MovimientosInventario'));
const KardexPEPS = React.lazy(() => import('../paginas/admin/inventario/KardexPEPS'));
const StockMinimo = React.lazy(() => import('../paginas/admin/inventario/StockMinimo'));

// Módulo Contabilidad
const DashboardContable = React.lazy(() => import('../paginas/admin/contabilidad/DashboardContable'));
const PlanCuentas = React.lazy(() => import('../paginas/admin/contabilidad/PlanCuentas'));
const LibroDiario = React.lazy(() => import('../paginas/admin/contabilidad/LibroDiario'));
const ReportesContables = React.lazy(() => import('../paginas/admin/contabilidad/ReportesContables'));
const ReportesPLE = React.lazy(() => import('../paginas/admin/contabilidad/ReportesPLE'));

// Módulo Reportes
const DashboardEjecutivo = React.lazy(() => import('../paginas/admin/reportes/DashboardEjecutivo'));
const ReportesFinancieros = React.lazy(() => import('../paginas/admin/reportes/ReportesFinancieros'));
const ReportesSUNAT = React.lazy(() => import('../paginas/admin/reportes/ReportesSUNAT'));
const AnalyticsAvanzados = React.lazy(() => import('../paginas/admin/reportes/AnalyticsAvanzados'));

// Módulo Administración
const GestionUsuarios = React.lazy(() => import('../paginas/admin/sistema/GestionUsuarios'));
const ConfiguracionEmpresa = React.lazy(() => import('../paginas/admin/sistema/ConfiguracionEmpresa'));
const ConfiguracionSistema = React.lazy(() => import('../paginas/admin/sistema/ConfiguracionSistema'));
const Mantenimiento = React.lazy(() => import('../paginas/admin/sistema/Mantenimiento'));

// Páginas Especiales
const PerfilUsuario = React.lazy(() => import('../paginas/admin/PerfilUsuario'));
const Configuraciones = React.lazy(() => import('../paginas/admin/Configuraciones'));
const NotificacionesCompletas = React.lazy(() => import('../paginas/admin/NotificacionesCompletas'));

// =======================================================
// COMPONENTE DE SUSPENSE
// =======================================================

const ComponenteSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-[400px]">
      <ComponenteCarga mensaje="Cargando módulo..." />
    </div>
  }>
    {children}
  </Suspense>
);

// =======================================================
// COMPONENTE PLACEHOLDER
// =======================================================

const PaginaEnConstruccion: React.FC<{ titulo: string; modulo: string }> = ({ titulo, modulo }) => (
  <div className="p-6">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.415-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{titulo}</h2>
      <p className="text-gray-600 mb-4">
        Esta página del módulo <strong>{modulo}</strong> está en desarrollo.
      </p>
      <p className="text-sm text-gray-500">
        Será implementada en las siguientes fases del proyecto.
      </p>
    </div>
  </div>
);

// =======================================================
// CONFIGURACIÓN DE RUTAS
// =======================================================

export const rutasAdmin: RouteObject[] = [
  {
    path: '/admin',
    element: (
      <RutaProtegida rolesPermitidos={['administrador', 'contador', 'vendedor']}>
        <LayoutAdmin />
      </RutaProtegida>
    ),
    children: [
      // Dashboard Principal
      {
        index: true,
        element: (
          <ComponenteSuspense>
            <DashboardAdmin />
          </ComponenteSuspense>
        )
      },

      // =======================================================
      // MÓDULO FACTURACIÓN ELECTRÓNICA
      // =======================================================
      {
        path: 'facturacion',
        children: [
          {
            index: true,
            element: <Navigate to="/admin/facturacion/dashboard" replace />
          },
          {
            path: 'dashboard',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Dashboard Facturación" modulo="Facturación Electrónica" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'pos',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Punto de Venta (POS)" modulo="Facturación Electrónica" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'documentos',
            children: [
              {
                index: true,
                element: (
                  <ComponenteSuspense>
                    <PaginaEnConstruccion titulo="Gestión de Documentos" modulo="Facturación Electrónica" />
                  </ComponenteSuspense>
                )
              },
              {
                path: ':id',
                element: (
                  <ComponenteSuspense>
                    <PaginaEnConstruccion titulo="Detalle de Documento" modulo="Facturación Electrónica" />
                  </ComponenteSuspense>
                )
              },
              {
                path: ':id/editar',
                element: (
                  <ComponenteSuspense>
                    <PaginaEnConstruccion titulo="Editar Documento" modulo="Facturación Electrónica" />
                  </ComponenteSuspense>
                )
              }
            ]
          },
          {
            path: 'estados-sunat',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Estados SUNAT" modulo="Facturación Electrónica" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'configuracion',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Configuración Facturación" modulo="Facturación Electrónica" />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO GESTIÓN COMERCIAL
      // =======================================================
      {
        path: 'comercial',
        children: [
          {
            index: true,
            element: <Navigate to="/admin/comercial/clientes" replace />
          },
          {
            path: 'clientes',
            children: [
              {
                index: true,
                element: (
                  <ComponenteSuspense>
                    <PaginaEnConstruccion titulo="Gestión de Clientes" modulo="Gestión Comercial" />
                  </ComponenteSuspense>
                )
              },
              {
                path: 'nuevo',
                element: (
                  <ComponenteSuspense>
                    <PaginaEnConstruccion titulo="Nuevo Cliente" modulo="Gestión Comercial" />
                  </ComponenteSuspense>
                )
              },
              {
                path: ':id',
                element: (
                  <ComponenteSuspense>
                    <PaginaEnConstruccion titulo="Detalle Cliente" modulo="Gestión Comercial" />
                  </ComponenteSuspense>
                )
              }
            ]
          },
          {
            path: 'productos',
            children: [
              {
                index: true,
                element: (
                  <ComponenteSuspense>
                    <PaginaEnConstruccion titulo="Gestión de Productos" modulo="Gestión Comercial" />
                  </ComponenteSuspense>
                )
              },
              {
                path: 'nuevo',
                element: (
                  <ComponenteSuspense>
                    <PaginaEnConstruccion titulo="Nuevo Producto" modulo="Gestión Comercial" />
                  </ComponenteSuspense>
                )
              }
            ]
          },
          {
            path: 'precios',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Lista de Precios" modulo="Gestión Comercial" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'configuracion',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Configuración Comercial" modulo="Gestión Comercial" />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO INVENTARIO Y ALMACENES
      // =======================================================
      {
        path: 'inventario',
        children: [
          {
            index: true,
            element: <Navigate to="/admin/inventario/dashboard" replace />
          },
          {
            path: 'dashboard',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Dashboard Inventario" modulo="Inventario y Almacenes" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'almacenes',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Gestión de Almacenes" modulo="Inventario y Almacenes" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'movimientos',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Movimientos de Inventario" modulo="Inventario y Almacenes" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'kardex',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Kardex PEPS" modulo="Inventario y Almacenes" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'stock-minimo',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Control de Stock Mínimo" modulo="Inventario y Almacenes" />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO CONTABILIDAD
      // =======================================================
      {
        path: 'contabilidad',
        children: [
          {
            index: true,
            element: <Navigate to="/admin/contabilidad/dashboard" replace />
          },
          {
            path: 'dashboard',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Dashboard Contable" modulo="Contabilidad" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'plan-cuentas',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Plan de Cuentas PCGE" modulo="Contabilidad" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'libro-diario',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Libro Diario" modulo="Contabilidad" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'reportes',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Reportes Contables" modulo="Contabilidad" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'ple',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Reportes PLE SUNAT" modulo="Contabilidad" />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO REPORTES Y ANALYTICS
      // =======================================================
      {
        path: 'reportes',
        children: [
          {
            index: true,
            element: <Navigate to="/admin/reportes/dashboard-ejecutivo" replace />
          },
          {
            path: 'dashboard-ejecutivo',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Dashboard Ejecutivo" modulo="Reportes y Analytics" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'financieros',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Reportes Financieros" modulo="Reportes y Analytics" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'sunat',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Reportes SUNAT" modulo="Reportes y Analytics" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'analytics',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Analytics Avanzados" modulo="Reportes y Analytics" />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO ADMINISTRACIÓN SISTEMA
      // =======================================================
      {
        path: 'sistema',
        element: (
          <RutaProtegida rolesPermitidos={['administrador']}>
            <></>
          </RutaProtegida>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/sistema/usuarios" replace />
          },
          {
            path: 'usuarios',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Gestión de Usuarios" modulo="Administración Sistema" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'empresa',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Configuración Empresa" modulo="Administración Sistema" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'configuracion',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Configuración Sistema" modulo="Administración Sistema" />
              </ComponenteSuspense>
            )
          },
          {
            path: 'mantenimiento',
            element: (
              <ComponenteSuspense>
                <PaginaEnConstruccion titulo="Mantenimiento" modulo="Administración Sistema" />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // PÁGINAS ESPECIALES
      // =======================================================
      {
        path: 'perfil',
        element: (
          <ComponenteSuspense>
            <PaginaEnConstruccion titulo="Perfil de Usuario" modulo="Configuración Personal" />
          </ComponenteSuspense>
        )
      },
      {
        path: 'configuracion',
        element: (
          <ComponenteSuspense>
            <PaginaEnConstruccion titulo="Configuraciones Generales" modulo="Configuración Personal" />
          </ComponenteSuspense>
        )
      },
      {
        path: 'notificaciones',
        element: (
          <ComponenteSuspense>
            <PaginaEnConstruccion titulo="Centro de Notificaciones" modulo="Sistema" />
          </ComponenteSuspense>
        )
      },

      // Ruta catch-all para páginas no encontradas dentro del admin
      {
        path: '*',
        element: (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Página No Encontrada</h2>
              <p className="text-gray-600 mb-4">
                La página que buscas no existe en el sistema administrativo.
              </p>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Volver Atrás
              </button>
            </div>
          </div>
        )
      }
    ]
  }
];

export default rutasAdmin;