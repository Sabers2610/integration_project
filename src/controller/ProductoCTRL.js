const Producto = require("../models/Producto.js")
const TipoProducto = require("../models/TipoProducto.js")
const Sucursal = require("../models/Sucursal.js")
const DetalleProducto = require("../models/DetalleProducto.js")
const Categoria = require("../models/Categoria.js")

const {getConnection} = require("../database.js")
const {SQLError,FormatError} = require("../utils/exception.js")


Producto.addPromo = async (request,response)=>{
    const {nombre_producto,precio,modelo,marca,id_tipo_producto, id_sucursal, stock, descuento} = request.body
    var connection = null
    try{
        const categoria = new Categoria(1, "PROMOCIONES")
        const tipoproducto = new TipoProducto(id_tipo_producto, "", categoria)
        const sucursal = new Sucursal(id_sucursal)
        const detalleProducto = new DetalleProducto(sucursal, stock)
        const producto = new Producto(detalleProducto,tipoproducto,nombre_producto,codigo,precio,modelo,marca, descuento)
        
        connection = await getConnection()
        const sql = `INSERT INTO producto (nombre_producto, codigo, precio, modelo, marca, disponibilidad, id_tipo_producto, descuento) VALUES(?,?,?,?,?,?,?,?)`
        const values =[
            producto.nombre_producto,
            producto.codigo,
            producto.precio,
            producto.modelo,
            producto.marca,
            producto.disponibilidad,
            producto.tipo_producto.id_tipo_producto,
            producto.descuento
        ]

        const [rows, fields] = await connection.query(sql, values)

        if(rows.affectedRows === 0){
            throw new SQLError("No se pudo insertra el producto", "API_SQL_ERROR")
        }

        const sql2 = `INSERT INTO detalle_producto VALUES (?,?,?)`
        const values2 = [
            producto.detalle_producto.stock,
            producto.id_producto,
            producto.detalle_producto.id_sucursal
        ]

        const [rows2, fields2] = await connection.query(sql2, values2)

        if (rows2.affectedRows === 0){
            throw new SQLError("No se pudo ingresar el detalle producto", "API_SQL_ERROR")
        }

        return response.status(201).json({"message": "Producto agregado correctamente"})

    }
    catch (error){
        if(error instanceof SQLError){
            return response.status(500).json(error.exceptionJson())
        }
        else if(error instanceof FormatError){
            return response.status(400).jsonn(error.FormatError())
        }
        else {
            return response.status(500).json(error)
        }
    }
    finally{
        if(connection){
            connection.release()
        }
    }
}

Producto.getAll = async (request,response)=>{
    var connection = null
    const productos = []
    try {
        connection = getConnection()
        const sql = `SELECT p.id_producto, 
                        p.nombre_producto, 
                        p.codigo, p.precio,
                        p.modelo, p.marca
                        tp.id_tipo_producto
                        tp.nombre_tipo_producto,
                        p.descuento
                    FROM producto as p JOIN tipo_producto as tp ON p.id_tipo_producto = tp.id_tipo_producto
                    WHERE p.disponibilidad = true`
        const [rows, fields] = (await connection).query(sql)

        if(rows.lenght === 0) throw new SQLError("Hubo un error al consultar los productos", "API_SQL_ERROR")
        
        rows.map(p => {
            var tipoProducto = new TipoProducto(p.id_tipo_producto, p.nombre_tipo_producto)
            var producto = new Producto(null, tipoProducto, p.id_producto, p.nombre_producto, p.codigo, p.precio,
                p.modelo,p.marca,p.disponibilidad,p.descuento
            )
            productos.push(producto.getProducto())
        })
        response.status(200).json(productos)
    } catch (error) {
        if(error instanceof SQLError) response.status(500).json(error.exceptionJson())
        else if(error instanceof FormatError) response.status(401).json(error.exceptionJson())
        else response.status(500).json(error)
    } finally {
        if(connection) (await connection).release()
    }
}

Producto.getSpecific = async (request,response)=>{
    const id_producto = request.params.id
    const detalles_producto = []
    var connection = null
    try{
        connection = await getConnection()
        
        const sql = `SELECT p.id_producto, 
                        p.nombre_producto, 
                        p.codigo, p.precio,
                        p.modelo, p.marca
                        tp.id_tipo_producto
                        tp.nombre_tipo_producto,
                        p.descuento
                    FROM producto as p JOIN tipo_producto as tp ON p.id_tipo_producto = tp.id_tipo_producto
                    WHERE p.disponibilidad = true`

        const [rows, fields] = await connection.query(sql)

        if (rows.lenght !== 1){
            throw new SQLError(`hubo un error al encontrar el producto con ID:${id_producto} `, "API_SQL_ERROR")
        }

        var pro = rows[0]
        const tipoProducto = new TipoProducto(pro.id_tipo_producto, pro.nombre_tipo_producto, null)
        const producto = new Producto(null, tipoProducto,pro.id_producto, pro.nombre_producto, pro.codigo,
            pro.precio,pro.modelo,pro.marcar,pro.disponibilidad,pro.descuento
        )

        const sql2 = `SELECT dp.stock, 
                            s.id_sucursal, 
                            s.nombre_sucursal, 
                            s.direccion_sucursal 
                    FROM detalle_producto as dp JOIN sucursal as s ON s.id_sucursal = dp.id_sucursal
                    WHERE id_producto = ?`
        const values = [producto.id_producto]
        const [rows2, fields2] = await connection.query(sql2, values)

        if(rows2.length === 0) throw new SQLError(`Hubo un error al buscar el detalle del producto con ID: ${producto.id_producto}`, "API_SQL_ERROR")
        rows2.map(dp =>{
            var sucursal = new Sucursal(dp.id_sucursal, dp.nombre_sucursal, dp.direccion_sucursal)
            var detalleProducto = new DetalleProducto(sucursal,dp.stock)
            detalles_producto.push(detalleProducto.getDetalleProducto())
        })
        producto.detalle_producto = detalles_producto

        return response.status(201).json(Producto.getProducto())
    }
    catch(error){
        if(error instanceof SQLError){
            return response.status(500).json(error.exceptionJson())
        }
        else {
            return response.status(500).json(error)
        }
    }
    finally{
        if(connection){
            connection.release()
        }
    }
}