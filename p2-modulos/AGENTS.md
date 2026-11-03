# AGENTS.md

## Rol

Actúa como un **desarrollador junior** que está aprendiendo JavaScript moderno (ES6+). Trabaja paso a paso, explica sus decisiones con palabras sencillas, comenta el código donde ayude a entender y no inventa nada que no haya probado.

Archivos a analizar (están en el fichero actual):

- `index.html`
- `app.js`

## Antes de empezar

1. Lee `index.html` y `app.js` completos.
2. Haz un resumen corto (5-8 líneas) de qué hace cada archivo y cómo se conectan.
3. Anota los problemas que veas (var, funciones largas, concatenación de strings, mutación del arreglo, `||` mal usado, etc.). No los corrijas todavía: se arreglan en el paso que corresponda.
4. Guarda una copia del código original en `original/` para poder comparar antes y después.

## Reglas generales

- Mantén el comportamiento visible de la aplicación, salvo para corregir errores reales.
- Código y comentarios en español, nombres de variables claros.
- Sin librerías externas.
- Cada paso debe quedar demostrado con una salida real (por ejemplo `console.log` o `console.table`) usando **el mismo arreglo de pedidos** del archivo original.
- Todo lo que decidas, aceptes o cambies se anota en `REGISTRO.md` (ver paso 5).

---

## Paso 1. Refactorización a JavaScript moderno

Refactoriza `app.js` aplicando **todas** estas técnicas, donde tenga sentido:

| Técnica | Qué hacer |
|---|---|
| `const` / `let` | Reemplazar todos los `var`. `const` por defecto, `let` solo si se reasigna. |
| Funciones flecha | Convertir funciones anónimas y callbacks. |
| Template literals | Reemplazar toda concatenación con `+` por `` `texto ${variable}` ``. |
| Desestructuración con valores por defecto | Por ejemplo `const { id, cliente = "Sin nombre", cantidad = 0, precio = 0 } = pedido;` |
| `reduce()` | Para totales (suma de importes, total por cliente, etc.). |
| Encadenamiento opcional `?.` | Para datos que pueden faltar (`pedido.cliente?.nombre`). |
| Operador `??` | Para valores por defecto que **sí** admiten `0`, `""` o `false`. |

**Demostración obligatoria:** ejecuta el código original y el refactorizado con el mismo arreglo y muestra los dos resultados lado a lado. Indica explícitamente si coinciden o no, y por qué. Si el resultado original era incorrecto, explica qué estaba mal y cómo quedó el resultado correcto.

## Paso 2. Clase `Pedido` y spread sin mutar

1. Convierte el modelo de pedido del paso 1 en una `class Pedido` con:
   - `constructor` que reciba un objeto y use desestructuración con valores por defecto.
   - Un getter o método para el subtotal/total del pedido.
   - Un campo de estado (por ejemplo `entregado = false`).
2. Usa el operador **spread** para actualizar el arreglo **sin mutarlo**. Ejemplo esperado, marcar un pedido como entregado:
   - Devolver un **arreglo nuevo** con `map`, creando un nuevo `Pedido` a partir de `{ ...pedido, entregado: true }`.
   - No usar `push`, `splice` ni asignar propiedades directamente sobre el arreglo original.
3. Demuestra con `console.log` que el arreglo original **no cambió** y que el nuevo sí (compara referencias con `===` y muestra el contenido de ambos).

## Paso 3. Módulos ES

Divide el proyecto en tres archivos:

- `pedidos.js`: la clase `Pedido` y los cálculos (totales, filtros, marcar entregado).
- `ui.js`: todo lo que toca el DOM (renderizar la lista, mostrar totales, eventos de botones).
- `main.js`: punto de entrada; importa de los otros dos, tiene los datos iniciales y arranca la app.

En `index.html`, carga solo el punto de entrada:

```html
<script type="module" src="main.js"></script>
```

Elimina la etiqueta antigua que cargaba `app.js` (o deja `app.js` fuera del HTML y anótalo en el registro).

**Decisión export nombrado vs. default.** Usa este criterio y justifícalo por escrito en `REGISTRO.md`, indicando para cada módulo qué elegiste y por qué:

- **`export default`**: cuando el módulo representa **una sola cosa principal**. Ejemplo propuesto: `export default class Pedido` en `pedidos.js`.
- **Export nombrado**: cuando el módulo ofrece **varias utilidades** independientes (`calcularTotal`, `marcarEntregado`, `renderPedidos`, `mostrarTotal`). Ventajas: el nombre es fijo al importar, el autocompletado funciona mejor, es más fácil de buscar y se importa solo lo necesario.
- `main.js` no exporta nada: solo importa.

Si decides algo distinto al criterio anterior, explica por qué.

## Paso 4. Probar con `file://` y con Live Server

1. Abre `index.html` con **doble clic** (protocolo `file://`).
2. Abre la consola del navegador (F12 → Consola) y **captura el error**.
3. Luego abre el proyecto con **Live Server** (`http://127.0.0.1:5500/...`) y confirma que funciona.

> Un agente no puede hacer doble clic ni abrir el navegador por su cuenta. Si no puede ejecutar estas pruebas, debe **pedirle al usuario** que las haga y que pegue o adjunte la captura. **No se inventa el texto del error ni la captura.**

Guarda las capturas en `evidencias/` (`error-file.png` y `ok-liveserver.png`) y explica en `REGISTRO.md`:

- **Qué error aparece.** Normalmente algo como: *"Access to script at 'file:///.../main.js' from origin 'null' has been blocked by CORS policy"* (o similar, según el navegador).
- **Por qué ocurre.** Los módulos ES se cargan con peticiones que el navegador trata con las reglas de CORS. Con `file://` el origen es `null` y el navegador bloquea esas peticiones por seguridad. Con un servidor (`http://`) el origen es válido y la carga funciona.
- **Cómo se soluciona.** Servir el proyecto por HTTP: Live Server en VS Code, o `npx serve`, o `python -m http.server`. Nunca abrirlo con doble clic cuando se usan módulos.

## Paso 5. Verificación del error `||` y registro de decisiones

1. Busca en el código **original** los usos de `||` para valores por defecto (por ejemplo `cantidad || 1` o `descuento || 10`). El problema típico: `||` trata `0`, `""` y `false` como "vacío", así que un pedido con `cantidad: 0` o `descuento: 0` se calcula mal.
2. Revisa el código **final** y responde en `REGISTRO.md`:
   - ¿Se mantuvo el error `||` o se corrigió con `??` (o con valores por defecto de desestructuración)?
   - Muestra la línea original, la línea final y un caso de prueba que lo demuestre (por ejemplo, un pedido con `0`).
3. Si usaste sugerencias de una IA durante el trabajo, registra cuáles **aceptaste tal cual**, cuáles **cambiaste** y cuáles **rechazaste**, con el motivo.

---

## Entregables

```
/
├── index.html          (carga main.js como módulo)
├── main.js
├── pedidos.js
├── ui.js
├── original/           (copia de index.html y app.js originales)
├── evidencias/         (capturas del paso 4)
└── REGISTRO.md
```

### Formato de `REGISTRO.md`

```markdown
# Registro de trabajo

## Resumen del código original
## Paso 1: Refactorización (antes / después / resultado)
## Paso 2: Clase Pedido y spread (prueba de no mutación)
## Paso 3: Módulos y justificación de exports
## Paso 4: file:// vs Live Server (error, causa, solución)
## Paso 5: ¿Error `||` corregido? + decisiones de la IA

| Sugerencia de la IA | Acepté / Cambié / Rechacé | Motivo |
|---|---|---|
```

## Criterios de terminar

- [ ] No queda ningún `var` ni concatenación con `+` para armar textos.
- [ ] El resultado con el arreglo original coincide (o la diferencia está explicada).
- [ ] Marcar un pedido como entregado no muta el arreglo original.
- [ ] El proyecto funciona con Live Server y el error de `file://` está documentado.
- [ ] El tema de `||` / `??` está respondido con evidencia.
- [ ] `REGISTRO.md` está completo y honesto, incluyendo lo que no se pudo probar.