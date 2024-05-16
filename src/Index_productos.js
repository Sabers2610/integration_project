const express = require("express")
const app = express()
app.use(express.json())

app.get("/", (request, response) => {
    response.send("<p>Api producto funcionando correctamente</p>")
})

app.use("/1.0/", require("./routes/productoRoute.js"))

PORT = 3003
app.listen(PORT, () => {
    console.log(`Api running in port (${PORT})`)
})