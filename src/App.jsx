import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useData } from './context/DataContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Productos from './pages/Productos.jsx';
import ProductoDetalle from './pages/ProductoDetalle.jsx';
import Inventarios from './pages/Inventarios.jsx';
import Clientes from './pages/Clientes.jsx';
import ClienteDetalle from './pages/ClienteDetalle.jsx';
import Ventas from './pages/Ventas.jsx';
import VentaDetalle from './pages/VentaDetalle.jsx';
import Empleados from './pages/Empleados.jsx';
import EmpleadoDetalle from './pages/EmpleadoDetalle.jsx';

function RequireAuth({ children }) {
  const { authed } = useData();
  if (!authed) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { authed } = useData();

  return (
    <Routes>
      <Route path="/" element={authed ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />

        <Route path="/inventarios" element={<Inventarios />} />

        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:id" element={<ClienteDetalle />} />

        <Route path="/ventas" element={<Ventas />} />
        <Route path="/ventas/:id" element={<VentaDetalle />} />

        <Route path="/empleados" element={<Empleados />} />
        <Route path="/empleados/:id" element={<EmpleadoDetalle />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
