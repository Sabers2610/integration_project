class Pedido {
    constructor(rut = "", idPedido = 0, fechaHoraPedido = "", estado = "Pendiente", total = 0) {
        this.rut = rut
        this.idPedido = idPedido
        this.fechaHoraPedido = fechaHoraPedido
        this.estado = estado
        this.total = total
    }

    toJson() {
        const json = {
            rut: this.rut,
            idPedido: this.idPedido,
            fechaHoraPedido: this.fechaHoraPedido,
            estado: this.estado,
            total: this.total,
        }

        return json
    }
}

module.exports = { Pedido }
