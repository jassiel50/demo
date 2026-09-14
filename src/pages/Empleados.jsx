import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, fmtDate, fmtMoney } from '../context/DataContext.jsx';
import { StatCard, Chip, Avatar, EmptyState } from '../components/UI.jsx';
import { Modal, ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';

const DEPARTAMENTOS = ['Comercial', 'Operaciones', 'Finanzas', 'Recursos Humanos', 'Dirección'];

export function EmpleadoForm({ open, onClose, editing }) {
  const { saveEmpleado } = useData();
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    nombre: editing?.nombre || '', puesto: editing?.puesto || '', departamento: editing?.departamento || DEPARTAMENTOS[0],
    email: editing?.email || '', telefono: editing?.telefono || '', ciudad: editing?.ciudad || '',
    fechaIngreso: editing?.fechaIngreso || '', estado: editing?.estado || 'Activo', salario: editing?.salario ?? '',
  }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const salario = parseFloat(form.salario);
    if (!form.nombre.trim() || !form.puesto.trim() || Number.isNaN(salario)) {
      toast('error', 'Completa todos los campos correctamente.');
      return;
    }
    saveEmpleado(editing?.id ?? null, { ...form, salario });
    toast('success', editing ? 'Empleado actualizado correctamente.' : 'Empleado registrado correctamente.');
    onClose();
  };

  return (
    <Modal
      open={open} onClose={onClose} width="600px"
      title={editing ? 'Editar empleado' : 'Nuevo empleado'}
      icon={editing ? 'edit' : 'badge'}
      footer={<>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" form="empForm" className="btn btn-primary"><span className="material-symbols-outlined">save</span>Guardar</button>
      </>}
    >
      <form id="empForm" onSubmit={submit}>
        <div className="form-grid">
          <div className="fld full"><label>Nombre completo</label><input value={form.nombre} onChange={set('nombre')} required /></div>
          <div className="fld"><label>Puesto</label><input value={form.puesto} onChange={set('puesto')} placeholder="Ej. Ejecutivo de Cuentas" required /></div>
          <div className="fld"><label>Departamento</label><select value={form.departamento} onChange={set('departamento')}>{DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}</select></div>
          <div className="fld"><label>Correo</label><input type="email" value={form.email} onChange={set('email')} placeholder="nombre@zadesarrollo.mx" /></div>
          <div className="fld"><label>Teléfono</label><input value={form.telefono} onChange={set('telefono')} placeholder="55 0000 0000" /></div>
          <div className="fld"><label>Ciudad</label><input value={form.ciudad} onChange={set('ciudad')} /></div>
          <div className="fld"><label>Estado</label><select value={form.estado} onChange={set('estado')}><option>Activo</option><option>Baja</option></select></div>
          <div className="fld"><label>Fecha de ingreso</label><input type="date" value={form.fechaIngreso} onChange={set('fechaIngreso')} /></div>
          <div className="fld full"><label>Salario mensual (MXN)</label><input type="number" min="0" step="1" value={form.salario} onChange={set('salario')} required /></div>
        </div>
      </form>
    </Modal>
  );
}

export default function Empleados() {
  const { empleados, deleteEmpleado } = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [depFilter, setDepFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const departamentos = useMemo(() => [...new Set(empleados.map((e) => e.departamento))].sort(), [empleados]);

  const list = useMemo(() => {
    const q = search.toLowerCase().trim();
    return empleados.filter((e) => {
      if (depFilter && e.departamento !== depFilter) return false;
      if (estadoFilter && e.estado !== estadoFilter) return false;
      if (q && !(e.nombre.toLowerCase().includes(q) || e.puesto.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [empleados, search, depFilter, estadoFilter]);

  const activos = empleados.filter((e) => e.estado === 'Activo');
  const nominaMensual = activos.reduce((s, e) => s + e.salario, 0);
  const filtering = search || depFilter || estadoFilter;

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (e) => { setEditing(e); setFormOpen(true); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Empleados</h1>
          <p className="page-desc">Directorio de personal, puestos y nómina.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={openNew}><span className="material-symbols-outlined">add</span>Nuevo empleado</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard tone="navy" label="Total empleados" value={empleados.length} />
        <StatCard tone="green" label="Activos" value={activos.length} />
        <StatCard tone="blue" label="Departamentos" value={departamentos.length} />
        <StatCard tone="amber" label="Nómina mensual" value={fmtMoney(nominaMensual)} />
      </div>

      <div className="table-shell">
        <div className="toolbar">
          <div className="search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Buscar por nombre o puesto..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={depFilter} onChange={(e) => setDepFilter(e.target.value)}>
            <option value="">Todos los departamentos</option>
            {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="filter-select" value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option>Activo</option><option>Baja</option>
          </select>
        </div>
        {filtering && <div className="result-info">Mostrando {list.length} de {empleados.length} empleados</div>}

        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Empleado</th><th>Departamento</th><th>Contacto</th><th>Ingreso</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr></thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon="badge" message="No se encontraron empleados con esos filtros." /></td></tr>
              ) : list.map((e) => (
                <tr key={e.id} className="clickable" onClick={() => navigate(`/empleados/${e.id}`)}>
                  <td><div className="cell-entity"><Avatar name={e.nombre} /><div><div className="entity-name">{e.nombre}</div><div className="entity-sub">{e.puesto}</div></div></div></td>
                  <td><Chip tone="gray">{e.departamento}</Chip></td>
                  <td><div style={{ fontWeight: 600, fontSize: '.8rem' }}>{e.email}</div><div className="entity-sub">{e.telefono}</div></td>
                  <td className="entity-sub">{fmtDate(e.fechaIngreso)}</td>
                  <td><Chip tone={e.estado === 'Activo' ? 'green' : 'red'}>{e.estado}</Chip></td>
                  <td onClick={(ev) => ev.stopPropagation()}>
                    <div className="row-actions">
                      <button type="button" className="action-btn view" title="Ver detalle" onClick={() => navigate(`/empleados/${e.id}`)}><span className="material-symbols-outlined">visibility</span></button>
                      <button type="button" className="action-btn edit" title="Editar" onClick={() => openEdit(e)}><span className="material-symbols-outlined">edit</span></button>
                      <button type="button" className="action-btn del" title="Eliminar" onClick={() => setConfirmDel(e)}><span className="material-symbols-outlined">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmpleadoForm key={editing ? editing.id : 'new'} open={formOpen} onClose={() => setFormOpen(false)} editing={editing} />

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Eliminar empleado"
        message={confirmDel ? `¿Seguro que deseas eliminar a "${confirmDel.nombre}"? Esta acción no se puede deshacer.` : ''}
        onConfirm={() => { deleteEmpleado(confirmDel.id); toast('success', 'Empleado eliminado.'); }}
      />
    </div>
  );
}
