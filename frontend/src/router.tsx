import { createBrowserRouter } from "react-router-dom";
import HomePage from "./paginas/PaginaPrincipal";
import LoginPage from "./paginas/Login"; 

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />, 
  },
]);
