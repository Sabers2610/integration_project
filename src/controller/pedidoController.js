const Pedido = require("../models/Pedido.js")
const { DetallePedido } = require("../models/DetallePedido.js")
const Producto = require("../models/Producto.js")
const { getConnection } = require("../database.js")
const JWT = require("jsonwebtoken")
const { v4: uuid4 } = require("uuid")
//const encript = require("bcryptjs")
const { SQLError, AuthError, FormatError } = require("../utils/exception.js")
const axios = require("axios")
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

		// Comprobar stock
		for (const detalle of detalles) {
			console.log(detalle)
			const id_producto = detalle.product.id_producto
			const url = `http://localhost:3003/1.0/productos/${id_producto}/stock`

			const stockResponse = await axios.get(url)
			const stockData = stockResponse.data

			const branchStock = stockData.stock_sucursales.find(sucursal => sucursal.id_sucursal === detalle.sucursal)

			if (!branchStock) {
				return response.status(400).json({
					message: `No hay informacion de stock para el producto en la sucursal ${detalle.sucursal}`
				})
			}

			if (branchStock.stock < detalle.cantidad) {
				return response.status(400).json({
					message: `El producto con id ${id_producto} no tiene suficiente stock en la sucursal con id ${detalle.sucursal}. Stock disponible: ${branchStock.stock}, Cantidad requerida: ${detalle.cantidad}`
				})
			}
		}

		// Insertamos solamente el rut ya que los otros valores se calculan con informacion del la base de datos
		const sqlPedido = `INSERT INTO pedido VALUES(0, NOW(), 0,0,?)`
		const valuesPedido = [
			cliente.rut
		]

		const [rows, _fields] = await connection.query(sqlPedido, valuesPedido)

		// La tabla pedido tiene un id auto incrementable con "insertId" se obtiene el valor del mismo
		const id_pedido = rows.insertId

		let totalPedido = 0;
		// Inserts para tabla "detalle_pedido" por cada producto
		for (const detalle of detalles) {
			console.log(detalle)
			const { cantidad, product, sucursal } = detalle;
			const producto = new Producto(
				null,
				null,
				null,
				1,
				product.id_producto,
				product.nombre_producto,
				0,
				null,
				false,
				0
			);
			const detallePedido = new DetallePedido(cantidad, 0, producto, sucursal)

			// TODO: Que hacer en el caso de id_estado = 2
			const sqlSubTotal = `SELECT CASE
						WHEN p.id_estado = 1 THEN p.precio 
						WHEN p.id_estado = 3 THEN p.precio * (1 - (p.descuento/100)) 
						ELSE p.precio END AS precio 
					FROM producto p 
					WHERE id_producto = ?`
			const valuesSubTotal = [product.id_producto]

			const [rowsSub, _fieldsSub] = await connection.query(sqlSubTotal, valuesSubTotal)

			const valorProducto = rowsSub[0].precio


			detallePedido.sub_total = valorProducto * detallePedido.cantidad
			totalPedido += detallePedido.sub_total

			//Insert Detalles
			const sqlDetalle = "INSERT INTO detalle_pedido VALUES(?,?,?,?,?)"
			const valuesDetalle = [
				detallePedido.cantidad,
				detallePedido.sub_total,
				id_pedido,
				detallePedido.producto.id_producto,
				detallePedido.sucursal
			]

			const [rows, _fields] = await connection.query(sqlDetalle, valuesDetalle)

			//Update stock

			const sqlStock = `UPDATE detalle_producto
				SET stock = stock - ?
				WHERE id_producto = ? AND id_sucursal = ?`
			const valuesStock = [cantidad, product.id_producto, sucursal]
			console.log(valuesStock)
			const [rowsStock, _fieldsStock] = await connection.query(sqlStock, valuesStock)
			// TODO: Tratar bien el update
			if (rowsStock.affectedRows > 0) {
				console.log("Update correcto")
			} else {
				console.log("Update incorrecto")
			}
		};
		const sqlUpdateTotal = "UPDATE pedido SET total = ? WHERE id_pedido = ?"
		const valuesUpdateTotal = [totalPedido, id_pedido]
		await connection.query(sqlUpdateTotal, valuesUpdateTotal)
		// TODO: Cambiar el mensaje con informacion relevante
		return response.status(200).json({ Message: "Exito al crear pedido" })

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

// TODO: Ver como trabaja la api de pagos
Pedido.paidPedido = async (request, response) => {
	const { id_pedido, rut } = request.body
	var connection = null;

	try {
		connection = await getConnection();
		const sqlQuery = 'UPDATE pedido SET estado = 1 WHERE id_pedido = ? AND rut = ?';
		const values = [id_pedido, rut]
		const [rows, fields] = await connection.query(sqlQuery, values);
		if (rowsStock.affectedRows > 0) {
			return response.status(200).json({ Message: "Pedido Actualizado" })
		} else {
			return response.status(400).json({ Message: "Error al actualizar el pedido" })
		}

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


module.exports = Pedido

