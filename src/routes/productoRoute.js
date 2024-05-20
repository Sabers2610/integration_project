const { Router } = require("express")
const Producto = require("../controller/ProductoCTRL.js")
const jwtAdminvalidate = require("../utils/authorizeAdmin.js")
const jwtvalidate = require("../utils/jwtMiddleware.js")

const router = Router()

router.route("/productos/categorias/:id")
	.get(Producto.allCategory)

router.route("/productos/marca/:id")
	.get(Producto.allBrand)

router.route("/productos/:id")
    .post(Producto.findOne)
    .put(jwtvalidate, jwtAdminvalidate, Producto.modify)

router.route("/productos/:id/stock")
	.get(Producto.findStock)

router.route("/productos/:id/usd")
	.get(Producto.changeCurrency)

router.route("/preguntas/")
	.get(authenticateToken, authorizeAdmin, Producto.listQuestions)
	.post(authenticateToken, Producto.question)

router.route("/preguntas/respuesta/")
	.post(authenticateToken, authorizeAdmin, Producto.answer)


module.exports = router
