import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, fmtMoney } from '../context/DataContext.jsx';
import { StatCard, Chip, Avatar, EmptyState } from '../components/UI.jsx';
import { Modal, ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';

const CATEGORIAS = ['Cómputo', 'Mobiliario', 'Redes', 'Accesorios', 'Oficina'];

export function ProductoForm({ open, onClose, editing }) {
  const { saveProducto } = useData();
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    nombre: editing?.nombre || '', sku: editing?.sku || '', categoria: editing?.categoria || CATEGORIAS[0],
    precio: editing?.precio ?? '', stock: editing?.stock ?? '', stockMin: editing?.stockMin ?? 5,
    descripcion: editing?.descripcion || '',
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const precio = parseFloat(form.precio), stock = parseInt(form.stock, 10), stockMin = parseInt(form.stockMin, 10);
    if (!form.nombre.trim() || !form.sku.trim() || Number.isNaN(precio) || Number.isNaN(stock) || Number.isNaN(stockMin)) {
      toast('error', 'Completa todos los campos correctamente.');
      return;
    }
    saveProducto(editing?.id ?? null, { ...form, precio, stock, stockMin });
    toast('success', editing ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} width="600px"
      title={editing ? 'Editar producto' : 'Nuevo producto'}
      icon={editing ? 'edit' : 'inventory_2'}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" form="prodForm" className="btn btn-primary"><span className="material-symbols-outlined">save</span>Guardar</button>
      </>}
    >
      <form id="prodForm" onSubmit={submit}>
        <div className="form-grid">
          <div className="fld full"><label>Nombre del producto</label><input value={form.nombre} onChange={set('nombre')} placeholder='Ej. Monitor 27" 4K' required /></div>
          <div className="fld"><label>SKU</label><input value={form.sku} onChange={set('sku')} placeholder="CAT-0000" required /></div>
          <div className="fld"><label>Categoría</label>
            <select value={form.categoria} onChange={set('categoria')}>{CATEGORIAS.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="fld"><label>Precio (MXN)</label><input type="number" min="0" step="1" value={form.precio} onChange={set('precio')} required /></div>
          <div className="fld"><label>Stock actual</label><input type="number" min="0" step="1" value={form.stock} onChange={set('stock')} required /></div>
          <div className="fld full"><label>Stock mínimo (alerta)</label><input type="number" min="0" step="1" value={form.stockMin} onChange={set('stockMin')} required /></div>
          <div className="fld full"><label>Descripción</label><textarea value={form.descripcion} onChange={set('descripcion')} placeholder="Especificaciones, notas de venta…" /></div>
        </div>
      </form>
    </Modal>
  );
}

export default function Productos() {
  const { productos, deleteProducto, productoEstado } = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const categorias = useMemo(() => [...new Set(productos.map((p) => p.categoria))].sort(), [productos]);

  const list = useMemo(() => {
    const q = search.toLowerCase().trim();
    return productos.filter((p) => {
      if (catFilter && p.categoria !== catFilter) return false;
      if (estadoFilter && productoEstado(p).label !== estadoFilter) return false;
      if (q && !(p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [productos, search, catFilter, estadoFilter, productoEstado]);

  const bajoStock = productos.filter((p) => p.stock > 0 && p.stock <= p.stockMin).length;
  const agotados = productos.filter((p) => p.stock <= 0).length;
  const valorInv = productos.reduce((s, p) => s + p.precio * p.stock, 0);
  const filtering = search || catFilter || estadoFilter;

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p) => { setEditing(p); setFormOpen(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-desc">Administra tu catálogo e inventario disponible.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={openNew}><span className="material-symbols-outlined">add</span>Nuevo producto</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard tone="navy" label="Total productos" value={productos.length} />
        <StatCard tone="amber" label="Bajo stock" value={bajoStock} />
        <StatCard tone="red" label="Agotados" value={agotados} />
        <StatCard tone="green" label="Valor de inventario" value={fmtMoney(valorInv)} />
      </div>

      <div className="table-shell">
        <div className="toolbar">
          <div className="search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Buscar por nombre o SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option>Disponible</option><option>Bajo stock</option><option>Agotado</option>
          </select>
        </div>
        {filtering && <div className="result-info">Mostrando {list.length} de {productos.length} productos</div>}

        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="inventory_2" message="No se encontraron productos con esos filtros." /></td></tr>
              ) : list.map((p) => {
                const est = productoEstado(p);
                return (
                  <tr key={p.id} className="clickable" onClick={() => navigate(`/productos/${p.id}`)}>
                    <td><div className="cell-entity"><Avatar name={p.nombre} /><div><div className="entity-name">{p.nombre}</div><div className="entity-sub">SKU: {p.sku}</div></div></div></td>
                    <td><Chip tone="gray">{p.categoria}</Chip></td>
                    <td style={{ fontWeight: 700 }}>{fmtMoney(p.precio)}</td>
                    <td>{p.stock} <span className="entity-sub">/ mín. {p.stockMin}</span></td>
                    <td><Chip tone={est.chip.replace('chip-', '')}>{est.label}</Chip></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button type="button" className="action-btn view" title="Ver detalle" onClick={() => navigate(`/productos/${p.id}`)}><span className="material-symbols-outlined">visibility</span></button>
                        <button type="button" className="action-btn edit" title="Editar" onClick={() => openEdit(p)}><span className="material-symbols-outlined">edit</span></button>
                        <button type="button" className="action-btn del" title="Eliminar" onClick={() => setConfirmDel(p)}><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ProductoForm key={editing ? editing.id : 'new'} open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Eliminar producto"
        message={confirmDel ? `¿Seguro que deseas eliminar "${confirmDel.nombre}"? Esta acción no se puede deshacer.` : ''}
        onConfirm={() => { deleteProducto(confirmDel.id); toast('success', 'Producto eliminado.'); }}
      />
    </div>
  );
}
