const Producto = require("../models/Producto.js")
const TipoProducto = require("../models/TipoProducto.js")
const Sucursal = require("../models/Sucursal.js")
const DetalleProducto = require("../models/DetalleProducto.js")
const Categoria = require("../models/Categoria.js")
const Marca = require("../models/Marca.js")
const Modelo = require("../models/Modelo.js")
const Estado = require("../models/Estado.js")
const axios = require("axios")

const { getConnection } = require("../database.js")
const { SQLError, FormatError } = require("../utils/exception.js")

// URL: /1.0/productos/categorias/:id
Producto.allCategory = async (request, response) => {
    const id_categoria = request.params.id
    const productos = []
    var connection = null
    try {
        connection = await getConnection()
        const sql = `SELECT tp.id_tipo_producto,
                        p.id_producto,
                        p.nombre_producto,
                        p.precio,
                        p.disponibilidad,
                        p.descuento,
                        p.id_modelo,
                        e.id_estado,
                        e.nombre_estado,
                        m.nombre_modelo,
                        m2.nombre_marca,
                        c.id_categoria,
                        c.nombre_categoria
                    FROM tipo_producto as tp
                    JOIN producto as p ON (p.id_tipo_producto = tp.id_tipo_producto)  JOIN categoria_producto as c ON (c.id_categoria = p.id_categoria) 
                    JOIN modelo as m ON (p.id_modelo = m.id_modelo)
                    JOIN marca as m2 ON (m2.id_marca = m.id_marca) JOIN estado_producto AS e ON e.id_estado = p.id_estado
                    WHERE c.id_categoria = ? AND p.disponibilidad = true
                    ORDER BY p.id_tipo_producto`
        const values = [id_categoria]
        const [rows, fields] = await connection.query(sql, values)
        if (rows.length === 0) {
            throw new SQLError("Hubo un error al ejecutar la peticion", "API_SQL_ERROR")
        }
        rows.map(f => {
            var categoria = f.nombre_categoria ? new Categoria(f.id_categoria, f.nombre_categoria) : null
            var estado = new Estado(f.id_estado, f.nombre_estado)
            var marca = new Marca(f.id_marca, f.nombre_marca)
            var modelo = new Modelo(f.id_modelo, f.nombre_modelo, marca)
            var tipo_producto = new TipoProducto(f.id_tipo_producto, f.nombre_tipo_producto)

            var producto = new Producto(null, tipo_producto, categoria, estado, f.id_producto, f.nombre_producto, f.precio, modelo, f.disponibilidad,
                f.descuento
            )
            productos.push(producto.toJson())
        })

        response.status(200).json(productos)
    } catch (error) {
        console.log(error)
        if (error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)

    } finally {
        if (connection) connection.release()
    }
}

Producto.allBrand = async (request, response) => {
    const productos = []
    const id_marca = request.params.id
    var connection = null
    try {
        connection = await getConnection()
        const query = `SELECT m2.id_modelo, m2.nombre_modelo,
                            p.id_producto,
                            p.nombre_producto,
                            p.precio,
                            p.disponibilidad,
                            tp.id_tipo_producto,
                            tp.nombre_tipo_producto,
                            p.descuento,
                            e.id_estado,
                            e.nombre_estado
                        FROM marca as m JOIN modelo as m2 ON m.id_marca = m2.id_marca JOIN producto as p ON p.id_modelo = m2.id_modelo
                        JOIN tipo_producto as tp ON tp.id_tipo_producto = p.id_tipo_producto 
                        JOIN estado_producto AS e ON e.id_estado = p.id_estado
                        WHERE m.id_marca = ? AND p.disponibilidad = true
                        ORDER BY p.id_tipo_producto`
        const values = [id_marca]
        const [rows, fields] = await connection.query(query, values)

        if (rows.length === 0) throw new SQLError("Hubo un error al buscar los productos de la marca", "API_SQL_ERROR")

        rows.map(f => {
            var modelo = new Modelo(f.id_modelo, f.nombre_modelo, null)
            var tipo_producto = new TipoProducto(f.id_tipo_producto, f.nombre_tipo_producto)
            var estado = new Estado(f.id_estado, f.nombre_estado)
            var producto = new Producto(null, tipo_producto, null, estado, f.id_producto, f.nombre_producto, f.precio,
                modelo, f.disponibilidad, f.descuento
            )
            console.log(producto.tipo_producto.toJson())
            console.log("ANTES DEL ARRAY")
            productos.push(producto.toJson())
        })
        response.status(200).json(productos)
    } catch (error) {
        console.log(error)
        if (error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)

    } finally {
        if (connection) connection.release()
    }
}

Producto.findStock = async (request, response) => {
    const id_producto = request.params.id
    const detalles = []
    var connection = null
    try {
        connection = await getConnection()
        const query = ` SELECT m.id_marca, m.nombre_marca,
                            m2.id_modelo, m2.nombre_modelo,
                            p.nombre_producto,
                            p.precio,
                            p.disponibilidad,
                            tp.id_tipo_producto,
                            tp.nombre_tipo_producto,
                            p.descuento,
                            e.id_estado,
                            e.nombre_estado
                        FROM marca as m JOIN modelo as m2 ON m.id_marca = m2.id_marca JOIN producto as p ON p.id_modelo = m2.id_modelo
                        JOIN tipo_producto as tp ON tp.id_tipo_producto = p.id_tipo_producto JOIN estado_producto AS e ON e.id_estado = p.id_estado
                        WHERE p.id_producto = ?`
        const values = [id_producto]
        const [rows, field] = await connection.query(query, values)
        if (rows.length === 0) throw new SQLError(`No se pudo encontrar un producto con el ID: ${id_producto}`, "API_SQL_ERROR")

        const pro = rows[0]
        var tipo_producto = new TipoProducto(pro.id_tipo_producto, pro.nombre_tipo_producto)
        var estado = new Estado(pro.id_estado, pro.nombre_estado)
        var marca = new Marca(pro.id_marca, pro.nombre_marca)
        var modelo = new Modelo(pro.id_modelo, pro.nombre_modelo, marca)
        var producto = new Producto(null, tipo_producto, null, estado, id_producto, pro.nombre_producto, pro.precio, modelo, pro.disponibilidad,
            pro.descuento
        )

        const query2 = `SELECT dp.stock, s.id_sucursal, s.nombre_sucursal
                        FROM detalle_producto as dp JOIN sucursal as s ON s.id_sucursal = dp.id_sucursal
                        WHERE id_producto = ?`
        const values2 = [id_producto]
        const [rows2, field2] = await connection.query(query2, values2)
        if (rows2.length === 0) throw new SQLError(`Hubo un problema el stock de sucursal del producto asociado al ID: ${id_producto}`, "API_SQL_ERROR")

        rows2.map(d => {
            var sucursal = new Sucursal(d.id_sucursal, d.nombre_sucursal)
            var detalle_producto = new DetalleProducto(sucursal, d.stock)
            detalles.push(detalle_producto.toJson())
        })
        producto.detalle_producto = detalles

        response.status(200).json(producto.toJson())
    } catch (error) {
        console.log(error)
        if (error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)

    } finally {
        if (connection) connection.release()
    }
}

Producto.findOne = async (request, response) => {
    const id_producto = request.params.id
    const { id_sucursal } = request.body
    const detalles = []
    const historial_precio = []
    var connection = null
    try {
        if(!id_sucursal) {
            throw new FormatError("Debe ingresar el id de la sucursal", "API_PRODUCTO_ERROR")
        }
        connection = await getConnection()
        const query = `SELECT m.id_marca, m.nombre_marca,
                            m2.id_modelo, m2.nombre_modelo,
                            p.nombre_producto,
                            p.precio,
                            p.disponibilidad,
                            tp.id_tipo_producto,
                            tp.nombre_tipo_producto,
                            p.descuento,
                            e.id_estado,
                            e.nombre_estado
                        FROM marca as m JOIN modelo as m2 ON m.id_marca = m2.id_marca JOIN producto as p ON p.id_modelo = m2.id_modelo
                        JOIN tipo_producto as tp ON tp.id_tipo_producto = p.id_tipo_producto JOIN estado_producto AS e ON e.id_estado = p.id_estado
                        WHERE p.id_producto = ?`
        const values = [id_producto, id_sucursal]
        const [rows, field] = await connection.query(query, values)
        if (rows.length === 0) throw new SQLError(`No se pudo encontrar un producto con el ID: ${id_producto}`, "API_SQL_ERROR")

        const pro = rows[0]
        var tipo_producto = new TipoProducto(pro.id_tipo_producto, pro.nombre_tipo_producto)
        var estado = new Estado(pro.id_estado, pro.nombre_estado)
        var marca = new Marca(pro.id_marca, pro.nombre_marca)
        var modelo = new Modelo(pro.id_modelo, pro.nombre_modelo, marca)
        var producto = new Producto(null, tipo_producto, null, estado, id_producto, pro.nombre_producto, pro.precio, modelo, pro.disponibilidad,
            pro.descuento
        )
        const query2 = `SELECT dp.stock, s.id_sucursal, s.nombre_sucursal
                        FROM detalle_producto as dp JOIN sucursal as s ON s.id_sucursal = dp.id_sucursal
                        WHERE id_producto = ? AND s.id_sucursal = ?`
        const values2 = [id_producto, id_sucursal]
        const [rows2, field2] = await connection.query(query2, values2)
        if (rows2.length === 0) throw new SQLError(`Hubo un problema al encontrar el stock de sucursal del producto asociado al ID: ${id_producto}`, "API_SQL_ERROR")

        const suc = rows2[0]
        const sucursal = new Sucursal(suc.id_sucursal, suc.nombre_sucursal)
        const detalle_producto = new DetalleProducto(sucursal, suc.stock)
        detalles.push(detalle_producto.toJson())

        const query3 = `SELECT (dp.sub_total/dp.cantidad) precio, p.fecha_hora_pedido 
                        FROM pedido AS p JOIN detalle_pedido AS dp ON p.id_pedido = dp.id_pedido JOIN producto AS pr ON pr.id_producto = dp.id_producto
                        WHERE (dp.sub_total/dp.cantidad) != pr.precio AND pr.id_producto = ?`
        const values3 = [id_producto]
        const [rows3, fields3] = await connection.query(query3, values3)

        for (const historial of rows3){
            var object = {
                "fecha": historial.fecha_hora_pedido,
                "precio": historial.precio
            }
            historial_precio.push(object)
        }
        producto.detalle_producto = detalles
        response.status(200).json({"producto": producto.toJson(), historial_precio})
    } catch (error) {
        console.log(error)
        if (error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else if(error instanceof FormatError) response.status(400).json(error.exceptionJson())
        else response.status(500).json(error)

    } finally {
        if (connection) connection.release()
    }
}



Producto.modify = async (request, response) => {
    const id = request.params.id
    const {descuento, categoria, estado} = request.body;
    let connection = null;
    if(id === undefined || descuento === undefined ||categoria === undefined || estado === undefined){
        throw new FormatError("Peticion Invalida", "API_REQUEST_ERROR")
    }
    try {
        connection = await getConnection()

        var query = "SELECT precio, descuento FROM producto WHERE id_producto = ?"
        var values = [id]
        var [rows, fields] = await connection.query(query, values)
        console.log(rows)
        var precioActual = rows[0].precio
        var descuentoActual = rows[0].descuento

        if(estado === 1 && categoria !== null){
            if(descuentoActual > 0){
                var precioNuevo = (precioActual * 100) / descuentoActual
            }
            query = "UPDATE producto SET precio=?, descuento=0, id_categoria=?, id_estado=1 WHERE id_producto=?"
            values = [precioNuevo !== undefined ? precioNuevo : precioActual, categoria, id]

            var [rows, fields] = await connection.query(query, values)
            if(rows.affectedRows !== 1){
                throw new SQLError("Error al modificar el producto", "API_SQL_ERROR")
            }
        }
        else if(estado === 3 && descuento > 0){
            console.log(categoria, id, descuento, precioActual, estado)
            if(descuentoActual > 0){
                throw new FormatError("El producto ya posee promocion", "API_PRODUCTO_ERROR")
            }
            var precioNuevo = precioActual * (descuento/100)
            console.log(precioActual, descuentoActual)
            query = "UPDATE producto SET precio=?, descuento=?, id_categoria=null, id_estado=3 WHERE id_producto=?"
            values = [precioNuevo, descuento, id]

            var [rows, fields] = await connection.query(query, values)
            if(rows.affectedRows !== 1){
                throw new SQLError("Error al modificar el producto", "API_SQL_ERROR")
            }
        }
        else {
            throw new FormatError("Peticion invalida", "API_REQUEST_ERROR")
        }
        return response.status(200).json({"message": "Producto modificado correctamente"})

    } catch (error) {
        console.log(error)
        if(error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else if(error instanceof FormatError) response.status(401).json(error.exceptionJson())
        else response.status(500).json(error)
    } finally {
        if (connection) connection.release()
    }
};

Producto.changeCurrency = async (request, response) => {
    const  id_producto  = request.params.id
    const today = new Date()

    const year = today.getFullYear();
    const month=String(today.getMonth() + 1).padStart(2, '0')
    const day=String(today.getDate()).padStart(2, '0');
    const dateFormat=`${year}-${month}-${day}`

    var connection = null
    try{
        connection = await getConnection()
        const query = "SELECT precio FROM producto WHERE id_producto = ?"
        const values = [id_producto]

        const [rows] = await connection.query(query, values)

        if(rows.length !== 1){
            throw new SQLError(`Hubo un error al obtener el precio del producto asociado al ID: ${id_producto}`, "API_SQL_ERROR")
        }
        const producto = rows[0]
        var url = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=${process.env.USER_BC_CHILE}&pass=${process.env.PASSWORD_BC_CHILE}&firstdate=${dateFormat}&timeseries=F073.TCO.PRE.Z.D&function=GetSeries`
        
        const response_usd = await axios.get(url)
        var newPrice = producto.precio / response_usd.data.Series.Obs[0].value
        return response.status(200).json({"precio_usd": newPrice})
    } catch (error){
        console.log(error)
        if(error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)
    } finally {
        if (connection) connection.release()
    }
}

Producto.question = async (request, response) => {
    // TODO: Conseguir rut desde jwt
    const rut_jwt = request.user.user.rut
    if (request.user.admin === true) {
        return response.status(403).json({ message: 'Cuenta admin no esta autorizada para hacer preguntas' })
    }
    const { id_categoria, pregunta } = request.body;
    let connection = null;

    try {
        connection = await getConnection();

        //Conseguir a los empleados con la especialidad relacionada a la categoria del producto
        const queryEmpleado = 'SELECT rut FROM usuario WHERE id_especialidad = ?';
        const valuesEmpleado = [id_categoria]
        const [rows, _fields] = await connection.query(queryEmpleado, valuesEmpleado);
        if (rows.length === 0) {
            return response.status(404).json({ message: 'No se encontraron usuarios con esa especialidad.' });
        }

        const randomNumber = Math.floor(Math.random() * rows.length);
        const empleado = rows[randomNumber].rut

        // Insertar la pregunta en la base de datos
        const queryPregunta = 'INSERT INTO pregunta (rut_cliente, rut_empleado, id_categoria, pregunta, fecha) VALUES (?, ?, ?, ?, NOW())';
        const valuesPregunta = [rut_jwt, empleado, id_categoria, pregunta];
        const [row, _field] = await connection.query(queryPregunta, valuesPregunta);

        // Verificar si la pregunta se insertó correctamente
        if (row.affectedRows === 1) {
            response.status(200).json({ message: 'Pregunta realizada con éxito.' });
        } else {
            response.status(500).json({ message: 'Error al realizar la pregunta.' });
        }
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
};

Producto.answer = async (request, response) => {
    const { id_pregunta, respuesta } = request.body;
    const rut_jwt = request.user.user.rut
    let connection = null;

    try {
        connection = await getConnection();

        const queryUpdate = "UPDATE pregunta SET respuesta = ? WHERE id_pregunta = ? AND rut_empleado = ?"
        const valueUpdate = [respuesta, id_pregunta, rut_jwt]
        const [row, _field] = await connection.query(queryUpdate, valueUpdate)

        if (row.affectedRows === 1) {
            response.status(200).json({ message: 'Respuesta registrada' })
        } else {
            response.status(404).json({ message: 'No se encontro la pregunta o no esta autorizado para responder' })
        }
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
};

Producto.listQuestions = async (request, response) => {
    let connection = null;

    try {
        connection = await getConnection();

        const queryAll = "SELECT * FROM pregunta"
        const [rows, _fields] = await connection.query(queryAll)

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

Producto.Especial = async(request, response)=>{
    console.log("ENTRE x1")
    const { id_estado } = request.body
    console.log("Entre al metodo")
    const productos = []
    var connection = null
    try {
        connection = await getConnection()
        var query = `SELECT tp.id_tipo_producto,
                        p.id_producto,
                        p.nombre_producto,
                        p.precio,
                        p.disponibilidad,
                        p.descuento,
                        p.id_modelo,
                        e.id_estado,
                        e.nombre_estado,
                        m.nombre_modelo,
                        m2.nombre_marca
                    FROM tipo_producto as tp
                    JOIN producto as p ON (p.id_tipo_producto = tp.id_tipo_producto)
                    JOIN modelo as m ON (p.id_modelo = m.id_modelo)
                    JOIN marca as m2 ON (m2.id_marca = m.id_marca) JOIN estado_producto AS e ON e.id_estado = p.id_estado
                    WHERE e.id_estado = ? AND p.disponibilidad = true
                    ORDER BY p.id_tipo_producto`
        var values = [id_estado]
        var [rows, field] = await connection.query(query, values)
        if(rows.length === 0){
            throw new SQLError(`No hay productos asociados a ${estado === 2 ? "nuevo lanzamiento" : "promocion"}`, "API_SQL_ERROR")
        }
        for(const pro of rows){
            console.log("Entre al for")
            var categoria = pro.nombre_categoria ? new Categoria(pro.id_categoria, pro.nombre_categoria) : null
            var estado = new Estado(id_estado, pro.nombre_estado)
            var marca = new Marca(pro.id_marca, pro.nombre_marca)
            var modelo = new Modelo(pro.id_modelo, pro.nombre_modelo, marca)
            var tipo_producto = new TipoProducto(pro.id_tipo_producto, pro.nombre_tipo_producto)

            var producto = new Producto(null, tipo_producto, categoria, estado, pro.id_producto, pro.nombre_producto, pro.precio, modelo, pro.disponibilidad,
                pro.descuento
            )
            productos.push(producto.toJson())
            console.log("Pase el for")
        }
        return response.status(200).json(productos)
    } catch (error) {
        console.log(error)
        if (error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)
    } finally {
        if(connection) connection.release()
    }
}


module.exports = Producto

