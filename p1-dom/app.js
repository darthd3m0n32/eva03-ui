class Pedido {
    constructor(producto, precio, cantidad) {
        this.id = siguienteId++;
        this.producto = producto;
        this.precio = precio;
        this.cantidad = cantidad;
        this.estado = "pendiente";
    }

    subtotal() {
        return this.precio * this.cantidad;
    }

    marcarEntregado() {
        this.estado = "entregado";
    }
}

const pedidos = [];
let siguienteId = 1;

const formulario = document.getElementById("form-pedido");
const lista_pedidos = document.getElementById("lista-pedidos");
const mensaje = document.getElementById("mensaje");
const filtro = document.getElementById("filtro");
const total = document.getElementById("total");

function obtenerPedidosFiltrados() {
    const valorFiltro = filtro.value;
    if (valorFiltro === "todos") {
        return pedidos;
    }
    return pedidos.filter(pedido => pedido.estado === valorFiltro);
}

function render() {
    // Limpiar la lista sin usar innerHTML con datos del usuario
    lista_pedidos.textContent = "";

    const pedidosAMostrar = obtenerPedidosFiltrados();

    let sumaTotal = 0;

    for (const pedido of pedidosAMostrar) {
        sumaTotal += pedido.subtotal();

        const item = document.createElement("li");

        const info = document.createElement("span");
        info.textContent = `${pedido.producto} - S/ ${pedido.precio} | Cantidad: ${pedido.cantidad} | Subtotal: S/ ${pedido.subtotal()} | Estado: ${pedido.estado}`;
        item.appendChild(info);

        const botonEntregar = document.createElement("button");
        botonEntregar.type = "button";
        botonEntregar.dataset.id = pedido.id;
        botonEntregar.dataset.accion = "entregar";
        botonEntregar.textContent = "Entregar";
        item.appendChild(botonEntregar);

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.dataset.id = pedido.id;
        botonEliminar.dataset.accion = "eliminar";
        botonEliminar.textContent = "Eliminar";
        item.appendChild(botonEliminar);

        lista_pedidos.appendChild(item);
    }

    total.textContent = `Total: S/ ${sumaTotal.toFixed(2)}`;
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const inputProducto = document.getElementById("producto");
    const inputPrecio = document.getElementById("precio");
    const inputCantidad = document.getElementById("cantidad");

    const nombreProducto = inputProducto.value.trim();
    const precioProducto = Number(inputPrecio.value);
    const cantidadProducto = Number(inputCantidad.value);

    const errores = [];

    if (nombreProducto === "") {
        errores.push("El producto no puede estar vacío.");
    }

    if (!isFinite(precioProducto) || precioProducto <= 0) {
        errores.push("El precio debe ser un número mayor a 0.");
    }

    if (!Number.isInteger(cantidadProducto) || cantidadProducto <= 0) {
        errores.push("La cantidad debe ser un número entero mayor a 0.");
    }

    if (errores.length > 0) {
        mensaje.textContent = errores.join(" ");
        return;
    }

    const pedido = new Pedido(nombreProducto, precioProducto, cantidadProducto);

    pedidos.push(pedido);

    formulario.reset();
    mensaje.textContent = "";

    render();
});

lista_pedidos.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-id]");
    if (boton === null) {
        return;
    }

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    const indice = pedidos.findIndex(pedido => pedido.id === id);
    if (indice === -1) {
        return;
    }

    if (accion === "entregar") {
        pedidos[indice].marcarEntregado();
    } else if (accion === "eliminar") {
        pedidos.splice(indice, 1);
    }

    render();
});

filtro.addEventListener("change", () => {
    render();
});

render();
