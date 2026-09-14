import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useData, initials } from '../context/DataContext.jsx';
import { useToast } from './Toast.jsx';

const TITLES = [
  { match: /^\/dashboard/, title: 'Panel' },
  { match: /^\/productos\/\d+/, title: 'Detalle de producto' },
  { match: /^\/productos/, title: 'Productos' },
  { match: /^\/inventarios/, title: 'Inventarios' },
  { match: /^\/clientes\/\d+/, title: 'Detalle de cliente' },
  { match: /^\/clientes/, title: 'Clientes' },
  { match: /^\/ventas\/\d+/, title: 'Detalle de venta' },
  { match: /^\/ventas/, title: 'Ventas' },
  { match: /^\/empleados\/\d+/, title: 'Detalle de empleado' },
  { match: /^\/empleados/, title: 'Empleados' },
];

function pageTitle(pathname) {
  const hit = TITLES.find((t) => t.match.test(pathname));
  return hit ? hit.title : 'ZA Desarrollo';
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userLabel, logout } = useData();
  const toast = useToast();

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navItem = (to, icon, label) => (
    <NavLink to={to} onClick={close} className={({ isActive }) => 'sb-item' + (isActive ? ' active' : '')}>
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </NavLink>
  );

  return (
    <div id="app-view">
      <div className={'sidebar-overlay' + (open ? ' show' : '')} onClick={close} />

      <aside className={'sidebar' + (open ? ' open' : '')}>
        <div className="sb-brand">
          <div className="brand-mark-icon"><span className="brand-mark-monogram">ZA</span></div>
          <div className="brand-mark-text">
            <span className="brand-wordmark">ZA DESARROLLO</span>
            <span className="brand-tagline-mini">ERP Suite</span>
          </div>
        </div>

        <nav className="sb-nav">
          {navItem('/dashboard', 'dashboard', 'Panel')}

          <div className="sb-section">
            <p className="sb-section-label">Operación</p>
            {navItem('/productos', 'inventory_2', 'Productos')}
            {navItem('/inventarios', 'swap_vert', 'Inventarios')}
            {navItem('/clientes', 'group', 'Clientes')}
            {navItem('/ventas', 'point_of_sale', 'Ventas')}
          </div>

          <div className="sb-section">
            <p className="sb-section-label">Recursos Humanos</p>
            {navItem('/empleados', 'badge', 'Empleados')}
          </div>
        </nav>

        <div className="sb-footer">
          <button type="button" className="sb-item" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>Cerrar sesión
          </button>
        </div>
      </aside>

      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <button type="button" className="hamburger" onClick={() => setOpen((v) => !v)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="topbar-title">{pageTitle(location.pathname)}</span>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="icon-btn"
            title="Datos de ejemplo"
            onClick={() => toast('info', 'Este demo usa datos de ejemplo guardados solo en memoria. Al recargar la página todo vuelve al estado inicial.')}
          >
            <span className="material-symbols-outlined">info</span>
          </button>
          <div className="tb-divider" />
          <div className="tb-user">
            <div className="tb-user-name-wrap" style={{ textAlign: 'right' }}>
              <p className="tb-user-name">{userLabel}</p>
              <p className="tb-user-role">Administrador</p>
            </div>
            <div className="tb-avatar">{initials(userLabel) || 'UD'}</div>
          </div>
        </div>
      </header>

      <main className="content">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
