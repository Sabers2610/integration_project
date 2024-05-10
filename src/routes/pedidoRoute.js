const { Router } = require("express")
const { getPedido, getPedidoId, } = require("../controller/pedidoController.js")

const router = Router()

router.route("/pedidos/")
	.get(getPedido)

router.route("/pedidos/:id")
	.get(getPedidoId)

module.exports = router
