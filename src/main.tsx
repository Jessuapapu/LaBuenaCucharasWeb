import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./Pages/Layout";
import { AuthProvider } from './context/Auth'
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
import LoginPage from "./Pages/Login";
import { RutaProtegida } from "./context/RutaProtegida";
import OrdenesPage from "./Pages/Ordenes";
import MenuMesas from "./Pages/Mesas2";
import { IndexMesas } from "./Pages/Mesas";
import CajaPage from "./Pages/caja";
import HorariosPage from "./Pages/HorariosPage";
import UsuarioPage from "./Pages/Usuarios";
import ConfiguracionPage from "./Pages/Configuracion";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
       element: <LoginPage />,
       path: "/Login"
      },
      {
        element: <RutaProtegida />,
        children: [
          { path: "/", element: <IndexPage /> },
          { path: "/Pedidos", element: <Pedidos /> },
          { path: "/Comidas", element: <ComidasPage />, },
          { path: "/Menu_Diario", element: <Menu_Diario /> },
          { path: "/Mesas", element: <IndexMesas /> },
          { path: "/mesa/:id", element: <MenuMesas /> },
          { path: "/ordenes", element: <OrdenesPage /> },
          { path: "/usuario", element: <UsuarioPage/> },
          {
            path: "/Clientes",
            children: [
              { path: '/Clientes', element: <ClientesPage /> },
              { path: '/Clientes/Contratos', element: <ContratosPage /> }
            ]
          },
          { path: '/Facturas', element: <FacturasPage /> },
          {
            path: '/Inventario',
            children: [
              { path: '/Inventario', element: <RegistrosPage /> },
              { path: '/Inventario/Proveedores', element: <ProveedoresPage /> }
            ]
          },
          {/* path: '/Informe', element: <InformesPage />*/ },
          { path: '/caja', element: <CajaPage /> },
          {
            path: '/Configuracion',
            children: [
              {path: '/Configuracion', element: <ConfiguracionPage />},
              {path: '/Configuracion/horarios', element: <HorariosPage />},
              {path: '/Configuracion/usuarios', element: <UsuarioPage />}
            ]

          }
        ]
      }

    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
