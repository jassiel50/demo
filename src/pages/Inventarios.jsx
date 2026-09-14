import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, fmtDate } from '../context/DataContext.jsx';
import { StatCard, Chip, EmptyState } from '../components/UI.jsx';
import { Modal } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';

function MovimientoForm({ open, onClose }) {
  const { productos, registrarMovimiento, getProducto } = useData();
  const toast = useToast();
  const [productoId, setProductoId] = useState(productos[0]?.id || '');
  const [tipo, setTipo] = useState('Entrada');
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [responsable, setResponsable] = useState('');

  const producto = getProducto(productoId);
  const excedeSalida = tipo === 'Salida' && producto && Number(cantidad) > producto.stock;

  const submit = (e) => {
    e.preventDefault();
    const qty = parseInt(cantidad, 10);
    if (!productoId || !qty || qty <= 0 || !motivo.trim() || !responsable.trim()) {
      toast('error', 'Completa todos los campos correctamente.');
      return;
    }
    if (excedeSalida) {
      toast('error', `Solo hay ${producto.stock} unidades disponibles para dar salida.`);
      return;
    }
    registrarMovimiento({ productoId: Number(productoId), tipo, cantidad: qty, motivo: motivo.trim(), responsable: responsable.trim() });
    toast('success', 'Movimiento registrado correctamente.');
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} width="520px" title="Registrar movimiento" icon="swap_vert"
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" form="movForm" className="btn btn-primary"><span className="material-symbols-outlined">save</span>Registrar</button>
      </>}
    >
      <form id="movForm" onSubmit={submit}>
        <div className="form-grid">
          <div className="fld full"><label>Producto</label>
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
            </select>
          </div>
          <div className="fld"><label>Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}><option>Entrada</option><option>Salida</option></select>
          </div>
          <div className="fld"><label>Cantidad</label><input type="number" min="1" step="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required /></div>
          <div className="fld full"><label>Responsable</label><input value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Nombre de quien registra el movimiento" required /></div>
          <div className="fld full"><label>Motivo</label><input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Reabastecimiento, venta, ajuste…" required /></div>
        </div>
        {excedeSalida && (
          <div className="demo-hint" style={{ background: 'var(--danger-bg)', borderColor: '#fecaca', color: 'var(--danger)' }}>
            <span className="material-symbols-outlined">error</span>
            <span>La cantidad supera el stock disponible ({producto.stock} unidades).</span>
          </div>
        )}
      </form>
    </Modal>
  );
}

export default function Inventarios() {
  const { productos, movimientos, getProducto } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const now = new Date();
  const isThisMonth = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const entradasMes = movimientos.filter((m) => m.tipo === 'Entrada' && isThisMonth(m.fecha)).reduce((s, m) => s + m.cantidad, 0);
  const salidasMes = movimientos.filter((m) => m.tipo === 'Salida' && isThisMonth(m.fecha)).reduce((s, m) => s + m.cantidad, 0);
  const bajoStock = productos.filter((p) => p.stock <= p.stockMin).length;

  const list = useMemo(() => {
    const q = search.toLowerCase().trim();
    return [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id).filter((m) => {
      if (tipoFilter && m.tipo !== tipoFilter) return false;
      if (q) {
        const p = getProducto(m.productoId);
        const hay = (p && p.nombre.toLowerCase().includes(q)) || m.motivo.toLowerCase().includes(q) || m.responsable.toLowerCase().includes(q);
        if (!hay) return false;
      }
      return true;
    });
  }, [movimientos, search, tipoFilter, getProducto]);

  const filtering = search || tipoFilter;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventarios</h1>
          <p className="page-desc">Kardex de entradas y salidas de almacén. Cada movimiento actualiza el stock del producto.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={() => setFormOpen(true)}><span className="material-symbols-outlined">add</span>Registrar movimiento</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard tone="navy" label="Movimientos totales" value={movimientos.length} />
        <StatCard tone="green" label="Entradas del mes" value={`+${entradasMes}`} sub="unidades" />
        <StatCard tone="amber" label="Salidas del mes" value={`-${salidasMes}`} sub="unidades" />
        <StatCard tone="red" label="Productos con bajo stock" value={bajoStock} />
      </div>

      <div className="table-shell">
        <div className="toolbar">
          <div className="search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Buscar por producto, motivo o responsable..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
            <option value="">Todos los movimientos</option>
            <option>Entrada</option><option>Salida</option>
          </select>
        </div>
        {filtering && <div className="result-info">Mostrando {list.length} de {movimientos.length} movimientos</div>}

        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th><th>Responsable</th><th>Fecha</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="swap_vert" message="No se encontraron movimientos con esos filtros." /></td></tr>
              ) : list.map((m) => {
                const p = getProducto(m.productoId);
                return (
                  <tr key={m.id} className="clickable" onClick={() => p && navigate(`/productos/${p.id}`)}>
                    <td><span className="entity-name">{p ? p.nombre : 'Producto eliminado'}</span></td>
                    <td><Chip tone={m.tipo === 'Entrada' ? 'green' : 'amber'}>{m.tipo === 'Entrada' ? '↑ Entrada' : '↓ Salida'}</Chip></td>
                    <td style={{ fontWeight: 700 }}>{m.cantidad} pzas</td>
                    <td className="entity-sub">{m.motivo}</td>
                    <td className="entity-sub">{m.responsable}</td>
                    <td className="entity-sub">{fmtDate(m.fecha)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <MovimientoForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
