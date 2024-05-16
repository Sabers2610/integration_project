const mysql = require("mysql2/promise")
require("dotenv").config()

console.log()
const connection = mysql.createPool(
    `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@sql-first-integration-apitest.h.aivencloud.com:17527/integration_ferremax?ssl-mode=REQUIRED`
)

async function getConnection() {
    return connection.getConnection()
}

module.exports = { getConnection }
