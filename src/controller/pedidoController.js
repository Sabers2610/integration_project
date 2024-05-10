const { Pedido } = require("../models/Pedido.js")
const { getConnection } = require("../database.js")
const JWT = require("jsonwebtoken")
const { v4: uuid4 } = require("uuid")
//const encript = require("bcryptjs")
const { SQLError, AuthError, FormatError } = require("../utils/exception.js")
require("dotenv").config()

Pedido.getPedido = async (request, response) => {
	var connection = null;
	try {
		connection = await getConnection();
		var sqlQuery = `SELECT * FROM pedido`;
		const [rows, fields] = await connection.query(sqlQuery);
		return response.status(200).json(rows.values())
	} catch (error) {
		if (!connection) response.status(500).json({
			"name": "DATABASE_ERROR",
			"type": "DATABASE_NO_CONNECTION",
			"message": error.message
		})

		if (error instanceof SQLError) return response.status(500).json(error.exceptionJson())

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

Pedido.getPedidoId = async (request, response) => {
	const { id } = request.body
	var connection = null;

	try {
		connection = await getConnection();
		const sqlQuery = 'SELECT id_pedido, fecha_hora_pedido, estado, total FROM pedido WHERE ?';
		const values = [id]
		const [rows, fields] = await connection.query(sqlQuery, values);
		console.log(rows);
		console.log(fields);
	} catch (error) {
		if (!connection) response.status(500).json({
			"name": "DATABASE_ERROR",
			"type": "DATABASE_NO_CONNECTION",
			"message": error.message
		})

		if (error instanceof SQLError) return response.status(500).json(error.exceptionJson())
	} finally {
		if (connection) {
			connection.release()
		}
	}
}

Pedido.postPedido = async (request, response) => {
	// TODO: Missing atributes
	const { } = request.body
	var connection = null;

	try {
		const pedido = Pedido
		connection = await getConnection();
		const sqlQuery = 'INSERT INTO pedido VALUES (?, ?, ?, ?)';
		const values = []
	} catch {

	} finally {
		if (connection) {
			connection.release()
		}
	}


}

module.exports = Pedido

