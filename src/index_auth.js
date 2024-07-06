const express = require("express")
const app = express()
const morgan = require("morgan")
const path = require('path');
require("dotenv").config()
app.use(morgan("tiny"))
app.use(express.json())

app.use(express.static(path.join(__dirname, 'views')));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, 'views', 'doc_auth.html'));
})

app.use("/1.0/", require("./routes/userRoute.js"))


const PORT = process.env.PORT || 3001


app.listen(PORT, () => {
    console.log(`Api rest Running in port ${PORT}`)
})
