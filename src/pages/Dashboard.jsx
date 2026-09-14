import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, fmtDate, fmtMoney } from '../context/DataContext.jsx';
import { StatCard, Chip, DonutChart, TrendBars } from '../components/UI.jsx';

export default function Dashboard() {
  const { productos, clientes, ventas, empleados, userLabel, getCliente, ventaTotal, estadoVentaChip } = useData();
  const navigate = useNavigate();

  const now = new Date();
  const isThisMonth = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };
  const ventasMes = ventas.filter((v) => isThisMonth(v.fecha) && v.estado !== 'Cancelado');
  const ingresosMes = ventasMes.reduce((s, v) => s + ventaTotal(v), 0);
  const bajoStock = productos.filter((p) => p.stock <= p.stockMin).length;
  const empleadosActivos = empleados.filter((e) => e.estado === 'Activo').length;

  const estadoData = useMemo(
    () => [
      { label: 'Pagado', color: '#16a34a', count: ventas.filter((v) => v.estado === 'Pagado').length },
      { label: 'Pendiente', color: '#f59e0b', count: ventas.filter((v) => v.estado === 'Pendiente').length },
      { label: 'Cancelado', color: '#ef4444', count: ventas.filter((v) => v.estado === 'Cancelado').length },
    ],
    [ventas]
  );

  const trendColumns = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    return months.map((d, idx) => {
      const value = idx === months.length - 1 ? ingresosMes : 38000 + idx * 9500 + ((idx * 37) % 5) * 3100;
      return {
        label: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
        value,
        display: fmtMoney(value).replace('MX$', '$').replace(/\.00$/, ''),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingresosMes]);

  const ultimasVentas = [...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Buen día, {userLabel}</h1>
          <p className="page-desc">Este es un resumen general de tu operación. Los datos son de ejemplo y viven solo en esta pestaña.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={() => navigate('/ventas')}>
            <span className="material-symbols-outlined">add</span>Nueva venta
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard tone="navy" label="Productos" value={productos.length} sub={`${bajoStock} con bajo stock`} />
        <StatCard tone="blue" label="Clientes" value={clientes.length} sub="registrados en el sistema" />
        <StatCard tone="green" label="Ventas del mes" value={ventasMes.length} sub={`${ventas.length} históricas`} />
        <StatCard tone="amber" label="Empleados activos" value={empleadosActivos} sub={`de ${empleados.length} en plantilla`} />
      </div>

      <div className="dash-grid">
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">Estado de ventas</h3>
          <p className="card-sub">Distribución histórica por estatus</p>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '.5rem 0' }}>
            <DonutChart data={estadoData} centerLabel="VENTAS" />
          </div>
          <div className="legend">
            {estadoData.map((d) => (
              <div className="legend-item" key={d.label}>
                <span className="legend-dot" style={{ background: d.color }} />
                <span className="legend-label">{d.label}</span>
                <span className="legend-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Ingresos · últimos 6 meses</h3>
          <p className="card-sub">Tendencia de ingresos facturados (incluye estimación del mes en curso)</p>
          <TrendBars columns={trendColumns} />
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Últimas ventas</h3>
        <p className="card-sub">Los 5 movimientos más recientes</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="mini-table">
            <tbody>
              {ultimasVentas.length ? (
                ultimasVentas.map((v) => {
                  const cli = getCliente(v.clienteId);
                  return (
                    <tr key={v.id} onClick={() => navigate(`/ventas/${v.id}`)} style={{ cursor: 'pointer' }}>
                      <td>
                        <span className="mini-name">{v.folio}</span>
                        <br />
                        <span className="mini-sub">{cli ? cli.nombre : '—'}</span>
                      </td>
                      <td className="mini-sub">{fmtDate(v.fecha)}</td>
                      <td><Chip tone={estadoVentaChip(v.estado).replace('chip-', '')}>{v.estado}</Chip></td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--navy)' }}>{fmtMoney(ventaTotal(v))}</td>
                    </tr>
                  );
                })
              ) : (
                <tr><td className="mini-sub">Sin ventas registradas todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
