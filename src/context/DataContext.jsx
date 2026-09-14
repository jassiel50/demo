import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}

/* ---------------------------------------------------------------- helpers ---------------------------------------------------------------- */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
export function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
export function isoDateTime(d) {
  return d.toISOString();
}
export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' +
    d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}
export function fmtMoney(n) {
  return (n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
}
export function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
export function fmtBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ---------------------------------------------------------------- seed data ---------------------------------------------------------------- */
const seedProductos = [
  { id: 1, nombre: 'Laptop Empresarial 15"', categoria: 'Cómputo', sku: 'CMP-1001', precio: 18500, stock: 14, stockMin: 5, fechaAlta: isoDate(daysAgo(210)), descripcion: 'Equipo empresarial de alto rendimiento, 16GB RAM, 512GB SSD, garantía de 3 años en sitio.' },
  { id: 2, nombre: 'Monitor 27" 4K', categoria: 'Cómputo', sku: 'CMP-1002', precio: 6200, stock: 3, stockMin: 6, fechaAlta: isoDate(daysAgo(180)), descripcion: 'Panel IPS 4K, 99% sRGB, ideal para diseño y edición.' },
  { id: 3, nombre: 'Silla Ergonómica', categoria: 'Mobiliario', sku: 'MOB-2001', precio: 4300, stock: 22, stockMin: 8, fechaAlta: isoDate(daysAgo(150)), descripcion: 'Soporte lumbar ajustable, malla transpirable, apoyabrazos 3D.' },
  { id: 4, nombre: 'Escritorio Ajustable', categoria: 'Mobiliario', sku: 'MOB-2002', precio: 7800, stock: 9, stockMin: 4, fechaAlta: isoDate(daysAgo(140)), descripcion: 'Altura eléctrica ajustable, superficie de 140x70cm.' },
  { id: 5, nombre: 'Impresora Láser Multifuncional', categoria: 'Oficina', sku: 'OFI-3001', precio: 5100, stock: 0, stockMin: 3, fechaAlta: isoDate(daysAgo(120)), descripcion: 'Impresión, escaneo y copiado en red, dúplex automático.' },
  { id: 6, nombre: 'Router Wi-Fi 6', categoria: 'Redes', sku: 'RED-4001', precio: 2350, stock: 17, stockMin: 5, fechaAlta: isoDate(daysAgo(95)), descripcion: 'Cobertura mesh compatible, hasta 128 dispositivos.' },
  { id: 7, nombre: 'Disco SSD 1TB NVMe', categoria: 'Cómputo', sku: 'CMP-1003', precio: 1650, stock: 41, stockMin: 10, fechaAlta: isoDate(daysAgo(80)), descripcion: 'Lectura hasta 3500MB/s, factor M.2 2280.' },
  { id: 8, nombre: 'Teclado Mecánico Retroiluminado', categoria: 'Accesorios', sku: 'ACC-5001', precio: 1200, stock: 2, stockMin: 6, fechaAlta: isoDate(daysAgo(60)), descripcion: 'Switches táctiles, retroiluminación RGB, layout español.' },
  { id: 9, nombre: 'Webcam HD 1080p', categoria: 'Accesorios', sku: 'ACC-5002', precio: 850, stock: 28, stockMin: 8, fechaAlta: isoDate(daysAgo(45)), descripcion: 'Enfoque automático, micrófono con cancelación de ruido.' },
  { id: 10, nombre: 'Proyector Portátil', categoria: 'Oficina', sku: 'OFI-3002', precio: 9400, stock: 6, stockMin: 3, fechaAlta: isoDate(daysAgo(20)), descripcion: 'Resolución nativa 1080p, 3200 lúmenes, Wi-Fi integrado.' },
];

const seedClientes = [
  { id: 1, nombre: 'Grupo Industrial del Norte', tipo: 'Corporativo', rfc: 'GIN920314AB1', contacto: 'Marcela Reyes', telefono: '55 1234 5678', email: 'compras@gin.mx', ciudad: 'Monterrey', fechaAlta: isoDate(daysAgo(300)),
    archivos: [], seguimientos: [
      { id: 1, fecha: isoDateTime(daysAgo(40)), autor: 'Usuario Demo', nota: 'Llamada de seguimiento: interesados en ampliar el pedido de laptops para el Q3.' },
      { id: 2, fecha: isoDateTime(daysAgo(12)), autor: 'Usuario Demo', nota: 'Se envió cotización de monitores adicionales, en espera de aprobación de compras.' },
    ] },
  { id: 2, nombre: 'Secretaría de Obras Municipales', tipo: 'Gobierno', rfc: 'SOM010101XY2', contacto: 'Ing. Raúl Peña', telefono: '55 8765 4321', email: 'raul.pena@obras.gob.mx', ciudad: 'Ciudad de México', fechaAlta: isoDate(daysAgo(260)),
    archivos: [], seguimientos: [
      { id: 1, fecha: isoDateTime(daysAgo(29)), autor: 'Usuario Demo', nota: 'Pedido pendiente de pago, requiere factura con orden de compra municipal.' },
    ] },
  { id: 3, nombre: 'Comercializadora Vega', tipo: 'PYME', rfc: 'CVE180922K44', contacto: 'Ana Vega', telefono: '33 2211 0099', email: 'ana@comercializadoravega.com', ciudad: 'Guadalajara', fechaAlta: isoDate(daysAgo(200)), archivos: [], seguimientos: [] },
  { id: 4, nombre: 'Talleres Hernández SA', tipo: 'PYME', rfc: 'THE150606J91', contacto: 'Jorge Hernández', telefono: '81 4455 6677', email: 'jorge@thsa.mx', ciudad: 'Monterrey', fechaAlta: isoDate(daysAgo(170)),
    archivos: [], seguimientos: [
      { id: 1, fecha: isoDateTime(daysAgo(18)), autor: 'Usuario Demo', nota: 'Canceló el pedido de monitores por recorte de presupuesto interno.' },
    ] },
  { id: 5, nombre: 'Luis Fernando Castillo', tipo: 'Individual', rfc: 'CAFL900101ABC', contacto: 'Luis Castillo', telefono: '55 3344 5566', email: 'lfcastillo@gmail.com', ciudad: 'Puebla', fechaAlta: isoDate(daysAgo(130)), archivos: [], seguimientos: [] },
  { id: 6, nombre: 'Distribuidora Pacífico', tipo: 'Corporativo', rfc: 'DPA110303QW8', contacto: 'Sofía Ramírez', telefono: '33 9988 7766', email: 'sofia.ramirez@pacifico.mx', ciudad: 'Guadalajara', fechaAlta: isoDate(daysAgo(90)), archivos: [], seguimientos: [] },
  { id: 7, nombre: 'Municipio de San Pedro', tipo: 'Gobierno', rfc: 'MSP020202RT5', contacto: 'Lic. Diana Torres', telefono: '81 2233 4455', email: 'diana.torres@sanpedro.gob.mx', ciudad: 'Monterrey', fechaAlta: isoDate(daysAgo(50)), archivos: [], seguimientos: [] },
  { id: 8, nombre: 'Café & Co. Cadena Regional', tipo: 'PYME', rfc: 'CCC170707LM3', contacto: 'Pablo Núñez', telefono: '55 6677 8899', email: 'pablo@cafeandco.mx', ciudad: 'Ciudad de México', fechaAlta: isoDate(daysAgo(15)), archivos: [], seguimientos: [] },
];

const ventaPlantillas = [
  { clienteId: 1, dias: 38, estado: 'Pagado', items: [{ productoId: 1, cantidad: 3 }, { productoId: 7, cantidad: 5 }] },
  { clienteId: 3, dias: 33, estado: 'Pagado', items: [{ productoId: 3, cantidad: 6 }, { productoId: 4, cantidad: 2 }] },
  { clienteId: 2, dias: 29, estado: 'Pendiente', items: [{ productoId: 10, cantidad: 2 }] },
  { clienteId: 5, dias: 24, estado: 'Pagado', items: [{ productoId: 8, cantidad: 1 }, { productoId: 9, cantidad: 1 }] },
  { clienteId: 4, dias: 19, estado: 'Cancelado', items: [{ productoId: 2, cantidad: 2 }] },
  { clienteId: 6, dias: 14, estado: 'Pagado', items: [{ productoId: 1, cantidad: 1 }, { productoId: 6, cantidad: 4 }] },
  { clienteId: 7, dias: 9, estado: 'Pendiente', items: [{ productoId: 5, cantidad: 1 }, { productoId: 9, cantidad: 3 }] },
  { clienteId: 8, dias: 4, estado: 'Pagado', items: [{ productoId: 7, cantidad: 10 }] },
  { clienteId: 1, dias: 2, estado: 'Pendiente', items: [{ productoId: 3, cantidad: 4 }, { productoId: 4, cantidad: 1 }] },
];
const seedVentas = ventaPlantillas.map((t, idx) => {
  const id = idx + 1;
  const items = t.items.map((it) => ({
    productoId: it.productoId,
    cantidad: it.cantidad,
    precioUnitario: seedProductos.find((p) => p.id === it.productoId).precio,
  }));
  return {
    id,
    folio: 'V-' + String(id).padStart(4, '0'),
    clienteId: t.clienteId,
    fecha: isoDate(daysAgo(t.dias)),
    estado: t.estado,
    items,
    archivos: [],
    seguimientos: id === 1 ? [{ id: 1, fecha: isoDateTime(daysAgo(35)), autor: 'Usuario Demo', nota: 'Entrega confirmada en almacén del cliente, firma de recibido adjunta.' }] : [],
  };
});

const seedEmpleados = [
  { id: 1, nombre: 'Daniela Ortiz', puesto: 'Gerente de Ventas', departamento: 'Comercial', email: 'daniela.ortiz@zadesarrollo.mx', telefono: '55 1122 3344', fechaIngreso: isoDate(daysAgo(920)), estado: 'Activo', salario: 38000, ciudad: 'Ciudad de México', archivos: [], seguimientos: [] },
  { id: 2, nombre: 'Roberto Salinas', puesto: 'Ejecutivo de Cuentas', departamento: 'Comercial', email: 'roberto.salinas@zadesarrollo.mx', telefono: '81 2233 4455', fechaIngreso: isoDate(daysAgo(640)), estado: 'Activo', salario: 22000, ciudad: 'Monterrey', archivos: [], seguimientos: [
    { id: 1, fecha: isoDateTime(daysAgo(6)), autor: 'Daniela Ortiz', nota: 'Evaluación trimestral: superó la meta de ventas en 12%.' },
  ] },
  { id: 3, nombre: 'Karla Jiménez', puesto: 'Analista de Inventarios', departamento: 'Operaciones', email: 'karla.jimenez@zadesarrollo.mx', telefono: '33 4455 6677', fechaIngreso: isoDate(daysAgo(510)), estado: 'Activo', salario: 19500, ciudad: 'Guadalajara', archivos: [], seguimientos: [] },
  { id: 4, nombre: 'Emilio Torres', puesto: 'Soporte Técnico', departamento: 'Operaciones', email: 'emilio.torres@zadesarrollo.mx', telefono: '55 5566 7788', fechaIngreso: isoDate(daysAgo(380)), estado: 'Activo', salario: 16800, ciudad: 'Ciudad de México', archivos: [], seguimientos: [] },
  { id: 5, nombre: 'Paola Guzmán', puesto: 'Contadora', departamento: 'Finanzas', email: 'paola.guzman@zadesarrollo.mx', telefono: '81 6677 8899', fechaIngreso: isoDate(daysAgo(700)), estado: 'Activo', salario: 26000, ciudad: 'Monterrey', archivos: [], seguimientos: [] },
  { id: 6, nombre: 'Hugo Fuentes', puesto: 'Almacenista', departamento: 'Operaciones', email: 'hugo.fuentes@zadesarrollo.mx', telefono: '33 7788 9900', fechaIngreso: isoDate(daysAgo(210)), estado: 'Baja', salario: 14500, ciudad: 'Guadalajara', archivos: [], seguimientos: [
    { id: 1, fecha: isoDateTime(daysAgo(15)), autor: 'Daniela Ortiz', nota: 'Baja voluntaria, último día de labores confirmado.' },
  ] },
];

const movTemplates = [
  { productoId: 7, tipo: 'Entrada', cantidad: 30, dias: 55, motivo: 'Reabastecimiento de proveedor', responsable: 'Karla Jiménez' },
  { productoId: 1, tipo: 'Salida', cantidad: 3, dias: 38, motivo: 'Venta V-0001', responsable: 'Hugo Fuentes' },
  { productoId: 3, tipo: 'Salida', cantidad: 6, dias: 33, motivo: 'Venta V-0002', responsable: 'Hugo Fuentes' },
  { productoId: 8, tipo: 'Entrada', cantidad: 10, dias: 30, motivo: 'Compra a proveedor local', responsable: 'Karla Jiménez' },
  { productoId: 8, tipo: 'Salida', cantidad: 14, dias: 22, motivo: 'Ajuste por demanda alta', responsable: 'Karla Jiménez' },
  { productoId: 2, tipo: 'Entrada', cantidad: 8, dias: 20, motivo: 'Reabastecimiento de proveedor', responsable: 'Karla Jiménez' },
  { productoId: 2, tipo: 'Salida', cantidad: 10, dias: 12, motivo: 'Pedido corporativo', responsable: 'Hugo Fuentes' },
  { productoId: 5, tipo: 'Salida', cantidad: 4, dias: 9, motivo: 'Falla de proveedor, stock agotado', responsable: 'Hugo Fuentes' },
  { productoId: 10, tipo: 'Entrada', cantidad: 6, dias: 6, motivo: 'Compra a proveedor local', responsable: 'Karla Jiménez' },
];
const seedMovimientos = movTemplates.map((m, idx) => ({ id: idx + 1, ...m, fecha: isoDate(daysAgo(m.dias)) }));

/* ---------------------------------------------------------------- provider ---------------------------------------------------------------- */
export function DataProvider({ children }) {
  const [productos, setProductos] = useState(seedProductos);
  const [clientes, setClientes] = useState(seedClientes);
  const [ventas, setVentas] = useState(seedVentas);
  const [empleados, setEmpleados] = useState(seedEmpleados);
  const [movimientos, setMovimientos] = useState(seedMovimientos);
  const [nextIds, setNextIds] = useState({ producto: 11, cliente: 9, venta: 10, empleado: 7, movimiento: 10 });

  const [authed, setAuthed] = useState(false);
  const [userLabel, setUserLabel] = useState('Usuario Demo');

  const login = useCallback((label) => {
    if (label) setUserLabel(label);
    setAuthed(true);
  }, []);
  const logout = useCallback(() => setAuthed(false), []);

  const collections = useMemo(
    () => ({
      producto: [productos, setProductos],
      cliente: [clientes, setClientes],
      venta: [ventas, setVentas],
      empleado: [empleados, setEmpleados],
    }),
    [productos, clientes, ventas, empleados]
  );

  const getProducto = useCallback((id) => productos.find((p) => p.id === Number(id)), [productos]);
  const getCliente = useCallback((id) => clientes.find((c) => c.id === Number(id)), [clientes]);
  const getVenta = useCallback((id) => ventas.find((v) => v.id === Number(id)), [ventas]);
  const getEmpleado = useCallback((id) => empleados.find((e) => e.id === Number(id)), [empleados]);

  const ventaTotal = useCallback((v) => v.items.reduce((s, it) => s + it.cantidad * it.precioUnitario, 0), []);

  const productoEstado = useCallback((p) => {
    if (p.stock <= 0) return { label: 'Agotado', chip: 'chip-red' };
    if (p.stock <= p.stockMin) return { label: 'Bajo stock', chip: 'chip-amber' };
    return { label: 'Disponible', chip: 'chip-green' };
  }, []);

  const estadoVentaChip = useCallback((e) => {
    if (e === 'Pagado') return 'chip-green';
    if (e === 'Pendiente') return 'chip-amber';
    return 'chip-red';
  }, []);

  /* ---- productos ---- */
  const saveProducto = useCallback(
    (id, data) => {
      if (id) {
        setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
      } else {
        setProductos((prev) => [...prev, { id: nextIds.producto, archivos: [], fechaAlta: isoDate(new Date()), ...data }]);
        setNextIds((n) => ({ ...n, producto: n.producto + 1 }));
      }
    },
    [nextIds.producto]
  );
  const deleteProducto = useCallback((id) => setProductos((prev) => prev.filter((p) => p.id !== id)), []);

  /* ---- clientes ---- */
  const saveCliente = useCallback(
    (id, data) => {
      if (id) {
        setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
      } else {
        setClientes((prev) => [...prev, { id: nextIds.cliente, archivos: [], seguimientos: [], fechaAlta: isoDate(new Date()), ...data }]);
        setNextIds((n) => ({ ...n, cliente: n.cliente + 1 }));
      }
    },
    [nextIds.cliente]
  );
  const deleteCliente = useCallback((id) => setClientes((prev) => prev.filter((c) => c.id !== id)), []);

  /* ---- ventas ---- */
  const saveVenta = useCallback(
    (id, data) => {
      if (id) {
        setVentas((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
      } else {
        setVentas((prev) => [
          ...prev,
          { id: nextIds.venta, folio: 'V-' + String(nextIds.venta).padStart(4, '0'), archivos: [], seguimientos: [], fecha: isoDate(new Date()), ...data },
        ]);
        setNextIds((n) => ({ ...n, venta: n.venta + 1 }));
      }
    },
    [nextIds.venta]
  );
  const deleteVenta = useCallback((id) => setVentas((prev) => prev.filter((v) => v.id !== id)), []);

  /* ---- empleados ---- */
  const saveEmpleado = useCallback(
    (id, data) => {
      if (id) {
        setEmpleados((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
      } else {
        setEmpleados((prev) => [...prev, { id: nextIds.empleado, archivos: [], seguimientos: [], fechaIngreso: isoDate(new Date()), estado: 'Activo', ...data }]);
        setNextIds((n) => ({ ...n, empleado: n.empleado + 1 }));
      }
    },
    [nextIds.empleado]
  );
  const deleteEmpleado = useCallback((id) => setEmpleados((prev) => prev.filter((e) => e.id !== id)), []);

  /* ---- inventario / movimientos ---- */
  const registrarMovimiento = useCallback(
    ({ productoId, tipo, cantidad, motivo, responsable }) => {
      setMovimientos((prev) => [
        { id: nextIds.movimiento, productoId, tipo, cantidad, motivo, responsable, fecha: isoDate(new Date()) },
        ...prev,
      ]);
      setNextIds((n) => ({ ...n, movimiento: n.movimiento + 1 }));
      setProductos((prev) =>
        prev.map((p) => {
          if (p.id !== productoId) return p;
          const delta = tipo === 'Entrada' ? cantidad : -cantidad;
          return { ...p, stock: Math.max(0, p.stock + delta) };
        })
      );
    },
    [nextIds.movimiento]
  );

  /* ---- archivos & seguimientos genéricos (clientes, ventas, empleados, productos) ---- */
  const addArchivo = useCallback(
    (kind, id, file) => {
      const [, setter] = collections[kind];
      const archivo = {
        id: Date.now() + Math.random(),
        nombre: file.name,
        tamano: file.size,
        tipo: file.type,
        url: URL.createObjectURL(file),
        fecha: isoDateTime(new Date()),
      };
      setter((prev) => prev.map((item) => (item.id === id ? { ...item, archivos: [archivo, ...(item.archivos || [])] } : item)));
    },
    [collections]
  );
  const removeArchivo = useCallback(
    (kind, id, archivoId) => {
      const [, setter] = collections[kind];
      setter((prev) =>
        prev.map((item) => (item.id === id ? { ...item, archivos: (item.archivos || []).filter((a) => a.id !== archivoId) } : item))
      );
    },
    [collections]
  );
  const addSeguimiento = useCallback(
    (kind, id, nota) => {
      const [, setter] = collections[kind];
      const entry = { id: Date.now() + Math.random(), fecha: isoDateTime(new Date()), autor: userLabel, nota };
      setter((prev) =>
        prev.map((item) => (item.id === id ? { ...item, seguimientos: [entry, ...(item.seguimientos || [])] } : item))
      );
    },
    [collections, userLabel]
  );

  const value = {
    productos, clientes, ventas, empleados, movimientos,
    authed, userLabel, login, logout,
    getProducto, getCliente, getVenta, getEmpleado,
    ventaTotal, productoEstado, estadoVentaChip,
    saveProducto, deleteProducto,
    saveCliente, deleteCliente,
    saveVenta, deleteVenta,
    saveEmpleado, deleteEmpleado,
    registrarMovimiento,
    addArchivo, removeArchivo, addSeguimiento,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
