const mysql = require("mysql2/promise")
require("dotenv").config()


const connection = mysql.createPool(
    `mysql://${process.env.USER}:${process.env.PASSWORD}@sql-first-integration-apitest.h.aivencloud.com:17527/integration_ferremax?ssl-mode=REQUIRED`
)

async function getConnection() {
    return connection.getConnection()
}

module.exports = { getConnection}