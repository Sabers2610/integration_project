const {Router}=require("express")
const {login, register} = require("../controller/userController.js")

const router = Router()

router.route("/login/")
    .post(login)

router.route("/register/")
    .post(register)

module.exports = router