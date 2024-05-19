const Pedido = require("../models/Pedido.js")
const { DetallePedido } = require("../models/DetallePedido.js")
const Producto = require("../models/Producto.js")
const { getConnection } = require("../database.js")
const JWT = require("jsonwebtoken")
const { v4: uuid4 } = require("uuid")
//const encript = require("bcryptjs")
const { SQLError, AuthError, FormatError } = require("../utils/exception.js")
const axios = require("axios")
const createOrder = require("../utils/mercadoPagoApi.js")
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
	// TODO: Verificar si es el mismo cliente quien esta haciendo el pedido
	const { cliente, detalles } = request.body
	//Token para verificar que el pedido lo esta realizando el mismo cliente
	// TODO: Modificar JWT para que entrege el rut
	const rut_jwt = request.user.user.rut

	if (cliente.rut !== rut_jwt) {
		return response.status(403).json({ message: 'El RUT del cliente no coincide con el RUT del token' });
	}

	if (!cliente || typeof cliente.rut !== 'string') {
		return response.status(400).json({ message: 'Cliente y RUT del cliente son requeridos y el RUT debe ser una cadena.' });
	}

	if (!Array.isArray(detalles) || detalles.length === 0) {
		return response.status(400).json({ message: 'Detalles es requerido y debe ser un array con al menos un elemento.' });
	}

	for (const detalle of detalles) {
		if (typeof detalle.cantidad !== 'number' || detalle.cantidad <= 0) {
			return response.status(400).json({ message: 'Cada detalle debe tener una cantidad positiva.' });
		}
		if (!detalle.product || typeof detalle.product.id_producto !== 'number') {
			return response.status(400).json({ message: 'Cada detalle debe tener un producto con id_producto (número)' });
		}
		if (typeof detalle.sucursal !== 'number') {
			return response.status(400).json({ message: 'Cada detalle debe tener una sucursal con un id de tipo número.' });
		}
	}

	let connection = null
	try {
		connection = await getConnection();
		await connection.beginTransaction();

		// Comprobar stock
		for (const detalle of detalles) {
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
			// TODO: Revisar como trabajar el precio
			const sqlSubTotal = `SELECT p.precio
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
			const [rowsStock, _fieldsStock] = await connection.query(sqlStock, valuesStock)
			if (rowsStock.affectedRows === 0) {
				throw new Error(`Error al actualizar stock para producto ${product.id_producto} en la sucursal ${sucursal}`)
			}
		};
		const sqlUpdateTotal = "UPDATE pedido SET total = ? WHERE id_pedido = ?"
		const valuesUpdateTotal = [totalPedido, id_pedido]
		await connection.query(sqlUpdateTotal, valuesUpdateTotal)

		await connection.commit();
		// TODO: Cambiar el mensaje con informacion relevante
		const url_pago = await createOrder(id_pedido, totalPedido)
		console.log(url_pago)
		return response.redirect(url_pago)

	} catch (error) {
		if (connection) {
			await connection.rollback()
		}
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
	console.log(request.body)
	return response.status(200).json({ "message": "Recibi llamada" })
	const { id_pedido } = request.body
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

// TODO: Historial de precios

module.exports = Pedido

