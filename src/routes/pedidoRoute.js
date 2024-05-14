const { Router } = require("express")
const { authenticateToken } = require("../utils/jwtMiddleware.js")
const { getPedido, getPedidoId, postPedido } = require("../controller/pedidoController.js")

const router = Router()

router.route("/pedidos/")
	.get(getPedido)
	.post(authenticateToken, postPedido)

router.route("/pedidos/:id")
	.get(getPedidoId)

module.exports = router
