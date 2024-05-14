const {FormatError} = require("../utils/Exceptions.js")

class Producto {
    constructor(detalle_producto=null, tipo_producto=null, id_producto=0, nombre_producto, codigo='', precio=0,modelo='',marca='',disponibilidad=false, descuento=0){
        this.id_producto=id_producto;
        this.setNombreProducto(nombre_producto)
        this.codigo=codigo
        this.setPrecio(precio)
        this.modelo=modelo;
        this.marca=marca;
        this.tipo_producto=tipo_producto;
        this.detalle_producto=detalle_producto;
        this.disponibilidad=disponibilidad;
        this.setDescuento(descuento)
    }

    setNombreProducto(nombre_producto){
        var regex = /^[a-zA-Z]+$/;
        if(nombre_producto === "" || !regex.test(nombre_producto) ){
            throw new FormatError("Nombre producto invalido", "API_FORMAT_ERROR")
        }

        this.nombre_producto=nombre_producto
    }

    setPrecio(precio){

        if(precio < 0 || precio > 999999999 || typeof precio !== "number"){
            throw new FormatError("Precio producto invalido", "API_FORMAT_ERROR")
        }

        this.precio=precio;
    }

    setDescuento(descuento){
        if(descuento < 0 && descuento > 99){
            throw new FormatError("Descuento ingresado erroneo", "API_FORMAT_ERROR")
        }
        else if(this.tipo_producto.id_tipo_producto !== 1){
            throw new FormatError("No puede setear descuento a un producto que no este en promocion", "SQL_FORMAT_ERROR")
        }
        else this.descuento = descuento
    }


    getProducto(){
        const to_Json={
            "id_producto":this.id_producto,
            "nombre_producto":this.nombre_producto,
            "codigo":this.codigo,
            "precio":this.precio,
            "modelo":this.modelo,
            "marca":this.marca,
            "disponibilidad":this.disponibilidad ? "Disponible" : "No disponible",
            "detalle_sucursal":this.detalle_producto,
            "tipo_producto":this.tipo_producto.getTipo(),
            "descuento":this.descuento === 0 ? "N/A" : `${this.descuento}%`
        }
        return to_Json
    }
}

module.exports = Producto;