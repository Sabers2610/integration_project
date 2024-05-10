const express = require("express")
const app = express()
require("dotenv").config()
app.use(express.json())

app.get("/", (request, response) => {
    response.send("<p>Api Rest pedido running</p>")
})

app.use("/1.0/", require("./routes/pedidoRoute.js"))

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
    console.log(`Api pedido rest Running in port ${PORT}`)
})
