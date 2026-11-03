# Widget ClimaTec — ViajaPerú

Widget web que consulta el clima actual de una ciudad. El usuario escribe el nombre de una ciudad y ve su clima actual (temperatura y viento), usando las APIs gratuitas de **Open-Meteo** (sin clave de API) con dos llamadas encadenadas:

1. **Geocodificación** (nombre → coordenadas): `https://geocoding-api.open-meteo.com/v1/search`
2. **Clima actual** (coordenadas → datos): `https://api.open-meteo.com/v1/forecast`

Todo el trabajo está dentro de la carpeta `p3-api/`. Los textos para el usuario final van en español; el código (nombres de funciones y variables) en inglés.

## Estructura de carpetas

```
p3-api/
├── index.html            # UI del widget
├── styles.css            # Estilos
├── clima.js              # buscarCiudad, obtenerClima, UI y manejo de estados (modulo ES)
├── benchmark.js          # Comparacion secuencial vs Promise.all (medicion con performance.now)
├── allsettled-demo.js    # Prueba Promise.all vs Promise.allSettled
├── ia-original.js        # Primera version generada por IA (sin corregir, evidencia Actividad 6)
├── README.md             # este archivo
├── docs/
│   ├── 01-endpoints.md           # tabla Endpoint | Parametros | Campos, con fuentes oficiales
│   ├── 02-errores-fetch.md       # por que fetch no lanza error ante 404/500 + pruebas
│   ├── 03-tiempos.md             # tabla de tiempos reales + conclusione
│   ├── 04-all-vs-allsettled.md   # decision justificada con prueba
│   └── 05-verificacion-ia.md     # registro de discrepancias del codigo de IA
└── capturas/
    ├── 01-cargando.png   (o LEEME.md si se toman manualmente)
    ├── 02-exito.png
    ├── 03-ciudad-no-encontrada.png
    ├── 04-sin-conexion.png
    └── LEEME.md          # pasos para tomar las capturas manualmente
```

## Cómo ejecutar el proyecto

No hay dependencias de npm ni claves de API. Sirve los archivos con un servidor estático simple y abre `index.html`:

```bash
# Opcion A: con npx (Node.js)
npx serve p3-api

# Opcion B: con Python
python3 -m http.server 8000
# luego abre http://localhost:8000
```

Luego abre `http://localhost:8000/index.html` en el navegador.

## Índice de documentos

- [docs/01-endpoints.md](docs/01-endpoints.md) — tabla de endpoints con fuentes oficiales
- [docs/02-errores-fetch.md](docs/02-errores-fetch.md) — errores fetch y pruebas de error
- [docs/03-tiempos.md](docs/03-tiempos.md) — tiempos secuencial vs Promise.all
- [docs/04-all-vs-allsettled.md](docs/04-all-vs-allsettled.md) — decisión all vs allSettled
- [docs/05-verificacion-ia.md](docs/05-verificacion-ia.md) — verificación de código de IA

## Checklist de entrega

- [x] docs/01-endpoints.md — tabla Endpoint | Parámetros | Campos, con fuentes oficiales
- [x] clima.js — buscarCiudad, obtenerClima, DOM, "Cargando…", botón deshabilitado
- [x] Manejo de errores con try/catch/finally, response.ok, ciudad inexistente, modo Offline
- [x] docs/02-errores-fetch.md — por qué fetch no lanza error ante 404/500
- [x] docs/03-tiempos.md — tabla de 3 mediciones por método + conclusión
- [x] docs/04-all-vs-allsettled.md — decisión justificada con prueba
- [x] docs/05-verificacion-ia.md — registro de discrepancias y correcciones
- [ ] capturas/ — cargando, éxito, ciudad no encontrada, sin conexión (pendiente: ver capturas/LEEME.md)
- [x] Todo el código y documentos dentro de p3-api/

## Notas técnicas

- Stack: HTML + CSS + JavaScript vanilla (módulos ES). Sin frameworks, sin bundlers, sin dependencias de npm.
- Sin claves de API.
- Se usa `async/await`, `textContent` (nunca `innerHTML` con datos de la API), `encodeURIComponent`, `response.ok` en cada `fetch`, y `try/catch/finally`.
- Para medir los tiempos del benchmark: `node benchmark.js` (requiere Node.js 18+ para `fetch` nativo).
