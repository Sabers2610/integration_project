const Producto = require("../models/Producto.js")
const TipoProducto = require("../models/TipoProducto.js")
const Sucursal = require("../models/Sucursal.js")
const DetalleProducto = require("../models/DetalleProducto.js")
const Categoria = require("../models/Categoria.js")

const {getConnection} = require("../database.js")
const {SQLError,FormatError} = require("../utils/exception.js")


Producto.addPromo = async (request,response)=>{
    const {nombre_producto,precio,modelo,marca,id_tipo_producto, id_sucursal, stock} = request.body
    var connection = null
    try{
        const categoria = new Categoria(1, "PROMOCIONES")
        const tipoproducto = new TipoProducto(id_tipo_producto, "", categoria)
        const sucursal = new Sucursal(id_sucursal)
        const detalleProducto = new DetalleProducto(sucursal, stock)
        const producto = new Producto(detalleProducto,tipoproducto,id_producto,nombre_producto,precio,modelo,marca)
        
        connection = await getConnection()
        const sql = `INSERT INTO producto (nombre_producto, precio, modelo, marca, disponibilidad, id_tipo_producto) VALUES(?,?,?,?,?,?)`
        const values =[
            producto.nombre_producto,
            producto.precio,
            producto.modelo,
            producto.marca,
            producto.disponibilidad,
            producto.tipo_producto.id_tipo_producto,
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
