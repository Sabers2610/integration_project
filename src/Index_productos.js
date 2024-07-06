const express = require("express")
const app = express()
const path = require('path');
app.use(express.json())

app.use(express.static(path.join(__dirname, 'views')));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, 'views', 'doc_productos.html'));
})

app.use("/1.0/", require("./routes/productoRoute.js"))

PORT = 3003

app.listen(PORT, () => {
    console.log(`Api running in port (${PORT})`)
})
