const { Router } = require("express")
const Producto = require("../controller/ProductoCTRL.js")

const router = Router()

router.route("/productos/categorias/:id")
    .get(Producto.allCategory)

router.route("/productos/marca/:id")
    .get(Producto.allBrand)


module.exports = router