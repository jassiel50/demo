# Vertex ERP — Demo

Demo interactivo de un ERP (inventario, clientes y ventas) pensado para mostrarse a clientes potenciales. Sitio 100% estático (HTML + CSS + JS), sin backend ni base de datos: todos los datos viven en memoria del navegador y se reinician al recargar la página.

## Publicar en Azure Static Web Apps

1. Entra al [Azure Portal](https://portal.azure.com) y crea un recurso **Static Web App** (plan **Free**).
2. En "Deployment details" elige **GitHub**, autoriza tu cuenta y selecciona este repositorio (`jassiel50/demo`) y la rama que quieras publicar.
3. En "Build Details":
   - **Build presets**: `Custom`
   - **App location**: `/`
   - **Api location**: (vacío)
   - **Output location**: (vacío)
4. Azure crea automáticamente un workflow de GitHub Actions en `.github/workflows/` y un secreto con el token de despliegue. Cada push a la rama conectada vuelve a publicar el sitio.
5. Cuando termine el primer deploy, Azure te da una URL tipo `https://<nombre-random>.azurestaticapps.net` — esa es la liga que puedes compartir.
