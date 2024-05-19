const { Router } = require("express")
const Producto = require("../controller/ProductoCTRL.js")
const authenticateToken = require("../utils/jwtMiddleware.js")
const authorizeAdmin = require("../utils/authorizeAdmin.js")

const router = Router()

router.route("/productos/categorias/:id")
	.get(Producto.allCategory)

router.route("/productos/marca/:id")
	.get(Producto.allBrand)

router.route("/productos/:id")
	.post(Producto.findOne)

router.route("/productos/:id/stock")
	.get(Producto.findStock)

router.route("/productos/:id/usd")
    .get(Producto.changeCurrency)

module.exports = router
router.route("/preguntas/")
	.get(authenticateToken, authorizeAdmin, Producto.listQuestions)
	.post(authenticateToken, Producto.question)

router.route("/preguntas/respuesta/")
	.post(authenticateToken, authorizeAdmin, Producto.answer)


module.exports = router
