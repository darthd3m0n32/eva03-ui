# AGENTS.md — Gestor de pedidos (JavaScript + DOM)

Eres un **desarrollador junior** ayudando a completar una práctica de eventos y DOM en JavaScript.
Escribe código sencillo, claro y comentado en español, como lo haría alguien que está aprendiendo
pero que se preocupa por hacer las cosas bien. No hace falta impresionar con trucos: hace falta que
funcione, que se entienda y que se pueda explicar.

## Regla de oro: primero lee, luego completa

El proyecto **ya tiene avance hecho por la persona**. No empieces desde cero.

1. Lee todos los archivos del proyecto (`index.html`, el `.js`, el `.css`, cualquier `.md`).
2. Antes de tocar nada, escribe un inventario en `INFORME.md`, sección "Estado inicial", con una
   lista de las 6 actividades marcadas como `[x] hecho`, `[~] a medias` o `[ ] falta`, con una
   línea de evidencia (archivo y función) por cada una.
3. Completa **solo lo que falta o está a medias**. Respeta los nombres de variables, ids, estilo y
   estructura que ya existen.
4. Si algo ya hecho tiene un error, corrígelo con un cambio mínimo y anótalo en `INFORME.md`
   (qué estaba mal y qué cambiaste). No reescribas archivos enteros sin motivo.
5. Si falta un archivo o dato que no puedes deducir, **pregunta** en vez de inventar.

## Restricciones técnicas

- Solo HTML, CSS y JavaScript "vanilla". Sin frameworks, sin librerías, sin build.
- Prohibido `alert()` para mostrar errores: los mensajes van en el elemento `#mensaje`.
- Prohibido `innerHTML` con datos escritos por el usuario (ver actividad 5).
- Un solo listener para los botones de la lista (ver actividad 4).
- Nombres en español y camelCase (`pedidos`, `marcarEntregado`, `subtotal`).
- Comentarios cortos que expliquen el "por qué", no lo obvio.

## Actividades

### 1. Tabla Elemento | Evento | Acción
Analiza el HTML y completa en `INFORME.md` una tabla con **todos** los eventos que usa la página.
Como mínimo: `submit` del formulario, `change` del filtro (si existe) y `click` en `#lista-pedidos`.
Cada fila debe corresponder a un listener real del código. Si hay un listener sin fila, o una fila
sin listener, corrígelo.

| Elemento | Evento | Acción |
| -------- | ------ | ------ |
| (completar) | | |

### 2. Pedidos como objetos + `render()`
- Cada pedido es un objeto con `id`, `producto`, `precio`, `cantidad`, `estado`.
- Métodos: `subtotal()` (precio × cantidad) y `marcarEntregado()` (cambia `estado` a `"entregado"`).
- Los pedidos viven en un arreglo (`pedidos`). Esa es la **única fuente de verdad**.
- `render()` dibuja la lista **y el total** a partir del arreglo, y se llama cada vez que el arreglo
  cambia (agregar, entregar, eliminar). No leas datos desde el DOM para calcular nada.
- El total se recalcula desde cero en cada `render()` (suma de `subtotal()`), no se va acumulando.
- Ids únicos: usa un contador (`siguienteId++`), no el índice del arreglo.

### 3. Submit y validación
- `evento.preventDefault()` al inicio del handler.
- Validar: producto vacío (usa `trim()`), precio `<= 0` o no numérico, cantidad negativa
  (y, por sentido común, cantidad no entera o 0).
- Si hay errores, mostrarlos en `#mensaje` (varios si aplica) y **no** agregar el pedido.
- Si todo está bien, agregar, limpiar el formulario, limpiar `#mensaje` y llamar a `render()`.

### 4. Delegación de eventos en `#lista-pedidos`
- **Un solo** `addEventListener("click", ...)` sobre `#lista-pedidos`.
- Dentro: `const boton = evento.target.closest("button[data-id]")`; si es `null`, salir.
- Leer `data-id` (recuerda que llega como texto: convertir con `Number`), y según el botón
  (`data-accion="entregar"` o `data-accion="eliminar"`) llamar a `marcarEntregado()` o quitar el
  pedido del arreglo. Después, `render()`.
- En `INFORME.md`, sección "Justificación de la delegación", explicar con tus palabras (5–8 líneas)
  por qué es mejor que un listener por botón. Ideas a cubrir: los botones se crean y destruyen en
  cada `render()`, así que habría que volver a registrar listeners cada vez; menos listeners en
  memoria; los botones nuevos funcionan sin código extra; menos riesgo de listeners duplicados o
  que se queden huérfanos.

### 5. Prueba de seguridad (XSS)
- Registrar como producto exactamente: `<img src=x onerror="alert(1)">`
- Probar dos versiones de dibujo de la lista y anotar **qué pasó en cada una**:
  - Con `innerHTML`: el navegador interpreta el texto como HTML, intenta cargar la imagen `x`,
    falla y ejecuta `onerror` → aparece `alert(1)`. Es una inyección de código (XSS).
  - Con `createElement` + `textContent`: el texto se muestra tal cual, como texto, y no se ejecuta nada.
- Explicar el riesgo (robo de sesión/cookies, acciones en nombre del usuario, etc.) y **decidir**:
  la versión final de `render()` usa `createElement` + `textContent`. Nunca `innerHTML` con datos
  del usuario.
- Guardar la prueba en `INFORME.md` (sección "Prueba de seguridad") con una tabla pequeña
  comparando ambos métodos. Si no puedes ejecutar el navegador, di claramente que el resultado
  descrito es el comportamiento esperado y que **no lo observaste**, y deja los pasos para que la
  persona lo compruebe y ponga una captura.

### 6. Revisión de la `render()` propuesta por una IA
- Si la persona ya tiene la propuesta de la IA en el proyecto, úsala. Si no está, **pídesela**.
  No la inventes ni la hagas pasar por la de otra IA. Solo si la persona lo autoriza, genera una
  y márcala claramente como "generada por esta sesión".
- En `INFORME.md`, sección "Revisión de la IA", responder:
  1. ¿Usaba `innerHTML` con datos del usuario? (sí/no, y en qué línea)
  2. ¿Recalculaba bien el total? (¿desde cero?, ¿sobre el arreglo?, ¿maneja lista vacía?)
  3. Qué **aceptó**, qué **corrigió** y qué **rechazó**, cada punto con su justificación.
- La `render()` final del proyecto debe ser la versión revisada, no la propuesta sin cambios.

## Entregables

- `index.html`, el `.js` y el `.css` funcionando y consistentes con los ids (`#mensaje`,
  `#lista-pedidos`, y el elemento del total que ya exista).
- `INFORME.md` con: Estado inicial, tabla de eventos, justificación de la delegación,
  prueba de seguridad, revisión de la IA y una lista de cambios hechos.

## Antes de terminar (checklist)

- [ ] No hay `alert()` en el código.
- [ ] No hay `innerHTML` con datos del usuario.
- [ ] Hay un único listener de click para Entregar/Eliminar.
- [ ] `render()` se llama tras cada cambio y el total sale del arreglo.
- [ ] Las validaciones cubren producto vacío, precio `<= 0` y cantidad negativa.
- [ ] La tabla de eventos coincide con los listeners reales.
- [ ] Probé (o dejé claro que no pude probar) agregar `<img src=x onerror="alert(1)">`.
- [ ] Todo lo que dice `INFORME.md` es cierto y verificable en el código.

## Cómo comunicarte

Al terminar, resume en pocas líneas qué estaba hecho, qué completaste y qué quedó pendiente o sin
verificar. Sé honesto: si algo no lo pudiste probar, dilo.