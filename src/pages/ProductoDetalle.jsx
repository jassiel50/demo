import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData, fmtDate, fmtMoney } from '../context/DataContext.jsx';
import { Chip, EmptyState } from '../components/UI.jsx';
import DetailShell from '../components/DetailShell.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { ProductoForm } from './Productos.jsx';

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getProducto, deleteProducto, productoEstado, movimientos } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const producto = getProducto(id);
  if (!producto) {
    return <EmptyState icon="inventory_2" message="Este producto ya no existe." />;
  }
  const est = productoEstado(producto);
  const historial = movimientos.filter((m) => m.productoId === producto.id);

  const infoContent = (
    <div className="card">
      <div className="info-grid">
        <div className="info-field"><label>SKU</label><span>{producto.sku}</span></div>
        <div className="info-field"><label>Categoría</label><span>{producto.categoria}</span></div>
        <div className="info-field"><label>Precio</label><span>{fmtMoney(producto.precio)}</span></div>
        <div className="info-field"><label>Stock actual</label><span>{producto.stock} unidades</span></div>
        <div className="info-field"><label>Stock mínimo</label><span>{producto.stockMin} unidades</span></div>
        <div className="info-field"><label>Alta en catálogo</label><span>{fmtDate(producto.fechaAlta)}</span></div>
        {producto.descripcion && (
          <div className="info-field full" style={{ gridColumn: '1/-1' }}>
            <label>Descripción</label>
            <span style={{ fontWeight: 400 }}>{producto.descripcion}</span>
          </div>
        )}
      </div>
    </div>
  );

  const movimientosTab = (
    <div className="card">
      {historial.length === 0 ? (
        <EmptyState icon="swap_vert" message="Este producto no tiene movimientos de inventario registrados." />
      ) : (
        <table className="mini-table">
          <tbody>
            {historial.map((m) => (
              <tr key={m.id}>
                <td>
                  <Chip tone={m.tipo === 'Entrada' ? 'green' : 'amber'}>{m.tipo}</Chip>
                </td>
                <td><span className="mini-name">{m.cantidad} pzas</span><br /><span className="mini-sub">{m.motivo}</span></td>
                <td className="mini-sub">{m.responsable}</td>
                <td className="mini-sub" style={{ textAlign: 'right' }}>{fmtDate(m.fecha)}</td>
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
        backTo="/productos"
        backLabel="Volver a productos"
        avatarLabel={<span className="material-symbols-outlined">inventory_2</span>}
        title={producto.nombre}
        subtitle={`SKU ${producto.sku} · ${producto.categoria}`}
        badges={<Chip tone={est.chip.replace('chip-', '')}>{est.label}</Chip>}
        headerActions={<>
          <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(true)}><span className="material-symbols-outlined">edit</span>Editar</button>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDel(true)}><span className="material-symbols-outlined">delete</span>Eliminar</button>
        </>}
        infoLabel="Información"
        infoContent={infoContent}
        extraTabs={[{ key: 'movimientos', label: 'Movimientos', icon: 'swap_vert', count: historial.length, content: movimientosTab }]}
        entity={{ kind: 'producto', id: producto.id, archivos: producto.archivos, seguimientos: producto.seguimientos }}
      />

      <ProductoForm key={producto.id} open={formOpen} onClose={() => setFormOpen(false)} editing={producto} />

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Eliminar producto"
        message={`¿Seguro que deseas eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={() => { deleteProducto(producto.id); toast('success', 'Producto eliminado.'); navigate('/productos'); }}
      />
    </div>
  );
}
