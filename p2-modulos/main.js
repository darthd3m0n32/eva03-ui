import Pedido from "./pedidos.js";
import { calcularTotal, filtrarPorEstado, marcarEntregado } from "./pedidos.js";
import { renderPedidos, mostrarTotal } from "./ui.js";

// Datos iniciales (el mismo arreglo de pedidos del archivo original app.js,
// ahora con id explícito para poder identificar cada pedido al marcar como entregado).
const pedidosIniciales = [
  { id: "p1", producto: "Café", precio: 6, cantidad: 2, cliente: { nombre: "Ana" } },
  { id: "p2", producto: "Croissant", precio: 4.5, cantidad: 0 }, // cancelado: 0 unidades
  { id: "p3", producto: "Jugo", precio: 8 },                      // sin cantidad: vale 0 con ??
];

const lista = document.getElementById("lista-pedidos");
const totalEl = document.getElementById("total");
const filtro = document.getElementById("filtro");

let pedidosActuales = pedidosIniciales;

function actualizarVista() {
  const visibles = filtrarPorEstado(pedidosActuales, filtro.value);
  renderPedidos(visibles, lista);
  const total = calcularTotal(pedidosActuales);
  mostrarTotal(total, totalEl);
}

// Evento del filtro
filtro.addEventListener("change", actualizarVista);

// Arranque inicial
actualizarVista();

// ============================================================================
// DEMOSTRACIONES OBLIGATORIAS (consola del navegador)
// ============================================================================

// --- Paso 1: Refactorización (antes vs después) ---
console.log("=== Paso 1: Refactorización a JavaScript moderno ===");
console.log("Resultado con el arreglo original (refactorizado):");
console.table(pedidosIniciales);
console.log("Total con IGV (refactorizado):", calcularTotal(pedidosIniciales).toFixed(2));

// --- Paso 2: Clase Pedido y spread sin mutar ---
console.log("\n=== Paso 2: Clase Pedido y spread sin mutar ===");
console.log("Arreglo ORIGINAL antes de marcar:");
console.table(pedidosIniciales);

const pedidosNuevos = marcarEntregado(pedidosIniciales, "p2");

console.log("¿El arreglo original es el mismo que el nuevo? (debe ser false):",
  pedidosIniciales === pedidosNuevos);
console.log("Contenido del ORIGINAL (p2.entregado debe seguir siendo false):");
console.table(pedidosIniciales);
console.log("Contenido del NUEVO (p2.entregado debe ser true):");
console.table(pedidosNuevos);

// --- Paso 5: Verificación del error || vs ?? ---
console.log("\n=== Paso 5: Error || vs ?? ===");
const pedidoCantidadCero = new Pedido({ producto: "Prueba", precio: 10, cantidad: 0 });
console.log("Pedido con cantidad: 0 -> subtotal:", pedidoCantidadCero.subtotal,
  "(debe ser 0, no 10). El operador ?? respeta el 0.");
const pedidoSinCantidad = new Pedido({ producto: "Prueba 2", precio: 10 });
console.log("Pedido sin cantidad -> subtotal:", pedidoSinCantidad.subtotal,
  "(debe ser 0 por valor por defecto de desestructuración).");
