// frontend/src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./paginas/PaginaPrincipal";
import LoginPage from "./paginas/Login";
import DashboardPage from "./paginas/Dashboard";

// Agregar solo las páginas que quieres probar primero
import Dashboard from "./paginas/admin/Dashboard";
import ListaClientes from "./paginas/admin/clientes/ListaClientes";
import ListaProductos from "./paginas/admin/productos/ListaProductos";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },

  // ===== NUEVAS RUTAS PARA PROBAR =====
  {
    path: "/admin",
    element: <Dashboard />,
  },
  {
    path: "/admin/clientes",
    element: <ListaClientes />,
  },
  {
    path: "/admin/productos",
    element: <ListaProductos />,
  },

  {
    path: "*",
    element: <h1>404 - Página no encontrada</h1>,
  },
]);