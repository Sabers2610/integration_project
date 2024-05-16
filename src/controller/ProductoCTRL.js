const Producto = require("../models/Producto.js")
const TipoProducto = require("../models/TipoProducto.js")
const Sucursal = require("../models/Sucursal.js")
const DetalleProducto = require("../models/DetalleProducto.js")
const Categoria = require("../models/Categoria.js")
const Marca = require("../models/Marca.js")
const Modelo = require("../models/Modelo.js")

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
                        p.codigo,
                        p.precio,
                        p.disponibilidad,
                        p.descuento,
                        p.id_modelo,
                        m.nombre_modelo,
                        m2.nombre_marca
                    FROM tipo_producto as tp JOIN categoria_producto as c ON (c.id_categoria = tp.id_categoria) 
                    JOIN producto as p ON (p.id_tipo_producto = tp.id_tipo_producto) JOIN modelo as m ON (p.id_modelo = m.id_modelo)
                    JOIN marca as m2 ON (m2.id_marca = m.id_marca)
                    WHERE c.id_categoria = ?`
        const values = [id_categoria]
        const [rows, fields] = await connection.query(sql, values)
        if(rows.length === 0) {
            throw new SQLError("Hubo un error al ejecutar la peticion", "API_SQL_ERROR")
        }
        rows.map(f => {
            var marca = new Marca(f.id_marca, f.nombre_marca)
            var modelo = new Modelo(f.id_modelo, f.nombre_modelo, marca)
            var tipo_producto = new TipoProducto(f.id_tipo_producto, f.nombre_tipo_producto, null)
            var producto = new Producto(null, tipo_producto, f.id_producto, f.nombre_producto, f.codigo, f.precio, modelo, f.disponibilidad,
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
                            p.codigo,
                            p.precio,
                            p.disponibilidad,
                            tp.id_tipo_producto,
                            tp.nombre_tipo_producto,
                            p.descuento
                        FROM marca as m JOIN modelo as m2 ON m.id_marca = m2.id_marca JOIN producto as p ON p.id_modelo = m2.id_modelo
                        JOIN tipo_producto as tp ON tp.id_tipo_producto = p.id_tipo_producto
                        WHERE m.id_marca = ?`
        const values = [id_marca]
        const [rows, fields] = await connection.query(query, values)
        
        if(rows.length === 0) throw new SQLError("Hubo un error al buscar los productos de la marca", "API_SQL_ERROR")
        
        rows.map(f => {
            var modelo = new Modelo(f.id_modelo, f.nombre_modelo, null)
            var tipo_producto = new TipoProducto(f.id_tipo_producto, f.nombre_tipo_producto)
            var producto = new Producto(null, tipo_producto, f.id_producto, f.nombre_producto, f.codigo, f.precio,
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
                            p.codigo,
                            p.precio,
                            p.disponibilidad,
                            tp.id_tipo_producto,
                            tp.nombre_tipo_producto,
                            p.descuento
                        FROM marca as m JOIN modelo as m2 ON m.id_marca = m2.id_marca JOIN producto as p ON p.id_modelo = m2.id_modelo
                        JOIN tipo_producto as tp ON tp.id_tipo_producto = p.id_tipo_producto
                        WHERE p.id_producto = ?`
        const values = [id_producto]
        const [rows, field] = await connection.query(query, values)
        if(rows.length === 0) throw new SQLError(`No se pudo encontrar un producto con el ID: ${id_producto}`, "API_SQL_ERROR")
        
        const pro = rows[0]
        var tipo_producto = new TipoProducto(pro.id_tipo_producto, pro.nombre_tipo_producto, null)
        var marca = new Marca(pro.id_marca, pro.nombre_marca)
        var modelo = new Modelo(pro.id_modelo, pro.nombre_modelo, marca)
        var producto = new Producto(null, tipo_producto, id_producto, pro.nombre_producto, pro.codigo, pro.precio, modelo, pro.disponibilidad,
            pro.descuento
        )

        const query2 = `SELECT dp.stock, s.id_sucursal, s.nombre_sucursal
                        FROM detalle_producto as dp JOIN sucursal as s ON s.id_sucursal = dp.id_sucursal
                        WHERE id_producto = ?`
        const values2 = [id_producto]
        const [rows2, field2] = await connection.query(query2, values2)
        if(rows.length === 0) throw new SQLError(`Hubo un problema el stock de sucursal del producto asociado al ID: ${id_producto}`, "API_SQL_ERROR")
        
        rows.map(d => {
            var sucursal = new Sucursal(d.id_sucursal, d.nombre_sucursal)
            var detalle_producto = new DetalleProducto(sucursal, d.stock)
            detalles.push(detalle_producto.toJson())
        })
        producto.detalle_producto = detalles

        response.status(200).json(producto.toJson())
    } catch (error){

    } finally {
        if(connection) connection.release()
    }
}

Producto.findOne = async (request, response) => {
    const {id_producto, id_sucursal} = request.body
    const detalles = []
    var connection = null
    try {
        connection = await getConnection()
        const query = ` SELECT m.id_marca, m.nombre_marca
                            m2.id_modelo, m2.nombre_modelo,
                            p.nombre_producto,
                            p.codigo,
                            p.precio,
                            p.disponibilidad,
                            tp.id_tipo_producto,
                            tp.nombre_tipo_producto,
                            p.descuento
                        FROM marca as m JOIN modelo as m2 ON m.id_marca = m2.id_marca JOIN producto as p ON p.id_modelo = m2.id_modelo
                        JOIN tipo_producto as tp ON tp.id_tipo_producto = p.id_tipo_producto
                        WHERE p.id_producto = ?`
        const values = [id_producto]
        const [rows, field] = await connection.query(query, values)
        if(rows.length === 0) throw new SQLError(`No se pudo encontrar un producto con el ID: ${id_producto}`, "API_SQL_ERROR")
        
        const pro = rows[0]
        var tipo_producto = new TipoProducto(pro.id_tipo_producto, pro.nombre_tipo_producto, null)
        var marca = new Marca(pro.id_marca, pro.nombre_marca)
        var modelo = new Modelo(pro.id_modelo, pro.nombre_modelo, marca)
        var producto = new Producto(null, tipo_producto, id_producto, pro.nombre_producto, pro.codigo, pro.precio, modelo, pro.disponibilidad,
            pro.descuento
        )

        const query2 = `SELECT dp.stock, s.id_sucursal, s.nombre_sucursal
                        FROM detalle_producto as dp JOIN sucursal as s ON s.id_sucursal = dp.id_sucursal
                        WHERE id_producto = ? AND s.id_sucursal = ?`
        const values2 = [id_producto, id_sucursal]
        const [rows2, field2] = await connection.query(query2, values2)
        if(rows.length === 0) throw new SQLError(`Hubo un problema el stock de sucursal del producto asociado al ID: ${id_producto}`, "API_SQL_ERROR")
        
        const suc = rows2[0]
        const sucursal = new Sucursal(suc.id_sucursal, suc.nombre_sucursal)
        const detalle_producto = new DetalleProducto(sucursal, suc.stock)
        detalles.push(detalle_producto.toJson())
        producto.detalle_producto = detalles
        response.status(200).json(producto.toJson())
    } catch (error){

    } finally {
        if(connection) connection.release()
    }
}


module.exports = Producto
