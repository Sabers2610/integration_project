const Producto = require("../models/Producto.js")
const TipoProducto = require("../models/TipoProducto.js")
const Sucursal = require("../models/Sucursal.js")
const DetalleProducto = require("../models/DetalleProducto.js")

const {getConnection} = require("../database.js")
const {SQLError,FormatError} = require("../utils/exception.js")


Producto.addProducto = async (request,response)=>{
    const {id_producto,nombre_producto,precio,modelo,marca,disponibilidad,id_tipo_producto,} = request.body
    var connection = null
    try{
        const tipoproducto = TipoProducto(id_tipo_producto)
        const sucursal = new Sucursal(id_sucursal)
        const detalleProducto = new DetalleProducto(stock,sucursal)
        const producto = new Producto(detalleProducto,tipoproducto,id_producto,nombre_producto,precio,modelo,marca,disponibilidad)
        
        connection = await getConnection()
        const sql = `INSERT INTO producto VALUES(?,?,?,?,?,?,?)`
        const values =[
            producto.id_producto,
            producto.nombre_producto,
            producto.precio,
            producto.modelo,
            producto.marca,
            producto.disponibilidad ? "DISPONIBLE" : "NO DISPONIBLE",
            producto.tipoproducto.id_tipo_producto,
        ]

        const [rows, fields] = await connection.query(sql, values)

        if(rows.affectedRows === 0){
            throw new SQLError("No se pudo insertra el producto", "API_SQL_ERROR")
        }

        const sql2 = `INSERT INTO detalle_producto VALUES (?,?,?)`
        const values2 = [
            detalleProducto.stock,
            precio.id_producto,
            sucursal.id_sucursal
        ]

        const [rows2, fields2] = await connection.query(sql2, values2)

        if (rows2.affectedRows === 0){
            throw new SQLError("No se pudo ingresar el detalle producto", "API_SQL_ERROR")
        }

        return response.status(201).json(producto.to_Json())

    }
    catch (error){
        if(error instanceof SQLError){
            return response.status(500).json(error.exceptionJson())
        }
        if(error instanceof FormatError){
            return response.status(400).jsonn(error.FormatError())
        }
    }
}
