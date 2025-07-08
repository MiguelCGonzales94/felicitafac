import { createBrowserRouter } from "react-router-dom";
import HomePage from "./paginas/PaginaPrincipal";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);
