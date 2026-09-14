import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, fmtDate, fmtMoney } from '../context/DataContext.jsx';
import { Chip, EmptyState } from '../components/UI.jsx';
import DetailShell from '../components/DetailShell.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { EmpleadoForm } from './Empleados.jsx';

export default function EmpleadoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getEmpleado, deleteEmpleado } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const empleado = getEmpleado(id);
  if (!empleado) {
    return <EmptyState icon="badge" message="Este empleado ya no existe." />;
  }

  const infoContent = (
    <div className="card">
      <div className="info-grid">
        <div className="info-field"><label>Puesto</label><span>{empleado.puesto}</span></div>
        <div className="info-field"><label>Departamento</label><span>{empleado.departamento}</span></div>
        <div className="info-field"><label>Correo</label><span>{empleado.email || '—'}</span></div>
        <div className="info-field"><label>Teléfono</label><span>{empleado.telefono || '—'}</span></div>
        <div className="info-field"><label>Ciudad</label><span>{empleado.ciudad || '—'}</span></div>
        <div className="info-field"><label>Fecha de ingreso</label><span>{fmtDate(empleado.fechaIngreso)}</span></div>
        <div className="info-field"><label>Estado</label><span><Chip tone={empleado.estado === 'Activo' ? 'green' : 'red'}>{empleado.estado}</Chip></span></div>
        <div className="info-field"><label>Salario mensual</label><span>{fmtMoney(empleado.salario)}</span></div>
      </div>
    </div>
  );

  return (
    <div>
      <DetailShell
        backTo="/empleados"
        backLabel="Volver a empleados"
        avatarLabel={empleado.nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
        title={empleado.nombre}
        subtitle={`${empleado.puesto} · ${empleado.departamento}`}
        badges={<Chip tone={empleado.estado === 'Activo' ? 'green' : 'red'}>{empleado.estado}</Chip>}
        headerActions={<>
          <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(true)}><span className="material-symbols-outlined">edit</span>Editar</button>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDel(true)}><span className="material-symbols-outlined">delete</span>Eliminar</button>
        </>}
        infoLabel="Información"
        infoContent={infoContent}
        entity={{ kind: 'empleado', id: empleado.id, archivos: empleado.archivos, seguimientos: empleado.seguimientos }}
      />

      <EmpleadoForm key={empleado.id} open={formOpen} onClose={() => setFormOpen(false)} editing={empleado} />

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Eliminar empleado"
        message={`¿Seguro que deseas eliminar a "${empleado.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => { deleteEmpleado(empleado.id); toast('success', 'Empleado eliminado.'); navigate('/empleados'); }}
      />
    </div>
  );
}
