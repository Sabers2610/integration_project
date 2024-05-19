const { Router } = require("express")
const {CreateOrder} = require("../utils/mercadoPagoApi.js")

const router = Router()

router.route("/crear-orden")
    .get(CreateOrder)

router.route("/pago-completado")

router.route("/webhook")

module.exports = router