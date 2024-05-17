const { Router } = require("express")
const Producto = require("../controller/ProductoCTRL.js")

const router = Router()

router.route("/productos/categorias/:id")
    .get(Producto.allCategory)

router.route("/productos/marca/:id")
    .get(Producto.allBrand)

router.route("/productos/:id")
    .post(Producto.findOne)

router.route("/productos/:id/stock")
    .get(Producto.findStock)

module.exports = router