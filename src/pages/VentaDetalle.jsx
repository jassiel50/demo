import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, fmtDate, fmtMoney } from '../context/DataContext.jsx';
import { Chip, EmptyState } from '../components/UI.jsx';
import DetailShell from '../components/DetailShell.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { VentaForm } from './Ventas.jsx';

export default function VentaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getVenta, getCliente, getProducto, deleteVenta, ventaTotal, estadoVentaChip } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const venta = getVenta(id);
  if (!venta) {
    return <EmptyState icon="point_of_sale" message="Esta venta ya no existe." />;
  }
  const cliente = getCliente(venta.clienteId);

  const infoContent = (
    <div className="card">
      <div className="info-grid">
        <div className="info-field"><label>Cliente</label><span>{cliente ? cliente.nombre : 'Cliente eliminado'}</span></div>
        <div className="info-field"><label>Fecha</label><span>{fmtDate(venta.fecha)}</span></div>
        <div className="info-field"><label>Estado</label><span><Chip tone={estadoVentaChip(venta.estado).replace('chip-', '')}>{venta.estado}</Chip></span></div>
        <div className="info-field"><label>Total</label><span>{fmtMoney(ventaTotal(venta))}</span></div>
      </div>

      <table className="mini-table" style={{ marginTop: '1.3rem' }}>
        <tbody>
          {venta.items.map((it, i) => {
            const p = getProducto(it.productoId);
            return (
              <tr key={i}>
                <td>
                  <span className="mini-name">{p ? p.nombre : 'Producto eliminado'}</span>
                  <br /><span className="mini-sub">{it.cantidad} × {fmtMoney(it.precioUnitario)}</span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtMoney(it.cantidad * it.precioUnitario)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="sale-total-row" style={{ marginTop: '.9rem' }}><span>Total</span><span>{fmtMoney(ventaTotal(venta))}</span></div>
    </div>
  );

  return (
    <div>
      <DetailShell
        backTo="/ventas"
        backLabel="Volver a ventas"
        avatarLabel={<span className="material-symbols-outlined">receipt_long</span>}
        title={venta.folio}
        subtitle={cliente ? cliente.nombre : 'Cliente eliminado'}
        badges={<Chip tone={estadoVentaChip(venta.estado).replace('chip-', '')}>{venta.estado}</Chip>}
        headerActions={<>
          <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(true)}><span className="material-symbols-outlined">edit</span>Editar</button>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDel(true)}><span className="material-symbols-outlined">delete</span>Eliminar</button>
        </>}
        infoLabel="Detalle"
        infoContent={infoContent}
        entity={{ kind: 'venta', id: venta.id, archivos: venta.archivos, seguimientos: venta.seguimientos }}
      />

      <VentaForm key={venta.id} open={formOpen} onClose={() => setFormOpen(false)} editing={venta} />

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Eliminar venta"
        message={`¿Seguro que deseas eliminar la venta "${venta.folio}"? Esta acción no se puede deshacer.`}
        onConfirm={() => { deleteVenta(venta.id); toast('success', 'Venta eliminada.'); navigate('/ventas'); }}
      />
    </div>
  );
}
