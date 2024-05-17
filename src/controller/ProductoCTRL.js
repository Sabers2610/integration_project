const Producto = require("../models/Producto.js")
const TipoProducto = require("../models/TipoProducto.js")
const Sucursal = require("../models/Sucursal.js")
const DetalleProducto = require("../models/DetalleProducto.js")
const Categoria = require("../models/Categoria.js")
const Marca = require("../models/Marca.js")
const Modelo = require("../models/Modelo.js")
const Estado = require("../models/Estado.js")

const {getConnection} = require("../database.js")
const {SQLError,FormatError} = require("../utils/exception.js")

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
                    WHERE c.id_categoria = ? AND p.disponibilidad = true`
        const values = [id_categoria]
        const [rows, fields] = await connection.query(sql, values)
        if(rows.length === 0) {
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
        if(error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)

    } finally {
        if(connection) connection.release()
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
                        WHERE m.id_marca = ? AND p.disponibilidad = true`
        const values = [id_marca]
        const [rows, fields] = await connection.query(query, values)
        
        if(rows.length === 0) throw new SQLError("Hubo un error al buscar los productos de la marca", "API_SQL_ERROR")
        
        rows.map(f => {
            var modelo = new Modelo(f.id_modelo, f.nombre_modelo, null)
            var tipo_producto = new TipoProducto(f.id_tipo_producto, f.nombre_tipo_producto)
            var estado = new Estado(f.id_estado, f.nombre_estado)
            var producto = new Producto(null, tipo_producto, null, estado, f.id_producto, f.nombre_producto, f.precio,
                modelo,f.disponibilidad, f.descuento
            )
            console.log(producto.tipo_producto.toJson())
            console.log("ANTES DEL ARRAY")
            productos.push(producto.toJson())
        })
        response.status(200).json(productos)
    } catch (error) {
        console.log(error)
        if(error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)

    } finally {
        if(connection) connection.release()
    }
}

Producto.findStock = async (request, response) => {
    const id_producto = request.params.id
    const detalles = []
    var connection = null
    try {
        connection = await getConnection()
        const query = ` SELECT m.id_marca, m.nombre_marca
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
        if(rows.length === 0) throw new SQLError(`No se pudo encontrar un producto con el ID: ${id_producto}`, "API_SQL_ERROR")
        
        const pro = rows[0]
        var tipo_producto = new TipoProducto(pro.id_tipo_producto, pro.nombre_tipo_producto)
        var estado = new Estado(pro.id_estado, pro.nombre_estado)
        var marca = new Marca(pro.id_marca, pro.nombre_marca)
        var modelo = new Modelo(pro.id_modelo, pro.nombre_modelo, marca)
        var producto = new Producto(null, tipo_producto, null, estado,  id_producto, pro.nombre_producto, pro.precio, modelo, pro.disponibilidad,
            pro.descuento
        )

        const query2 = `SELECT dp.stock, s.id_sucursal, s.nombre_sucursal
                        FROM detalle_producto as dp JOIN sucursal as s ON s.id_sucursal = dp.id_sucursal
                        WHERE id_producto = ?`
        const values2 = [id_producto]
        const [rows2, field2] = await connection.query(query2, values2)
        if(rows.length === 0) throw new SQLError(`Hubo un problema el stock de sucursal del producto asociado al ID: ${id_producto}`, "API_SQL_ERROR")
        
        rows2.map(d => {
            var sucursal = new Sucursal(d.id_sucursal, d.nombre_sucursal)
            var detalle_producto = new DetalleProducto(sucursal, d.stock)
            detalles.push(detalle_producto.toJson())
        })
        producto.detalle_producto = detalles

        response.status(200).json(producto.toJson())
    } catch (error){
        console.log(error)
        if(error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)

    } finally {
        if(connection) connection.release()
    }
}

Producto.findOne = async (request, response) => {
    const id_producto = request.params.id
    const {id_sucursal} = request.body
    const detalles = []
    var connection = null
    try {
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
        if(rows.length === 0) throw new SQLError(`No se pudo encontrar un producto con el ID: ${id_producto}`, "API_SQL_ERROR")
        
        const pro = rows[0]
        var tipo_producto = new TipoProducto(pro.id_tipo_producto, pro.nombre_tipo_producto)
        var estado = new Estado(pro.id_estado, pro.nombre_estado)
        var marca = new Marca(pro.id_marca, pro.nombre_marca)
        var modelo = new Modelo(pro.id_modelo, pro.nombre_modelo, marca)
        var producto = new Producto(null, tipo_producto, null,  estado, id_producto, pro.nombre_producto, pro.precio, modelo, pro.disponibilidad,
            pro.descuento
        )

        const query2 = `SELECT dp.stock, s.id_sucursal, s.nombre_sucursal
                        FROM detalle_producto as dp JOIN sucursal as s ON s.id_sucursal = dp.id_sucursal
                        WHERE id_producto = ? AND s.id_sucursal = ?`
        const values2 = [id_producto, id_sucursal]
        const [rows2, field2] = await connection.query(query2, values2)
        if(rows2.length === 0) throw new SQLError(`Hubo un problema el stock de sucursal del producto asociado al ID: ${id_producto}`, "API_SQL_ERROR")
        
        const suc = rows2[0]
        const sucursal = new Sucursal(suc.id_sucursal, suc.nombre_sucursal)
        const detalle_producto = new DetalleProducto(sucursal, suc.stock)
        detalles.push(detalle_producto.toJson())
        producto.detalle_producto = detalles
        response.status(200).json(producto.toJson())
    } catch (error){
        console.log(error)
        if(error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)

    } finally {
        if(connection) connection.release()
    }
}

Producto.modify = async (request, response) => {
    const datos = request.body;
    const id = request.params.id;
    let connection = null;
    try {
        connection = await getConnection();

        if(datos.estado !== 3){
            var query = `SELECT descuento, precio FROM producto WHERE id_producto = ?`
            var values = [id]
            var [rows, field] = await connection.query(query, values)
            if(rows.length === 0) throw new SQLError(`No se pudo encontrar un producto con el ID: ${id}`, "API_SQL_ERROR")

            if(rows[0].descuento > 0){
                var precio_normal = ((rows.precio * 100)/rows.descuento)
                query = `UPDATE producto SET
                            id_categoria = ? , id_estado = 1 , precio = ? , decuento = 0
                            WHERE id_producto=?`
                values = [datos.id_categoria, precio_normal, id]
                [rows, field] = await connection.query(query, values)
                if(rows.affectedRows === 0){
                    throw new SQLError(`No se pudo modificar el producto`, "API_SQL_ERROR")
                }
            }
        } else if(datos.estado === 3){
            const producto = new Producto(descuento=datos.descuento)
            query = `UPDATE producto SET
                    id_categoria = null , id_estado = 3 , precio = precio * ? , decuento = ?
                    WHERE id_producto=?`
            values = [datos.descuento/100 , datos.descuento, id]
            [rows, field] = await connection.query(query, values)
            if(rows.length === 0) throw new SQLError(`No se pudo encontrar un producto con el ID: ${id}`, "API_SQL_ERROR")

        } else{
            return response.status(401).json({'message': 'Estado invalido'})
        }
        return response.status(200).json({'message': 'Producto cambiado correctamente'})

    } catch (error) {
        console.log(error)
        if(error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else response.status(500).json(error)
    } finally {
        if(connection) connection.release()
    }
};


module.exports = Producto

