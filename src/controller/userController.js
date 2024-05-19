const { User } = require("../models/User.js")
const Especiality = require("../models/Especiality.js")
const { getConnection } = require("../database.js")
const JWT = require("jsonwebtoken")
const { v4: uuid4 } = require("uuid")
const encript = require("bcryptjs")
const { SQLError, AuthError, FormatError } = require("../utils/exception.js")
require("dotenv").config()

User.login = async (request, response) => {
    const { email, password } = request.body
    var connection = null
    try {
        connection = await getConnection()
        var sqlQuery = `SELECT nombre, correo, clave, admin, rut
                            FROM usuario
                            WHERE correo = ?`
        const values = [email]
        const [rows, fields] = await connection.query(sqlQuery, values)
        if (rows.length === 0) {
            throw new AuthError("User and/or password incorrect", "API_AUTH_UNAUTHORIZED")
        }
        const user = rows[0]
        const passwordValidator = await encript.compare(password, user.clave)

        if (!passwordValidator) throw new AuthError("User and/or password incorrect", "API_AUTH_UNAUTHORIZED")

        const tokenPayload = {
            sessionID: uuid4(),
            user: { name: user.name, email: email, rut: user.rut },
            role: user.empleado ? "Empleado" : "Cliente",
            admin: user.admin ? true : false,
            // Hay que sumar la fecha actual al tiempo de expiracion y dividirla en mil (Unix epoch)
            exp: Math.floor(Date.now() / 1000) + Number(process.env.JWT_EXPIRE)
        }

        const token = JWT.sign(tokenPayload, process.env.JWT_SECRET_KEY, {
            algorithm: 'HS256'
        })

        return response.status(202).json(token)
    } catch (error) {
        if (!connection) response.status(500).json({
            "name": "DATABASE_ERROR",
            "type": "DATABASE_NO_CONNECTION",
            "message": error.message
        })

        if (error instanceof SQLError) return response.status(500).json(error.exceptionJson())

        else if (error instanceof AuthError) return response.status(401).json(error.exceptionJson())

        else return response.status(500).json({
            "name": error.name,
            "type": "INTERNAL_API_ERROR",
            "message": error.message
        })

    } finally {
        if (connection) {
            connection.release()
        }
    }
}

User.register = async (request, response) => {
    const { rut, name, lastname, age, direction, email, password, esp } = request.body
    var connection = null
    try {
        var passwordHash = await encript.hash(password, 10)
        const user = new User(rut, name, lastname, age, direction, email, passwordHash)

        if (esp !== "") {
            const especiality = new Especiality(esp.id, esp.name_especiality, true)
            user.especiality = especiality
        }

        connection = await getConnection()
        const sqlQuery = `INSERT INTO usuario VALUES(?,?,?,?,?,?,?,?,?,?)`
        const values = [
            user.rut,
            user.name,
            user.lastName,
            user.age,
            user.direction,
            user.email,
            user.password,
            user.especiality ? user.especiality.id_especiality : null,
            user.especiality ? true : false,
            user.enabled
        ]
        const [rows, fields] = await connection.query(sqlQuery, values)


        return response.status(201).json(user.toJson())
    } catch (error) {
        if (!connection && !error instanceof FormatError) return response.status(500).json({
            "name": "DATABASE_ERROR",
            "type": "DATABASE_NO_CONNECTION",
            "message": error.message
        })

        if (error instanceof SQLError) return response.status(500).json(error.exceptionJson())

        else if (error instanceof FormatError) return response.status(400).json(error.exceptionJson())

        else return response.status(500).json({
            "name": error.name,
            "type": "INTERNAL_API_ERROR",
            "message": error.message
        })

    } finally {
        if (connection) connection.release()
    }

}


module.exports = User

// SE DEBE ARREGLAR EL REGISTER

/* const sqlQuery = `INSERT INTO usuario VALUES(?,?,?,?,?,?,?,?,?,?,?)`
                const values = [
                    user.rut,
                    user.name,
                    user.lastName,
                    user.age,
                    user.direction,
                    user.email,
                    user.password,
                    user.especialty ? user.especialty.id_especialty : null,
                    user.employee,
                    user.admin,
                    user.enabled
                ]*/

