import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { StatCard, Chip, Avatar, EmptyState } from '../components/UI.jsx';
import { Modal, ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';

const TIPOS = ['Corporativo', 'Gobierno', 'PYME', 'Individual'];

export function ClienteForm({ open, onClose, editing }) {
  const { saveCliente } = useData();
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    nombre: editing?.nombre || '', tipo: editing?.tipo || TIPOS[0], rfc: editing?.rfc || '',
    contacto: editing?.contacto || '', telefono: editing?.telefono || '', email: editing?.email || '', ciudad: editing?.ciudad || '',
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.contacto.trim()) {
      toast('error', 'El nombre y el contacto principal son obligatorios.');
      return;
    }
    saveCliente(editing?.id ?? null, { ...form, rfc: form.rfc.trim() || 'XAXX010101000' });
    toast('success', editing ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.');
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} width="600px"
      title={editing ? 'Editar cliente' : 'Nuevo cliente'}
      icon={editing ? 'edit' : 'person_add'}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" form="cliForm" className="btn btn-primary"><span className="material-symbols-outlined">save</span>Guardar</button>
      </>}
    >
      <form id="cliForm" onSubmit={submit}>
        <div className="form-grid">
          <div className="fld full"><label>Nombre / razón social</label><input value={form.nombre} onChange={set('nombre')} required /></div>
          <div className="fld"><label>Tipo de cliente</label><select value={form.tipo} onChange={set('tipo')}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="fld"><label>RFC</label><input value={form.rfc} onChange={set('rfc')} placeholder="XAXX010101000" /></div>
          <div className="fld"><label>Contacto principal</label><input value={form.contacto} onChange={set('contacto')} required /></div>
          <div className="fld"><label>Teléfono</label><input value={form.telefono} onChange={set('telefono')} placeholder="55 0000 0000" /></div>
          <div className="fld"><label>Correo</label><input type="email" value={form.email} onChange={set('email')} placeholder="contacto@empresa.com" /></div>
          <div className="fld"><label>Ciudad</label><input value={form.ciudad} onChange={set('ciudad')} /></div>
        </div>
      </form>
    </Modal>
  );
}

export default function Clientes() {
  const { clientes, ventas, deleteCliente } = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const list = useMemo(() => {
    const q = search.toLowerCase().trim();
    return clientes.filter((c) => {
      if (tipoFilter && c.tipo !== tipoFilter) return false;
      if (q && !(c.nombre.toLowerCase().includes(q) || c.rfc.toLowerCase().includes(q) || c.ciudad.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [clientes, search, tipoFilter]);

  const conCompras = clientes.filter((c) => ventas.some((v) => v.clienteId === c.id)).length;
  const corporativos = clientes.filter((c) => c.tipo === 'Corporativo').length;
  const filtering = search || tipoFilter;

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c) => { setEditing(c); setFormOpen(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-desc">Gestiona el directorio de clientes y su información de contacto.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={openNew}><span className="material-symbols-outlined">add</span>Nuevo cliente</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard tone="navy" label="Total clientes" value={clientes.length} />
        <StatCard tone="green" label="Con compras" value={conCompras} />
        <StatCard tone="amber" label="Sin compras" value={clientes.length - conCompras} />
        <StatCard tone="blue" label="Corporativos" value={corporativos} />
      </div>

      <div className="table-shell">
        <div className="toolbar">
          <div className="search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Buscar por nombre, RFC o ciudad..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {filtering && <div className="result-info">Mostrando {list.length} de {clientes.length} clientes</div>}

        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Cliente</th><th>Tipo</th><th>Contacto</th><th>Ciudad</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon="group" message="No se encontraron clientes con esos filtros." /></td></tr>
              ) : list.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => navigate(`/clientes/${c.id}`)}>
                  <td><div className="cell-entity"><Avatar name={c.nombre} /><div><div className="entity-name">{c.nombre}</div><div className="entity-sub">RFC: {c.rfc}</div></div></div></td>
                  <td><Chip tone="navy">{c.tipo}</Chip></td>
                  <td><div style={{ fontWeight: 600, fontSize: '.8rem' }}>{c.contacto}</div><div className="entity-sub">{c.telefono}</div></td>
                  <td>{c.ciudad}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="row-actions">
                      <button type="button" className="action-btn view" title="Ver detalle" onClick={() => navigate(`/clientes/${c.id}`)}><span className="material-symbols-outlined">visibility</span></button>
                      <button type="button" className="action-btn edit" title="Editar" onClick={() => openEdit(c)}><span className="material-symbols-outlined">edit</span></button>
                      <button type="button" className="action-btn del" title="Eliminar" onClick={() => setConfirmDel(c)}><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ClienteForm key={editing ? editing.id : 'new'} open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Eliminar cliente"
        message={confirmDel ? `¿Seguro que deseas eliminar a "${confirmDel.nombre}"? Esta acción no se puede deshacer.` : ''}
        onConfirm={() => { deleteCliente(confirmDel.id); toast('success', 'Cliente eliminado.'); }}
      />
    </div>
  );
}
