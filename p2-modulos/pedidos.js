const IGV = 0.18;

/**
 * Clase Pedido: representa un pedido con sus datos y cálculos.
 * Export default porque este módulo representa una sola cosa principal: la clase Pedido.
 */
export default class Pedido {
  constructor({
    id = crypto.randomUUID(),
    producto = "",
    precio = 0,
    cantidad = 0,
    cliente = null,
    entregado = false,
  } = {}) {
    this.id = id;
    this.producto = producto;
    this.precio = precio;
    this.cantidad = cantidad;
    this.cliente = cliente;
    this.entregado = entregado;
  }

  /** Getter del subtotal del pedido (precio * cantidad). */
  get subtotal() {
    return this.precio * this.cantidad;
  }

  /** Getter del total del pedido ya con IGV aplicado. */
  get totalConIGV() {
    return this.subtotal * (1 + IGV);
  }

  /** Devuelve el nombre del cliente o "Anónimo" si no hay cliente. Usa encadenamiento opcional ?. */
  get nombreCliente() {
    return this.cliente?.nombre ?? "Anónimo";
  }
}

/**
 * Calcula el total general de un arreglo de pedidos usando reduce().
 * Suma los subtotales y aplica el IGV al final.
 */
export function calcularTotal(pedidos) {
  const sumaSubtotales = pedidos.reduce(
    (acumulado, pedido) => acumulado + new Pedido(pedido).subtotal,
    0
  );
  return sumaSubtotales * (1 + IGV);
}

/**
 * Filtra los pedidos por estado: "todos", "pendiente" o "entregado".
 * Devuelve un arreglo nuevo de objetos Pedido.
 */
export function filtrarPorEstado(pedidos, estado) {
  const objetos = pedidos.map(pedido => new Pedido(pedido));
  if (estado === "todos") return objetos;
  if (estado === "entregado") return objetos.filter(pedido => pedido.entregado);
  return objetos.filter(pedido => !pedido.entregado);
}

/**
 * Marca un pedido como entregado sin mutar el arreglo original.
 * Devuelve un arreglo nuevo con map y spread { ...pedido, entregado: true }.
 */
export function marcarEntregado(pedidos, id) {
  return pedidos.map(pedido => {
    const p = new Pedido(pedido);
    if (p.id === id) {
      return new Pedido({ ...p, entregado: true });
    }
    return p;
  });
}
