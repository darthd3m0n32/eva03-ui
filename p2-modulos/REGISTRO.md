# Registro de trabajo

## Resumen del código original

- **`index.html`**: Página con un formulario para agregar pedidos (producto, precio, cantidad), un filtro de estado (todos/pendiente/entregado), una lista `<ul id="lista-pedidos">`, un párrafo de totales `<p id="total">` y carga `app.js` con `<script src="app.js">`.
- **`app.js`**: Definía `IGV = 0.18`, una función `calcularTotal` que recorre los pedidos con un `for` y suma con IGV, una función `resumen` que arma un texto con concatenación `+`, y un arreglo fijo de 3 pedidos de prueba (incluye uno con `cantidad: 0` y otro sin cantidad ni cliente). No manipulaba el DOM.

## Paso 1: Refactorización (antes / después /resultado)

**Antes (`app.js` original):**
```js
var IGV = 0.18;
function calcularTotal(pedidos) {
  var total = 0;
  for (var i = 0; i < pedidos.length; i++) {
    var cantidad = pedidos[i].cantidad || 1;
    total = total + pedidos[i].precio * cantidad;
  }
  return total + total * IGV;
}
function resumen(pedido) {
  var cliente = pedido.cliente ? pedido.cliente.nombre : "Anónimo";
  return "Pedido de " + cliente + ": " + pedido.producto + " x" + pedido.cantidad;
}
```

**Después (`pedidos.js`, `ui.js`, `main.js`):**
- `var` → `const` / `let`.
- Funciones anónimas/callbacks → funciones flecha.
- Concatenación `+` → template literals `` `texto ${variable}` ``.
- Desestructuración con valores por defecto en el constructor de `Pedido`.
- `for` → `reduce()` para sumar subtotales.
- `pedido.cliente ? ...` → `this.cliente?.nombre`.
- `||` → `??` y valores por defecto de desestructuración.

**Resultado con el mismo arreglo original:**

| Pedido | Precio | Cantidad | Subtotal original (bug `||`) | Subtotal correcto (con `??`) |
|---|---|---|---|---|
| Café | 6 | 2 | 12 | 12 |
| Croissant | 4.5 | 0 | 4.5 *(bug: 0 se volvió 1)* | 0 |
| Jugo | 8 | *(sin cantidad)* | 8 *(bug: falta se volvió 1)* | 0 |

- Total original (incorrecto): 24.5 + 18% IGV = **28.91**
- Total refactorizado (correcto): 12 + 18% IGV = **14.16**

Los resultados **no coinciden** porque el original tenía el error de `||`. El resultado refactorizado es el correcto: un `cantidad: 0` debe valer 0, no convertirse en 1.

## Paso 2: Clase Pedido y spread (prueba de no mutación)

Se creó `class Pedido` en `pedidos.js` con:
- Constructor que recibe un objeto y usa desestructuración con valores por defecto (`id`, `producto`, `precio`, `cantidad = 0`, `cliente = null`, `entregado = false`).
- Getter `subtotal` y `totalConIGV`.
- Campo `entregado = false`.

`marcarEntregado(pedidos, id)` devuelve un **arreglo nuevo** usando `map` y spread `{ ...p, entregado: true }`. No usa `push`, `splice` ni asigna propiedades sobre el arreglo original.

**Demostración (consola):**
```
¿El arreglo original es el mismo que el nuevo? (debe ser false): false
```
- `pedidosIniciales === pedidosNuevos` → `false` (son arreglos distintos).
- El original conserva `p2.entregado = false`; el nuevo tiene `p2.entregado = true`.
- El arreglo original **no mutó**.

## Paso 3: Módulos y justificación de exports

Se dividió el proyecto en tres archivos:

- **`pedidos.js`**: `export default class Pedido` + export nombrado de `calcularTotal`, `filtrarPorEstado`, `marcarEntregado`.
- **`ui.js`**: export nombrado de `renderPedidos`, `mostrarTotal` (todo lo que toca el DOM).
- **`main.js`**: sin export, solo importa y arranca la app.

**Justificación de exports:**
| Módulo | Tipo de export elegido | Motivo |
|---|---|---|
| `pedidos.js` | `export default` para `class Pedido` + exports nombrados para utilidades | El módulo representa una cosa principal (`Pedido`), por eso default. Las utilidades son independientes y se importan solo lo necesario con export nombrado. |
| `ui.js` | Export nombrado | Ofrece varias utilidades independientes del DOM; mejor autocompletado y más fácil de buscar. |
| `main.js` | Sin export | Punto de entrada, solo importa. |

En `index.html` se cargó solo el punto de entrada:
```html
<script type="module" src="main.js"></script>
```
Se eliminó la etiqueta antigua `<script src="app.js"></script>`.

## Paso 4: file:// vs Live Server (error, causa, solución)

> **No pude ejecutar esta prueba yo mismo** porque un agente no puede abrir el navegador ni hacer doble clic. Debe ser el usuario quien:
> 1. Abra `index.html` con doble clic (protocolo `file://`).
> 2. Abra la consola del navegador (F12 → Consola) y capture el error en `evidencias/error-file.png`.
> 3. Abra el proyecto con Live Server (`http://127.0.0.1:5500/...`) y confirme que funciona, capturando `evidencias/ok-liveserver.png`.

**Qué error se espera:** algo como *"Access to script at 'file:///.../main.js' from origin 'null' has been blocked by CORS policy"*.

**Por qué ocurre:** Los módulos ES se cargan con peticiones sujetas a CORS. Con `file://` el origen es `null` y el navegador bloquea esas peticiones por seguridad. Con un servidor HTTP el origen es válido y la carga funciona.

**Cómo se soluciona:** Servir el proyecto por HTTP: Live Server en VS Code, `npx serve`, o `python -m http.server`. Nunca abrirlo con doble clic cuando se usan módulos ES.

## Paso 5: ¿Error `||` corregido? + decisiones de la IA

**Sí, se corrigió el error `||`.**

- Línea original (`app.js` línea 5): `var cantidad = pedidos[i].cantidad || 1;`
- Línea final (`pedidos.js` constructor): `cantidad = 0` (valor por defecto de desestructuración) y, donde se necesita default que admita `0`, se usa `??` (por ejemplo `this.cliente?.nombre ?? "Anónimo"`).

**Caso de prueba que lo demuestra:**
```js
const pedidoCantidadCero = new Pedido({ producto: "Prueba", precio: 10, cantidad: 0 });
console.log(pedidoCantidadCero.subtotal); // imprime 0 (correcto), no 10 (error con ||)
```
Con `||`, `cantidad: 0` se habría tratado como faltante y valido 1, dando subtotal 10. Con `??` / valor por defecto, respeta el 0 y da subtotal 0.

**Decisiones de IA:** Durante este trabajo no se aceptaron, cambiaron ni rechazaron sugerencias de una IA externa; todo el código fue escrito siguiendo directamente el AGENTS.md.

## Criterios de terminar (estado)

- [x] No queda ningún `var` ni concatenación con `+` para armar textos.
- [ ] El resultado con el arreglo original coincide (la diferencia está explicada: el original era incorrecto por el bug de `||`).
- [x] Marcar un pedido como entregado no muta el arreglo original.
- [ ] El proyecto funciona con Live Server y el error de `file://` está documentado (pendiente de capturas de usuario).
- [x] El tema de `||` / `??` está respondido con evidencia.
- [x] `REGISTRO.md` está completo, incluyendo lo que no se pudo probar (paso 4).
