import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, fmtDate, fmtMoney } from '../context/DataContext.jsx';
import { Chip, EmptyState } from '../components/UI.jsx';
import DetailShell from '../components/DetailShell.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { ClienteForm } from './Clientes.jsx';

export default function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getCliente, deleteCliente, ventas, ventaTotal, estadoVentaChip } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const cliente = getCliente(id);
  if (!cliente) {
    return <EmptyState icon="group" message="Este cliente ya no existe." />;
  }
  const compras = ventas.filter((v) => v.clienteId === cliente.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const totalComprado = compras.filter((v) => v.estado === 'Pagado').reduce((s, v) => s + ventaTotal(v), 0);

  const infoContent = (
    <div className="card">
      <div className="info-grid">
        <div className="info-field"><label>Tipo de cliente</label><span>{cliente.tipo}</span></div>
        <div className="info-field"><label>RFC</label><span>{cliente.rfc}</span></div>
        <div className="info-field"><label>Contacto principal</label><span>{cliente.contacto}</span></div>
        <div className="info-field"><label>Teléfono</label><span>{cliente.telefono || '—'}</span></div>
        <div className="info-field"><label>Correo</label><span>{cliente.email || '—'}</span></div>
        <div className="info-field"><label>Ciudad</label><span>{cliente.ciudad || '—'}</span></div>
        <div className="info-field"><label>Cliente desde</label><span>{fmtDate(cliente.fechaAlta)}</span></div>
        <div className="info-field"><label>Total comprado (pagado)</label><span>{fmtMoney(totalComprado)}</span></div>
      </div>
    </div>
  );

  const comprasTab = (
    <div className="card">
      {compras.length === 0 ? (
        <EmptyState icon="point_of_sale" message="Este cliente todavía no tiene ventas registradas." />
      ) : (
        <table className="mini-table">
          <tbody>
            {compras.map((v) => (
              <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/ventas/${v.id}`)}>
                <td><span className="mini-name">{v.folio}</span><br /><span className="mini-sub">{fmtDate(v.fecha)}</span></td>
                <td><Chip tone={estadoVentaChip(v.estado).replace('chip-', '')}>{v.estado}</Chip></td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--navy)' }}>{fmtMoney(ventaTotal(v))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      <DetailShell
        backTo="/clientes"
        backLabel="Volver a clientes"
        avatarLabel={cliente.nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
        title={cliente.nombre}
        subtitle={`${cliente.contacto} · ${cliente.ciudad || 'Sin ciudad'}`}
        badges={<Chip tone="navy">{cliente.tipo}</Chip>}
        headerActions={<>
          <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(true)}><span className="material-symbols-outlined">edit</span>Editar</button>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDel(true)}><span className="material-symbols-outlined">delete</span>Eliminar</button>
        </>}
        infoLabel="Información"
        infoContent={infoContent}
        extraTabs={[{ key: 'compras', label: 'Compras', icon: 'point_of_sale', count: compras.length, content: comprasTab }]}
        entity={{ kind: 'cliente', id: cliente.id, archivos: cliente.archivos, seguimientos: cliente.seguimientos }}
      />

      <ClienteForm key={cliente.id} open={formOpen} onClose={() => setFormOpen(false)} editing={cliente} />

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Eliminar cliente"
        message={`¿Seguro que deseas eliminar a "${cliente.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => { deleteCliente(cliente.id); toast('success', 'Cliente eliminado.'); navigate('/clientes'); }}
      />
    </div>
  );
}
