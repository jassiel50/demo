import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, fmtDate, fmtMoney } from '../context/DataContext.jsx';
import { StatCard, Chip, Avatar, EmptyState } from '../components/UI.jsx';
import { Modal, ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';

let lineSeq = 0;
function blankLine(productoId) { lineSeq += 1; return { key: lineSeq, productoId, cantidad: 1 }; }

export function VentaForm({ open, onClose, editing }) {
  const { clientes, productos, getProducto, saveVenta } = useData();
  const toast = useToast();
  const [clienteId, setClienteId] = useState(editing?.clienteId || clientes[0]?.id || '');
  const [estado, setEstado] = useState(editing?.estado || 'Pendiente');
  const [lines, setLines] = useState(() =>
    editing?.items?.length
      ? editing.items.map((it) => ({ ...blankLine(it.productoId), cantidad: it.cantidad }))
      : productos.length ? [blankLine(productos[0].id)] : []
  );

  // re-seed local state whenever the modal is (re)opened for a different record
  const [lastEditingId, setLastEditingId] = useState(editing?.id ?? null);
  if (open && editing?.id !== lastEditingId) {
    setLastEditingId(editing?.id ?? null);
    setClienteId(editing?.clienteId || clientes[0]?.id || '');
    setEstado(editing?.estado || 'Pendiente');
    setLines(
      editing?.items?.length
        ? editing.items.map((it) => ({ ...blankLine(it.productoId), cantidad: it.cantidad }))
        : productos.length ? [blankLine(productos[0].id)] : []
    );
  }

  const updateLine = (key, patch) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const removeLine = (key) => setLines((prev) => prev.filter((l) => l.key !== key));
  const addLine = () => setLines((prev) => [...prev, blankLine(productos[0]?.id)]);

  const total = lines.reduce((s, l) => {
    const p = getProducto(l.productoId);
    return s + (p ? p.precio * (parseInt(l.cantidad, 10) || 0) : 0);
  }, 0);

  const submit = (e) => {
    e.preventDefault();
    if (!clienteId) { toast('error', 'Registra al menos un cliente antes de crear una venta.'); return; }
    if (!lines.length) { toast('error', 'Agrega al menos un artículo a la venta.'); return; }
    const items = lines.map((l) => {
      const p = getProducto(l.productoId);
      return { productoId: Number(l.productoId), cantidad: parseInt(l.cantidad, 10) || 1, precioUnitario: p.precio };
    });
    saveVenta(editing?.id ?? null, { clienteId: Number(clienteId), estado, items });
    toast('success', editing ? 'Venta actualizada correctamente.' : 'Venta registrada correctamente.');
    onClose();
  };

  if (!clientes.length || !productos.length) {
    return (
      <Modal open={open} onClose={onClose} width="440px" title="Nueva venta" icon="point_of_sale" footer={<button type="button" className="btn btn-ghost" onClick={onClose}>Cerrar</button>}>
        <p className="lead">Registra al menos un cliente y un producto antes de crear una venta.</p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open} onClose={onClose} width="620px"
      title={editing ? `Editar ${editing.folio}` : 'Nueva venta'}
      icon={editing ? 'edit' : 'point_of_sale'}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" form="ventaForm" className="btn btn-primary"><span className="material-symbols-outlined">save</span>Guardar venta</button>
      </>}
    >
      <form id="ventaForm" onSubmit={submit}>
        <div className="form-grid">
          <div className="fld"><label>Cliente</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="fld"><label>Estado</label>
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option>Pendiente</option><option>Pagado</option><option>Cancelado</option>
            </select>
          </div>
        </div>

        <label style={{ fontSize: '.66rem', fontWeight: 700, letterSpacing: '.06em', color: '#44474e', textTransform: 'uppercase', display: 'block', margin: '.3rem 0 .5rem' }}>Artículos</label>
        <div className="line-items">
          {lines.map((l) => {
            const p = getProducto(l.productoId);
            const subtotal = p ? p.precio * (parseInt(l.cantidad, 10) || 0) : 0;
            return (
              <div className="line-item-row" key={l.key}>
                <select value={l.productoId} onChange={(e) => updateLine(l.key, { productoId: e.target.value })}>
                  {productos.map((prod) => <option key={prod.id} value={prod.id}>{prod.nombre}</option>)}
                </select>
                <input type="number" min="1" step="1" value={l.cantidad} onChange={(e) => updateLine(l.key, { cantidad: e.target.value })} />
                <span className="li-subtotal">{fmtMoney(subtotal)}</span>
                <button type="button" className="li-remove" onClick={() => removeLine(l.key)}><span className="material-symbols-outlined">close</span></button>
              </div>
            );
          })}
        </div>
        <button type="button" className="add-line-btn" onClick={addLine}><span className="material-symbols-outlined">add</span>Agregar artículo</button>

        <div className="sale-total-row"><span>Total</span><span>{fmtMoney(total)}</span></div>
      </form>
    </Modal>
  );
}

export default function Ventas() {
  const { ventas, getCliente, deleteVenta, ventaTotal, estadoVentaChip } = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const list = useMemo(() => {
    const q = search.toLowerCase().trim();
    return [...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).filter((v) => {
      if (estadoFilter && v.estado !== estadoFilter) return false;
      if (q) {
        const cli = getCliente(v.clienteId);
        if (!(v.folio.toLowerCase().includes(q) || (cli && cli.nombre.toLowerCase().includes(q)))) return false;
      }
      return true;
    });
  }, [ventas, search, estadoFilter, getCliente]);

  const pagadas = ventas.filter((v) => v.estado === 'Pagado');
  const pendientes = ventas.filter((v) => v.estado === 'Pendiente').length;
  const ingresoTotal = pagadas.reduce((s, v) => s + ventaTotal(v), 0);
  const filtering = search || estadoFilter;

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (v) => { setEditing(v); setFormOpen(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ventas</h1>
          <p className="page-desc">Registra y da seguimiento a los pedidos de tus clientes.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={openNew}><span className="material-symbols-outlined">add</span>Nueva venta</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard tone="navy" label="Total ventas" value={ventas.length} />
        <StatCard tone="green" label="Pagadas" value={pagadas.length} />
        <StatCard tone="amber" label="Pendientes" value={pendientes} />
        <StatCard tone="blue" label="Ingresos cobrados" value={fmtMoney(ingresoTotal)} />
      </div>

      <div className="table-shell">
        <div className="toolbar">
          <div className="search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Buscar por folio o cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option>Pagado</option><option>Pendiente</option><option>Cancelado</option>
          </select>
        </div>
        {filtering && <div className="result-info">Mostrando {list.length} de {ventas.length} ventas</div>}

        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Folio</th><th>Cliente</th><th>Fecha</th><th>Artículos</th><th>Total</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon="point_of_sale" message="No se encontraron ventas con esos filtros." /></td></tr>
              ) : list.map((v) => {
                const cli = getCliente(v.clienteId);
                const nArticulos = v.items.reduce((s, it) => s + it.cantidad, 0);
                return (
                  <tr key={v.id} className="clickable" onClick={() => navigate(`/ventas/${v.id}`)}>
                    <td><span className="entity-name">{v.folio}</span></td>
                    <td>{cli ? <div className="cell-entity"><Avatar name={cli.nombre} size={32} />{cli.nombre}</div> : <span className="entity-sub">Cliente eliminado</span>}</td>
                    <td className="entity-sub">{fmtDate(v.fecha)}</td>
                    <td>{nArticulos} pza{nArticulos !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 800, color: 'var(--navy)' }}>{fmtMoney(ventaTotal(v))}</td>
                    <td><Chip tone={estadoVentaChip(v.estado).replace('chip-', '')}>{v.estado}</Chip></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button type="button" className="action-btn view" title="Ver detalle" onClick={() => navigate(`/ventas/${v.id}`)}><span className="material-symbols-outlined">visibility</span></button>
                        <button type="button" className="action-btn edit" title="Editar" onClick={() => openEdit(v)}><span className="material-symbols-outlined">edit</span></button>
                        <button type="button" className="action-btn del" title="Eliminar" onClick={() => setConfirmDel(v)}><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <VentaForm open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Eliminar venta"
        message={confirmDel ? `¿Seguro que deseas eliminar la venta "${confirmDel.folio}"? Esta acción no se puede deshacer.` : ''}
        onConfirm={() => { deleteVenta(confirmDel.id); toast('success', 'Venta eliminada.'); }}
      />
    </div>
  );
}
