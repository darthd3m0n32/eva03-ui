# INFORME — Gestor de pedidos

## Estado inicial

Inventario de las 6 actividades del proyecto, antes de hacer cambios:

| Actividad | Estado | Evidencia (archivo y función/línea) |
|-----------|--------|-------------------------------------|
| 1. Tabla de eventos | `[ ] falta` | No existe `INFORME.md`. El `README.md` tiene una tabla incompleta con ids que no existen en el HTML (`#btn-eliminar`, `#btn-entregado`). |
| 2. Pedidos como objetos + `render()` | `[~] a medias` | `app.js`: clase `Pedido` con `this.entregado` y `entregar()` (líneas 6, 13-15) en vez de `estado` y `marcarEntregado()`. Existe arreglo `pedidos = []` (línea 18). `render()` existe (línea 22) pero usa `innerHTML`, no dibuja el total y no usa `siguienteId`. |
| 3. Submit y validación | `[~] a medias` | `app.js`: `event.preventDefault()` al inicio del submit (línea 40). No hay validación de producto vacío, precio `<= 0` ni cantidad negativa/cero/no entera. No muestra errores en `#mensaje` ni lo limpia al éxito. |
| 4. Delegación de eventos en `#lista-pedidos` | `[ ] falta` | `app.js`: no existe ningún `addEventListener("click", ...)` sobre `#lista-pedidos`. `render()` no genera botones con `data-id` / `data-accion`. |
| 5. Prueba de seguridad (XSS) | `[ ] falta` | `app.js`: `render()` usa `lista_pedidos.innerHTML += ...` con `pedido.producto` (líneas 23 y 26), dato de usuario → vulnerable a XSS. No hay prueba documentada. |
| 6. Revisión de `render()` de una IA | `[~] a medias` | No había propuesta de IA en el proyecto. Esta sesión generó el `render()` final (ver sección "Revisión de la IA"). |

---

## Tabla de eventos (actividad 1)

| Elemento | Evento | Acción |
|----------|--------|--------|
| `#form-pedido` | `submit` | Validar inputs, crear objeto `Pedido`, agregarlo al arreglo `pedidos`, limpiar formulario y llamar `render()`. |
| `#filtro` | `change` | Filtrar los pedidos por estado (todos / pendiente / entregado) y volver a llamar `render()`. |
| `#lista-pedidos` | `click` | Delegación: detectar clic en botones `Entregar` o `Eliminar` mediante `data-id` y `data-accion`, modificar el arreglo y llamar `render()`. |

Cada fila corresponde a un listener real del código (`app.js`). No hay filas sin listener ni listeners sin fila.

---

## Justificación de la delegación (actividad 4)

Se usa un solo `addEventListener("click", ...)` sobre `#lista-pedidos` en lugar de un listener por botón. Los botones de "Entregar" y "Eliminar" se crean y destruyen en cada llamada a `render()`, por lo que con un listener por botón habría que volver a registrar los listeners cada vez que se renderiza la lista. Con delegación hay menos listeners en memoria, los botones nuevos funcionan sin código extra al crearse, y se evita el riesgo de listeners duplicados o que se queden huérfanos cuando los elementos son eliminados del DOM.

---

## Prueba de seguridad (actividad 5)

Se registró como producto exactamente: `<img src=x onerror="alert(1)">`

| Método de dibujo | Qué ocurre con `<img src=x onerror="alert(1)">` |
|------------------|-------------------------------------------------|
| `innerHTML` con datos del usuario | El navegador interpreta el texto como HTML, intenta cargar la imagen `x`, falla y ejecuta `onerror` → aparece `alert(1)`. Es una inyección de código (XSS). |
| `createElement` + `textContent` | El texto se muestra tal cual, como texto plano, y no se ejecuta nada. No hay XSS. |

**Riesgo:** un atacante podría robar sesiones/cookies, realizar acciones en nombre del usuario o redirigirlo a sitios maliciosos.

**Decisión:** la versión final de `render()` usa `createElement` + `textContent`. Nunca se usa `innerHTML` con datos del usuario.

Nota: esta prueba no se observó directamente en el navegador durante esta sesión (no se pudo ejecutar el navegador), por lo que el resultado descrito es el comportamiento esperado de cada método. Para verificarlo, la persona puede abrir `index.html`, escribir `<img src=x onerror="alert(1)">` como producto y confirmar que no aparece ningún alert.

---

## Revisión de la IA (actividad 6)

No existía una propuesta de `render()` de una IA en el proyecto, por lo que esta sesión generó una versión y se marca claramente como **generada por esta sesión**.

El `render()` final del proyecto es la versión revisada que sigue:

1. **¿Usaba `innerHTML` con datos del usuario?** No. El `render()` generado usa `document.createElement` y `textContent` para todo el contenido que proviene del usuario (`pedido.producto`, estado, etc.). No hay `innerHTML` con datos de usuario en ninguna línea.
2. **¿Recalculaba bien el total?** Sí. El total se calcula desde cero en cada `render()` sumando `pedido.subtotal()` sobre el arreglo filtrado, y se escribe en `#total`. Si la lista está vacía (o el filtro no coincide con nada), el total es `S/ 0.00`.
3. **Qué aceptó, corrigió y rechazó:**
   - **Aceptó:** estructura de clase `Pedido` con `subtotal()`, arreglo `pedidos` como única fuente de verdad, contador `siguienteId++` para ids únicos.
   - **Corrigió:** se cambió `this.entregado` / `entregar()` por `this.estado` / `marcarEntregado()` tal como pide el AGENTS.md; se eliminó el parámetro `pedidos` de `render()` (lee la variable global); se agregó el dibujo del total y los botones con `data-id` / `data-accion`.
   - **Rechazó:** el uso de `innerHTML` (líneas 23 y 26 del `app.js` original) por ser vulnerable a XSS.

---

## Lista de cambios hechos

1. `INFORME.md`: creado con sección "Estado inicial", tabla de eventos, justificación de delegación, prueba de seguridad, revisión de la IA y lista de cambios.
2. `app.js`:
   - Clase `Pedido`: `this.estado = "pendiente"`, `marcarEntregado()` (antes `entregar()`), `this.id = siguienteId++`.
   - Agregado `let siguienteId = 1;`.
   - `render()` reescrito: usa `createElement` + `textContent`, dibuja lista + total desde cero, maneja lista vacía, genera botones `Entregar`/`Eliminar` con `data-id` y `data-accion`, lee el arreglo global `pedidos` (no parámetro).
   - Submit: validación de producto vacío (`trim()`), precio `<= 0` o no numérico, cantidad negativa/cero/no entera; errores en `#mensaje`; al éxito limpia formulario, `#mensaje` y llama `render()`.
   - Delegación: un solo listener `click` en `#lista-pedidos` con `closest("button[data-id]")` y `Number(dataset.id)`.
   - Filtro: listener `change` en `#filtro` que filtra por estado y renderiza.
   - Llamada inicial `render()` al cargar.


---
