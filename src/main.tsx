import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./Pages/Layout";

import "./index.css";
import Pedidos from "./Pages/Pedidos";
import IndexPage from "./Pages/Index";
import ComidasPage from "./Pages/Comidas";
import Menu_Diario from "./Pages/MenuDiario";
import ClientesPage from "./Pages/Clientes";
import ContratosPage from "./Pages/Contratos";
import ProveedoresPage from "./Pages/Provedores";
import RegistrosPage from "./Pages/RegistroInsumos";
import FacturasPage from "./Pages/Facturas";
import InformesPage from "./Pages/infome";
import MeasasPage from "./Pages/Mesas";
//import LoginPage from "./Pages/Login";


const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <IndexPage /> },
      { path: "/Pedidos", element: <Pedidos /> },
      { path: "/Comidas", element: <ComidasPage />, },
      { path: "/Menu_Diario", element: <Menu_Diario /> },
      { path: "/Mesas", element: <MeasasPage/>},
      {
        path: "/Clientes",
        children: [
          { path: '/Clientes', element: <ClientesPage /> },
          { path: '/Clientes/Contratos', element: <ContratosPage /> }
        ]
      },
      { path: '/Facturas', element: <FacturasPage />},
      {
        path: '/Inventario',
        children: [
          { path: '/Inventario', element: <RegistrosPage /> },
          { path: '/Inventario/Proveedores', element: <ProveedoresPage /> }
        ]
      },
      {path: '/Informe', element:<InformesPage /> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
