const {FormatError} = require("../utils/Exceptions.js")

class Producto {
    constructor(detalle_producto, tipo_producto, id_producto=0, nombre_producto, precio=0,modelo='',marca='',disponibilidad=false){
        this.id_producto=id_producto;
        this.setNombreProducto(nombre_producto)
        this.setPrecio(precio)
        this.modelo=modelo;
        this.marca=marca;
        this.tipo_producto=tipo_producto;
        this.detalle_producto=detalle_producto;

        this.disponibilidad=disponibilidad;
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


    getProducto(){
        const to_Json={
            "id_producto":this.id_producto,
            "nombre_producto":this.nombre_producto,
            "precio":this.precio,
            "modelo":this.modelo,
            "marca":this.marca,
            "disponibilidad":this.disponibilidad ? "Disponible" : "No disponible",
            "detalle_sucursal":this.detalle_producto.getDetalleProducto(),
            "tipo_producto":this.tipo_producto.getTipo()
        }
        return to_Json
    }
}

module.exports = Producto;