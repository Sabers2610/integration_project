const { Router } = require("express")
const authenticateToken = require("../utils/jwtMiddleware.js")
const authorizeAdmin = require("../utils/authorizeAdmin.js")
const { getPedido, getPedidoId, postPedido, paidPedido } = require("../controller/pedidoController.js")

const router = Router()

router.route("/pedidos/")
	.get(authenticateToken, authorizeAdmin, getPedido) // TODO: Quitar authorizeAdmin esta solamente por razones de prueba
	.post(authenticateToken, postPedido)

router.route("/pedidos/:id")
	.get(authenticateToken, getPedidoId)

router.route("/validar-pedido/")
	.post(paidPedido)

module.exports = router
