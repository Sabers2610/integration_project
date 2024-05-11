const { FormatError } = require("../utils/exceptions.js")

class Pedido {
    constructor(id_pedido = 0, cliente = null, productos = null, estado = false, fecha, total) {
        this.id_pedido = id_pedido
        this.cliente = cliente // Clase User
        this.productos = productos // Clase DetallePedido
        this.estado = estado
        this.fecha = fecha
        this.setTotal(total)
    }

    // TODO: Revisar validaciones

    setTotal(total) {
        if (total < 0 || total > 999999999 || typeof total !== "number") {
            throw new FormatError("Valor total invalido", "API_FORMAT_ERROR")
        }

        this.total = total;
    }

    toJson() {
        const json = {
            "id_pedido": this.id_pedido,
            "cliente": this.cliente.toJson(),
            "Productos": this.productos.toJson(),
            "estado": this.estado ? "Pagado" : "Pendiente",
            "fecha": this.fecha,
            "total": this.total,
        }

        return json
    }
}

module.exports = { Pedido }
