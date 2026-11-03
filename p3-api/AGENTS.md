# AGENTS.md — Widget ClimaTec (ViajaPerú)

## Contexto

La agencia de turismo **ViajaPerú** necesita un widget web llamado **ClimaTec**: el usuario escribe el nombre de una ciudad y ve su clima actual. Se usa la API gratuita de **Open-Meteo** (sin clave de API), con dos llamadas encadenadas:

1. **Geocodificación** (nombre → coordenadas):
   `https://geocoding-api.open-meteo.com/v1/search?name=Cusco&count=1&language=es`
2. **Clima actual** (coordenadas → datos):
   `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m,wind_speed_10m`

Todo el trabajo se hace dentro de la carpeta **`p3-api/`**. Los textos para el usuario final y la documentación van **en español**; el código (nombres de funciones, variables) sigue las firmas indicadas abajo.

## Reglas generales

- **Stack:** HTML + CSS + JavaScript vanilla (módulos ES). Sin frameworks, sin bundlers, sin dependencias de npm para el widget. Debe poder abrirse con un servidor estático simple (`npx serve p3-api` o `python3 -m http.server`).
- **Sin claves de API.** Open-Meteo no las necesita; no agregues ninguna.
- **No inventes parámetros ni campos.** Todo parámetro de URL y todo campo de respuesta que uses debe estar verificado en la documentación oficial (https://open-meteo.com/en/docs y https://open-meteo.com/en/docs/geocoding-api). Si no puedes confirmarlo allí, no lo uses.
- **La documentación oficial es la fuente de verdad**, no tu memoria ni el código que generes. Cita la URL exacta de cada sección consultada.
- Usa `async/await`; no mezcles con `.then()` encadenado.
- Escapa/inserta texto en el DOM con `textContent` (nunca `innerHTML` con datos de la API).
- No ocultes fallos: si algo no se pudo hacer o medir, dilo en el documento correspondiente en lugar de inventar resultados.
- Los tiempos y capturas deben ser **reales** (medidos y tomados por ejecución), no estimados.

## Estructura de archivos esperada

```
p3-api/
├── index.html            # UI del widget
├── styles.css
├── clima.js              # buscarCiudad, obtenerClima, UI y manejo de estados
├── benchmark.js          # (o benchmark.html) comparación secuencial vs Promise.all
├── allsettled-demo.js    # (o integrado en benchmark) pruebas con ciudad inválida
├── README.md             # cómo ejecutar el proyecto
├── docs/
│   ├── 01-endpoints.md           # tabla Endpoint | Parámetros | Campos
│   ├── 02-errores-fetch.md       # explicación fetch vs 404/500 + pruebas de error
│   ├── 03-tiempos.md             # tabla de tiempos + conclusión
│   ├── 04-all-vs-allsettled.md   # decisión justificada
│   └── 05-verificacion-ia.md     # registro de errores del código generado por IA
└── capturas/
    ├── 01-cargando.png
    ├── 02-exito.png
    ├── 03-ciudad-no-encontrada.png
    └── 04-sin-conexion.png
```

## Actividades

Ejecútalas **en orden**. Al terminar cada una, verifica sus criterios de aceptación antes de pasar a la siguiente.

### Actividad 1 — Leer la documentación y completar la tabla de endpoints

1. Lee la documentación **oficial** en open-meteo.com (Geocoding API y Forecast API). Usa WebFetch sobre las páginas oficiales; no te apoyes en resúmenes de terceros ni en tu memoria.
2. Completa `docs/01-endpoints.md` con esta tabla (una fila por endpoint):

   | Endpoint | Parámetros que usa | Campos de la respuesta que necesita |
   |---|---|---|
   | _(geocoding)_ | _(a completar desde la doc)_ | _(a completar desde la doc)_ |
   | _(forecast)_ | _(a completar desde la doc)_ | _(a completar desde la doc)_ |

   - En "Parámetros", incluye para cada uno su significado y si es obligatorio u opcional según la doc.
   - En "Campos", usa la ruta completa dentro del JSON (por ejemplo `results[0].latitude`, `current.temperature_2m`) e incluye las unidades que reporta la API.
   - Documenta también **qué devuelve la API de geocodificación cuando no hay coincidencias** (verifícalo con una petición real a `name=Xyzabc` y anota la forma exacta de la respuesta).
3. Añade al final la lista de URLs oficiales consultadas.

**Aceptación:** la tabla está completa, cada dato tiene respaldo en una URL oficial citada, y el caso "sin resultados" está documentado con una respuesta real.

### Actividad 2 — Implementar `buscarCiudad` y `obtenerClima`

En `clima.js`:

- `async function buscarCiudad(nombre)` → llama a geocodificación y devuelve al menos `{ nombre, admin1, latitud, longitud }` (más `pais` si lo consideras útil).
- `async function obtenerClima(lat, lon)` → llama a forecast con `current=temperature_2m,wind_speed_10m` y devuelve `{ temperatura, viento, unidades }`.
- El flujo del widget encadena ambas: nombre → coordenadas → clima.

En el DOM, mostrar: **ciudad**, **región (`admin1`)**, **temperatura** y **velocidad del viento** (con sus unidades).

Estados de la interfaz:
- Mientras carga: mostrar **"Cargando…"** y **deshabilitar el botón** de búsqueda (y evitar envíos duplicados).
- Al terminar (éxito o error): ocultar "Cargando…" y volver a habilitar el botón.
- Validar entrada vacía antes de llamar a la API.
- Usar `encodeURIComponent` para el nombre de la ciudad.
- Que el widget sea accesible: `<label>` asociado al input, `aria-live="polite"` en la zona de resultados/mensajes.

**Aceptación:** buscar "Cusco" muestra ciudad, región, temperatura y viento; durante la petición se ve "Cargando…" con el botón deshabilitado.

### Actividad 3 — Manejo de errores con `try/catch/finally`

- Envolver el flujo en `try/catch/finally`; el `finally` rehabilita el botón y quita "Cargando…".
- Verificar `response.ok` en **cada** `fetch` y lanzar un `Error` con un mensaje claro (incluir `response.status`) cuando sea falso.
- Controlar **ciudad inexistente** (ej. "Xyzabc"): detectar la ausencia de resultados según lo documentado en la Actividad 1 y mostrar un mensaje como *"No encontramos la ciudad «Xyzabc». Revisa el nombre e inténtalo de nuevo."*
- Distinguir **falta de conexión** (`fetch` rechaza con `TypeError`) de errores HTTP, y mostrar un mensaje como *"Sin conexión. Revisa tu internet e inténtalo otra vez."*
- Mensajes siempre en lenguaje claro para el usuario; el detalle técnico va a `console.error`.

En `docs/02-errores-fetch.md`:
- Explicar **por qué `fetch` no lanza error ante un 404 o 500**: la promesa de `fetch` solo se rechaza ante fallos de red (sin conexión, DNS, CORS, petición abortada); un status HTTP de error sigue siendo una respuesta válida a nivel de protocolo, por lo que hay que revisar `response.ok` / `response.status` manualmente.
- Documentar las pruebas realizadas: ciudad válida, ciudad inexistente, **modo Offline de DevTools** (pestaña Network → Throttling → Offline), y una URL que provoque un error HTTP (por ejemplo, un parámetro inválido) para demostrar `response.ok === false`.

**Aceptación:** cada escenario produce un mensaje distinto y comprensible; el botón siempre vuelve a habilitarse.

### Actividad 4 — Lima, Cusco y Arequipa: secuencial vs. `Promise.all`

En `benchmark.js` (o `benchmark.html`):

- Implementar dos funciones que obtienen el clima completo (geocodificación + clima) de **Lima, Cusco y Arequipa**:
  - **Secuencial:** tres `await` uno tras otro.
  - **Paralela:** `Promise.all` sobre las tres consultas.
- Medir **tres veces cada forma** con `performance.now()` (ejecutar de forma alternada o con una pausa entre corridas para reducir el efecto de caché; indicar cómo se hizo).
- Registrar en `docs/03-tiempos.md`:

  | Corrida | Secuencial (ms) | Promise.all (ms) |
  |---|---|---|
  | 1 | | |
  | 2 | | |
  | 3 | | |
  | Promedio | | |

- Redactar una **conclusión** de qué conviene y por qué (las peticiones son independientes entre sí, así que en paralelo el tiempo total se acerca al de la más lenta en vez de a la suma de las tres), con los números medidos como respaldo. Mencionar cualquier limitación (variabilidad de red, caché del navegador).

**Aceptación:** tabla con valores reales medidos y conclusión coherente con esos valores.

### Actividad 5 — `Promise.all` vs. `Promise.allSettled`

- Probar ambas con una lista que incluya una ciudad inválida, por ejemplo `["Lima", "Cusco", "Xyzabc"]`.
- Documentar en `docs/04-all-vs-allsettled.md`:
  - Qué ocurre con `Promise.all` (rechaza en cuanto una promesa falla y se pierden los resultados de las demás desde el punto de vista del consumidor).
  - Qué ocurre con `Promise.allSettled` (devuelve el estado `fulfilled`/`rejected` de cada una).
  - **La decisión** para ViajaPerú (para un panel con varias ciudades independientes, lo razonable es mostrar las que sí funcionan y avisar de las que fallaron) y su justificación, con la salida real de la prueba.
- Implementar en el código la opción elegida, mostrando por ciudad su resultado o su mensaje de error.

**Aceptación:** la prueba con ciudad inválida demuestra la diferencia, y la justificación se apoya en esa evidencia.

### Actividad 6 — Verificar código generado por IA contra la documentación

1. Genera (pídelo a la IA, sin corregirlo) una **primera versión** del widget y guárdala como `p3-api/ia-original.js` para conservar la evidencia.
2. Verifica **cada parámetro de URL y cada campo de respuesta** que use contra la documentación oficial.
3. Registra en `docs/05-verificacion-ia.md`:

   | Elemento usado por la IA | Dónde aparece | Estado (válido / inexistente / mal escrito / obsoleto) | Evidencia (URL de la doc) | Corrección aplicada |
   |---|---|---|---|---|

   Presta atención especial a: nombres de variables en `current=` (p. ej. `temperature_2m`, `wind_speed_10m`), nombres de parámetros de geocodificación (`name`, `count`, `language`), nombres de campos (`admin1`, `latitude`, `longitude`), el manejo del caso sin resultados, y la existencia de parámetros/campos antiguos (por ejemplo `current_weather`/`windspeed`) frente a los vigentes. **No asumas** cuál es el correcto: confírmalo en la documentación.
4. Si no hay ninguna discrepancia, indícalo explícitamente y muestra qué elementos se verificaron.

**Aceptación:** cada elemento usado figura en la tabla con su evidencia; las correcciones están reflejadas en `clima.js`.

## Capturas (entregable)

Se necesitan cuatro capturas en `p3-api/capturas/`:

1. `01-cargando.png` — estado "Cargando…" con el botón deshabilitado (ayuda: DevTools → Network → throttling "Slow 3G" para poder verlo).
2. `02-exito.png` — resultado con ciudad, región, temperatura y viento.
3. `03-ciudad-no-encontrada.png` — búsqueda "Xyzabc".
4. `04-sin-conexion.png` — modo **Offline** de DevTools.

Si dispones de un navegador automatizable (por ejemplo Playwright), úsalo para generarlas. Si no, **no inventes imágenes**: crea `capturas/LEEME.md` con los pasos exactos para que la persona las tome manualmente y deja claro qué falta.

## Documentación final

- `README.md`: cómo ejecutar el proyecto, estructura de carpetas, y un índice con enlaces a los documentos de `docs/` y a las capturas.
- Resumen final de la entrega con el checklist siguiente.

## Checklist de entrega

- [ ] `docs/01-endpoints.md` — tabla Endpoint | Parámetros | Campos, con fuentes oficiales
- [ ] `clima.js` — `buscarCiudad`, `obtenerClima`, DOM, "Cargando…", botón deshabilitado
- [ ] Manejo de errores con `try/catch/finally`, `response.ok`, ciudad inexistente, modo Offline
- [ ] `docs/02-errores-fetch.md` — explicación de por qué `fetch` no lanza error ante 404/500
- [ ] `docs/03-tiempos.md` — tabla de 3 mediciones por método + conclusión
- [ ] `docs/04-all-vs-allsettled.md` — decisión justificada con prueba
- [ ] `docs/05-verificacion-ia.md` — registro de discrepancias y correcciones
- [ ] `capturas/` — cargando, éxito, ciudad no encontrada, sin conexión (o `LEEME.md` si faltan)
- [ ] Todo el código y documentos dentro de `p3-api/`

## Lo que NO debes hacer

- No rellenar la tabla de endpoints de memoria sin haber leído la documentación oficial.
- No fabricar tiempos de ejecución, salidas de consola ni capturas.
- No añadir librerías externas ni claves de API.
- No usar `innerHTML` con datos de la API.
- No dar por buenos parámetros o campos que no hayas verificado en la documentación.