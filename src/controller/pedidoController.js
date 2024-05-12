const { Pedido } = require("../models/Pedido.js")
const { DetallePedido } = require("../models/DetallePedido.js")
const { Producto } = require("../models/Producto.js")
const { getConnection } = require("../database.js")
const JWT = require("jsonwebtoken")
const { v4: uuid4 } = require("uuid")
//const encript = require("bcryptjs")
const { SQLError, AuthError, FormatError } = require("../utils/exception.js")
require("dotenv").config()

// TODO: Mostrar detalle de pedido
Pedido.getPedido = async (request, response) => {
	var connection = null;
	try {
		connection = await getConnection();
		var sqlQuery = `SELECT * FROM pedido`;
		const [rows, _fields] = await connection.query(sqlQuery);
		return response.status(200).json(rows)
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

// TODO: Mostrar detalle de pedido
Pedido.getPedidoId = async (request, response) => {
	const { id } = request.params
	var connection = null;

	try {
		connection = await getConnection();
		const sqlQuery = 'SELECT id_pedido, fecha_hora_pedido, estado, total FROM pedido WHERE id_pedido = ?';
		const values = [id]
		const [rows, fields] = await connection.query(sqlQuery, values);
		return response.status(200).json(rows)

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
	// TODO: Revisar logica de como se va enviar los productos para insert
	const { cliente, detalles } = request.body
	var connection = null;

	try {
		connection = await getConnection()

		const sqlPedido = `INSERT INTO pedido VALUES(0, NOW(), 0,?,?)`
		const valuesPedido = [
			101, // TODO: Calcular el total del pedido con subconsulta
			cliente.rut
		]

		const [rows, _fields] = await connection.query(sqlPedido, valuesPedido)

		// La tabla pedido tiene un id auto incrementable con "insertId" se obtiene el valor del mismo
		const id_pedido = rows.insertId
		// Inserts para tabla "detalle_pedido" por cada producto
		for (const detalle of detalles) {
			const { cantidad, sub_total, product } = detalle;
			const producto = new Producto(
				product.detalle_producto,
				product.tipo_producto,
				product.id_producto,
				product.nombre_producto,
				product.precio,
				product.marca,
				product.disponibilidad
			);
			const detallePedido = new DetallePedido(cantidad, sub_total, producto)

			const sqlDetalle = "INSERT INTO detalle_pedido VALUES(?,?,?,?)"
			const valuesDetalle = [
				detallePedido.cantidad,
				detallePedido.sub_total, // TODO: Calcular sub_total con subconsulta
				id_pedido,
				detallePedido.producto.id_producto
			]

			const [rows, _fields] = await connection.query(sqlDetalle, valuesDetalle)

			// TODO: Cambiar response con informacion del pedido
			return response.status(200).json({ Message: "Exito al crear pedido" })
		};

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

module.exports = Pedido

