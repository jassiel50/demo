import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, initials } from '../context/DataContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useData();
  const toast = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!user.trim() || !pass.trim()) return;
    setLoading(true);
    const label = user.includes('@') ? user.split('@')[0].replace(/[._]/g, ' ') : user;
    setTimeout(() => {
      login(label.trim() || 'Usuario Demo');
      navigate('/dashboard', { replace: true });
    }, 600);
  };

  return (
    <div id="login-view">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <div className="brand-mark-icon"><span className="material-symbols-outlined">hub</span></div>
            <div className="brand-mark-text">
              <span className="brand-wordmark">VERTEX</span>
              <span className="brand-tagline-mini">ERP Suite</span>
            </div>
          </div>

          <div className="login-brand-msg">
            <h2>Un panel de control para toda tu operación.</h2>
            <p>Inventario, clientes, ventas y personal sincronizados en un solo lugar, con visibilidad en tiempo real para tomar mejores decisiones.</p>
          </div>

          <div className="brand-stats">
            <div className="brand-stat"><b>+50</b><span>Reportes</span></div>
            <div className="brand-stat"><b>99.9%</b><span>Disponibilidad</span></div>
            <div className="brand-stat"><b>24/7</b><span>Soporte</span></div>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-wrap">
            <div className="login-mobile-mark">
              <div className="brand-mark">
                <div className="brand-mark-icon" style={{ background: 'linear-gradient(135deg,var(--navy),var(--navy-2))' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fff' }}>hub</span>
                </div>
                <div className="brand-mark-text">
                  <span className="brand-wordmark" style={{ color: 'var(--navy)' }}>VERTEX</span>
                  <span className="brand-tagline-mini" style={{ color: 'var(--text-faint)' }}>ERP Suite</span>
                </div>
              </div>
            </div>

            <h3>Iniciar sesión</h3>
            <p className="login-sub">Ingresa tus credenciales para acceder al sistema.</p>

            <div className="demo-hint">
              <span className="material-symbols-outlined">info</span>
              <span>Modo demostración: escribe cualquier usuario y contraseña para entrar. No se requiere una cuenta real.</span>
            </div>

            <form onSubmit={submit}>
              <div className="field">
                <label htmlFor="loginUser">Usuario</label>
                <div className="input-wrap">
                  <span className="material-symbols-outlined">person</span>
                  <input id="loginUser" type="text" placeholder="demo@vertex.com" required autoComplete="username" value={user} onChange={(e) => setUser(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <div className="field-row">
                  <label htmlFor="loginPass">Contraseña</label>
                  <button type="button" className="field-link" onClick={() => toast('info', 'Modo demo: no se requiere recuperar contraseña.')}>¿Olvidaste tu contraseña?</button>
                </div>
                <div className="input-wrap">
                  <span className="material-symbols-outlined">lock</span>
                  <input id="loginPass" type={showPass ? 'text' : 'password'} placeholder="••••••••" required autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
                  <button type="button" className="eye-toggle" onClick={() => setShowPass((v) => !v)}>
                    <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Acceder</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <span className="footer-badge"><span className="material-symbols-outlined">verified_user</span>Acceso seguro</span>
              <span className="footer-badge"><span className="material-symbols-outlined">encrypted</span>Cifrado SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
