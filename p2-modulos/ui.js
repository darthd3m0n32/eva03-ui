import Pedido from "./pedidos.js";

/**
 * Renderiza la lista de pedidos en el elemento <ul> recibido.
 * Recibe el arreglo de pedidos y el elemento contenedor del DOM.
 */
export function renderPedidos(pedidos, listaElement) {
  listaElement.innerHTML = "";
  const objetos = pedidos.map(pedido => new Pedido(pedido));

  for (const p of objetos) {
    const li = document.createElement("li");
    const estadoTexto = p.entregado ? "Entregado" : "Pendiente";
    li.textContent = `${p.producto} x${p.cantidad} - S/${p.subtotal.toFixed(2)} - Cliente: ${p.nombreCliente} - ${estadoTexto}`;
    listaElement.appendChild(li);
  }
}

/**
 * Muestra el total formateado en el elemento recibido.
 */
export function mostrarTotal(total, elemento) {
  elemento.textContent = `Total: S/${total.toFixed(2)}`;
}
