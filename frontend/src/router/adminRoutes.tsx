/**
 * Configuración de Rutas Administrativas - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Rutas protegidas del panel administrativo
 */

import React, { Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import RutaProtegida from '../componentes/comunes/RutaProtegida';
import LayoutAdmin from '../componentes/layouts/LayoutAdmin';
import ComponenteCarga from '../componentes/comunes/ComponenteCarga';

// =======================================================
// LAZY LOADING DE COMPONENTES - MÓDULO 4
// =======================================================

// Dashboard Principal
const Dashboard = React.lazy(() => import('../paginas/admin/Dashboard'));
const PerfilUsuario = React.lazy(() => import('../paginas/admin/PerfilUsuario'));
const Configuraciones = React.lazy(() => import('../paginas/admin/Configuracion'));
const NotificacionesCompletas = React.lazy(() => import('../paginas/admin/NotificacionesCompletas'));

// Módulo Facturación
const DashboardFacturacion = React.lazy(() => import('../paginas/admin/facturacion/DashboardFacturacion'));
const NuevaFactura = React.lazy(() => import('../paginas/admin/facturacion/NuevaFactura'));
const ListaDocumentos = React.lazy(() => import('../paginas/admin/facturacion/ListaDocumentos'));
const DetalleDocumento = React.lazy(() => import('../paginas/admin/facturacion/DetalleDocumento'));
const ConfiguracionSeries = React.lazy(() => import('../paginas/admin/facturacion/ConfiguracionSeries'));

// Módulo Clientes
const ListaClientes = React.lazy(() => import('../paginas/admin/clientes/ListaClientes'));
const DetalleCliente = React.lazy(() => import('../paginas/admin/clientes/DetalleCliente'));
const NuevoCliente = React.lazy(() => import('../paginas/admin/clientes/NuevoCliente'));
const EditarCliente = React.lazy(() => import('../paginas/admin/clientes/EditarCliente'));

// Módulo Productos
const ListaProductos = React.lazy(() => import('../paginas/admin/productos/ListaProductos'));
const DetalleProducto = React.lazy(() => import('../paginas/admin/productos/DetalleProducto'));
const NuevoProducto = React.lazy(() => import('../paginas/admin/productos/NuevoProducto'));
const EditarProducto = React.lazy(() => import('../paginas/admin/productos/EditarProducto'));
const GestionCategorias = React.lazy(() => import('../paginas/admin/productos/GestionCategorias'));

// Módulo Inventario
const DashboardInventario = React.lazy(() => import('../paginas/admin/inventario/DashboardInventario'));
const MovimientosInventario = React.lazy(() => import('../paginas/admin/inventario/MovimientosInventario'));
const NuevoMovimiento = React.lazy(() => import('../paginas/admin/inventario/NuevoMovimiento'));
const ReporteInventario = React.lazy(() => import('../paginas/admin/inventario/ReporteInventario'));
const AjustesInventario = React.lazy(() => import('../paginas/admin/inventario/AjustesInventario'));

// Módulo Usuarios
const ListaUsuarios = React.lazy(() => import('../paginas/admin/usuarios/ListaUsuarios'));
const DetalleUsuario = React.lazy(() => import('../paginas/admin/usuarios/DetalleUsuario'));
const NuevoUsuario = React.lazy(() => import('../paginas/admin/usuarios/NuevoUsuario'));
const GestionRoles = React.lazy(() => import('../paginas/admin/usuarios/GestionRoles'));

// Módulo Reportes
const DashboardReportes = React.lazy(() => import('../paginas/admin/reportes/DashboardReportes'));
const ReportesVentas = React.lazy(() => import('../paginas/admin/reportes/ReportesVentas'));
const ReportesSunat = React.lazy(() => import('../paginas/admin/reportes/ReportesSunat'));
const ReportesInventario = React.lazy(() => import('../paginas/admin/reportes/ReportesInventario'));

// =======================================================
// COMPONENTE DE SUSPENSE
// =======================================================

const ComponenteSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-[400px]">
      <ComponenteCarga mensaje="Cargando..." />
    </div>
  }>
    {children}
  </Suspense>
);

// =======================================================
// CONFIGURACIÓN DE RUTAS ADMINISTRATIVAS
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
            <Dashboard />
          </ComponenteSuspense>
        )
      },

      // Perfil y Configuraciones
      {
        path: 'perfil',
        element: (
          <ComponenteSuspense>
            <PerfilUsuario />
          </ComponenteSuspense>
        )
      },
      {
        path: 'configuraciones',
        element: (
          <ComponenteSuspense>
            <Configuraciones />
          </ComponenteSuspense>
        )
      },
      {
        path: 'notificaciones',
        element: (
          <ComponenteSuspense>
            <NotificacionesCompletas />
          </ComponenteSuspense>
        )
      },

      // =======================================================
      // MÓDULO FACTURACIÓN
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
                <DashboardFacturacion />
              </ComponenteSuspense>
            )
          },
          {
            path: 'nueva-factura',
            element: (
              <ComponenteSuspense>
                <NuevaFactura />
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
                    <ListaDocumentos />
                  </ComponenteSuspense>
                )
              },
              {
                path: ':id',
                element: (
                  <ComponenteSuspense>
                    <DetalleDocumento />
                  </ComponenteSuspense>
                )
              }
            ]
          },
          {
            path: 'configuracion-series',
            element: (
              <ComponenteSuspense>
                <ConfiguracionSeries />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO CLIENTES
      // =======================================================
      {
        path: 'clientes',
        children: [
          {
            index: true,
            element: (
              <ComponenteSuspense>
                <ListaClientes />
              </ComponenteSuspense>
            )
          },
          {
            path: 'nuevo',
            element: (
              <ComponenteSuspense>
                <NuevoCliente />
              </ComponenteSuspense>
            )
          },
          {
            path: ':id',
            element: (
              <ComponenteSuspense>
                <DetalleCliente />
              </ComponenteSuspense>
            )
          },
          {
            path: 'editar/:id',
            element: (
              <ComponenteSuspense>
                <EditarCliente />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO PRODUCTOS
      // =======================================================
      {
        path: 'productos',
        children: [
          {
            index: true,
            element: (
              <ComponenteSuspense>
                <ListaProductos />
              </ComponenteSuspense>
            )
          },
          {
            path: 'nuevo',
            element: (
              <ComponenteSuspense>
                <NuevoProducto />
              </ComponenteSuspense>
            )
          },
          {
            path: ':id',
            element: (
              <ComponenteSuspense>
                <DetalleProducto />
              </ComponenteSuspense>
            )
          },
          {
            path: 'editar/:id',
            element: (
              <ComponenteSuspense>
                <EditarProducto />
              </ComponenteSuspense>
            )
          },
          {
            path: 'categorias',
            element: (
              <ComponenteSuspense>
                <GestionCategorias />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO INVENTARIO
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
                <DashboardInventario />
              </ComponenteSuspense>
            )
          },
          {
            path: 'movimientos',
            children: [
              {
                index: true,
                element: (
                  <ComponenteSuspense>
                    <MovimientosInventario />
                  </ComponenteSuspense>
                )
              }
            ]
          },
          {
            path: 'nuevo-movimiento',
            element: (
              <ComponenteSuspense>
                <NuevoMovimiento />
              </ComponenteSuspense>
            )
          },
          {
            path: 'reporte',
            element: (
              <ComponenteSuspense>
                <ReporteInventario />
              </ComponenteSuspense>
            )
          },
          {
            path: 'ajustes',
            element: (
              <ComponenteSuspense>
                <AjustesInventario />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO USUARIOS
      // =======================================================
      {
        path: 'usuarios',
        children: [
          {
            index: true,
            element: (
              <ComponenteSuspense>
                <ListaUsuarios />
              </ComponenteSuspense>
            )
          },
          {
            path: 'nuevo',
            element: (
              <ComponenteSuspense>
                <NuevoUsuario />
              </ComponenteSuspense>
            )
          },
          {
            path: ':id',
            element: (
              <ComponenteSuspense>
                <DetalleUsuario />
              </ComponenteSuspense>
            )
          },
          {
            path: 'roles',
            element: (
              <ComponenteSuspense>
                <GestionRoles />
              </ComponenteSuspense>
            )
          }
        ]
      },

      // =======================================================
      // MÓDULO REPORTES
      // =======================================================
      {
        path: 'reportes',
        children: [
          {
            index: true,
            element: <Navigate to="/admin/reportes/dashboard" replace />
          },
          {
            path: 'dashboard',
            element: (
              <ComponenteSuspense>
                <DashboardReportes />
              </ComponenteSuspense>
            )
          },
          {
            path: 'ventas',
            element: (
              <ComponenteSuspense>
                <ReportesVentas />
              </ComponenteSuspense>
            )
          },
          {
            path: 'sunat',
            element: (
              <ComponenteSuspense>
                <ReportesSunat />
              </ComponenteSuspense>
            )
          },
          {
            path: 'inventario',
            element: (
              <ComponenteSuspense>
                <ReportesInventario />
              </ComponenteSuspense>
            )
          }
        ]
      }
    ]
  }
];