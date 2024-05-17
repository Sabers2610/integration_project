const { FormatError } = require("../utils/exception.js")

class DetallePedido {
    constructor(cantidad = 0, sub_total = 0, producto, sucursal) {
        this.setCantidad(cantidad)
        this.setSubTotal(sub_total)
        this.producto = producto // Clase producto
        // TODO:Consultar este campo con los demas
        this.sucursal = sucursal
    }

    // TODO: Revisar validaciones

    setCantidad(cantidad) {
        if (cantidad < 0 || cantidad > 999 || typeof cantidad !== "number") {
            throw new FormatError("Cantidad invalida", "API_FORMAT_ERROR")
        }

        this.cantidad = cantidad;
    }

    setSubTotal(sub_total) {
        if (sub_total < 0 || sub_total > 999999999 || typeof sub_total !== "number") {
            throw new FormatError("Valor sub total invalido", "API_FORMAT_ERROR")
        }

        this.sub_total = sub_total;
    }

    toJson() {
        const json = {
            "cantidad": this.cantidad,
            "sub_total": this.sub_total,
            "producto": this.producto
        }

        return json
    }
}

module.exports = { DetallePedido }
