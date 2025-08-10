import { createBrowserRouter } from "react-router-dom";
import HomePage from "./paginas/PaginaPrincipal";
import LoginPage from "./paginas/Login";
import DashboardPage from "./paginas/Dashboard"; // <-- crea este componente

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
  {
    path: "*",
    element: <h1>404 - Página no encontrada</h1>,
  },
]);
