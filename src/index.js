const express = require("express")
const app = express()
require("dotenv").config()

app.use(express.json())

app.get("/", (request, response)=> {
    response.send("<p>Api Rest running</p>")
})

app.use("/1.0/", require("./routes/userRoute.js"))

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Api rest Running in port ${PORT}`)
})
