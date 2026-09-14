# ZA Desarrollo — Demo ERP

Demo interactivo de un ERP (productos, inventarios, clientes, ventas y empleados) pensado para mostrarse a clientes potenciales. Construido con **React + Vite** (componentes, rutas con `react-router-dom`, páginas de detalle navegables), sin backend ni base de datos: todos los datos viven en memoria del navegador y se reinician al recargar la página.

## Módulos

- **Panel** — KPIs, estado de ventas y tendencia de ingresos.
- **Productos** — catálogo con stock, con página de detalle e historial de movimientos.
- **Inventarios** — kardex de entradas/salidas que actualiza el stock de cada producto.
- **Clientes** — directorio con página de detalle: compras relacionadas, archivos adjuntos y bitácora de seguimiento.
- **Ventas** — pedidos con artículos, página de detalle, archivos y seguimiento.
- **Empleados** — directorio de personal con página de detalle, archivos y seguimiento.

## Desarrollo local

```bash
npm install
npm run dev
```

## Publicar en Azure Static Web Apps

1. Entra al [Azure Portal](https://portal.azure.com) y crea un recurso **Static Web App** (plan **Free**).
2. En "Deployment details" elige **GitHub**, autoriza tu cuenta y selecciona este repositorio (`jassiel50/demo`) y la rama que quieras publicar.
3. En "Build Details":
   - **Build presets**: `React`
   - **App location**: `/`
   - **Api location**: (vacío)
   - **Output location**: `dist`
4. Azure crea automáticamente un workflow de GitHub Actions en `.github/workflows/` (con el comando `npm run build` y el token de despliegue como secret). Cada push a la rama conectada vuelve a compilar y publicar el sitio.
5. Cuando termine el primer deploy, Azure te da una URL tipo `https://<nombre-random>.azurestaticapps.net` — esa es la liga que puedes compartir.

El enrutado usa `HashRouter` (URLs tipo `/#/clientes`), así que no se necesita configurar reglas de reescritura en Azure para que funcione la navegación entre páginas.
