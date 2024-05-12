const { Router } = require("express")
const { getPedido, getPedidoId, postPedido } = require("../controller/pedidoController.js")

const router = Router()

router.route("/pedidos/")
	.get(getPedido)

router.route("/pedidos/:id")
	.get(getPedidoId)

router.route("/pedidos/")
	.post(postPedido)

module.exports = router
