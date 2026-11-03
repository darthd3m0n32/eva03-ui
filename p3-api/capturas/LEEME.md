# Capturas de pantalla — Widget ClimaTec

Esta carpeta debería contener cuatro capturas reales del widget en funcionamiento:

1. `01-cargando.png` — estado "Cargando…" con el botón de búsqueda deshabilitado.
2. `02-exito.png` — resultado exitoso con ciudad, región, temperatura y viento.
3. `03-ciudad-no-encontrada.png` — búsqueda de "Xyzabc" (ciudad no encontrada).
4. `04-sin-conexion.png` — modo Offline de las herramientas de desarrollador.

## Estado actual

**No se generaron capturas automáticamente** porque en este entorno no se confirmó la disponibilidad de un navegador automatizable (por ejemplo Playwright o Puppeteer). Las imágenes no se inventaron, tal como exige el AGENTS.md.

## Cómo tomar las capturas manualmente

1. Inicia un servidor estático en la carpeta `p3-api/`, por ejemplo:
   - `npx serve p3-api` (requiere Node.js), o
   - `python3 -m http.server 8000` desde `C:\projects\eva03_ui\p3-api`, y abre `http://localhost:8000`.

2. Abre `http://localhost:8000/index.html` en un navegador (Chrome, Edge, Firefox…).

3. Abre las herramientas de desarrollador (DevTools) → pestaña **Network**.

### Captura 1 — 01-cargando.png (Cargando… con botón deshabilitado)
- En DevTools → Network, selecciona Throttling = **Slow 3G** (para que la petición tarda lo suficiente en verse).
- Escribe "Cusco" en el input y haz clic en Buscar.
- Mientras la petición está en curso, toma la captura: debe verse el texto "Cargando…" y el botón deshabilitado (opacidad reducida).
- Guarda como `capturas/01-cargando.png`.

### Captura 2 — 02-exito.png (resultado exitoso)
- Espera a que termine la petición de "Cusco".
- Toma la captura mostrando: ciudad, región, temperatura y viento (con sus unidades).
- Guarda como `capturas/02-exito.png`.

### Captura 3 — 03-ciudad-no-encontrada.png (ciudad no encontrada)
- Limpia el input, escribe "Xyzabc" y busca.
- Debe aparecer el mensaje: "No encontramos la ciudad «Xyzabc». Revisa el nombre e inténtalo de nuevo."
- Toma la captura y guárdala como `capturas/03-ciudad-no-encontrada.png`.

### Captura 4 — 04-sin-conexion.png (modo Offline)
- En DevTools → Network → Throttling, selecciona **Offline**.
- Escribe cualquier ciudad (ej. "Lima") y busca.
- `fetch` fallará por falta de conexión; debe aparecer: "Sin conexión. Revisa tu internet e inténtalo otra vez."
- Toma la captura y guárdala como `capturas/04-sin-conexion.png`.

Nota: el botón siempre vuelve a habilitarse tras cada escenario (bloque `finally`).
