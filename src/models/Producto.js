const { FormatError } = require("../utils/exception.js")

class Producto {
    constructor(detalle_producto=null, tipo_producto=null, categoria=null, estado, id_producto=0, nombre_producto, precio=0,modelo=null,disponibilidad=false, descuento=0){
        this.id_producto=id_producto;
        this.setNombreProducto(nombre_producto)
        this.setPrecio(precio)
        this.modelo=modelo;
        this.tipo_producto=tipo_producto;
        this.detalle_producto=detalle_producto;
        this.disponibilidad=disponibilidad;
        this.categoria=categoria
        this.estado = estado
        this.setDescuento(descuento)
    }

    setNombreProducto(nombre_producto) {
        console.log(nombre_producto)
        var regex = /^[a-zA-Z\s]+$/;
        console.log(regex.test(nombre_producto))
        if (nombre_producto === "" || !regex.test(nombre_producto)) {
            throw new FormatError("Nombre producto invalido", "API_FORMAT_ERROR")
        }

        this.nombre_producto = nombre_producto
    }

    setPrecio(precio) {

        if (precio < 0 || precio > 999999999 || typeof precio !== "number") {
            throw new FormatError("Precio producto invalido", "API_FORMAT_ERROR")
        }

        this.precio = precio;
    }

    setDescuento(descuento){
        if(descuento < 0 && descuento > 99){
            throw new FormatError("Descuento ingresado erroneo", "API_FORMAT_ERROR")
        }
        else if(this.estado.id_estado !== 3 && descuento > 0){
            throw new FormatError("No puede setear descuento a un producto que no este en promocion", "SQL_FORMAT_ERROR")
        }
        else this.descuento = descuento
    }

    toJson(){
        const to_Json={
            "id_producto": `FER-${this.id_producto}`,
            "nombre_producto":`${this.nombre_producto} ${this.modelo.nombre_modelo}`,
            "marca": this.modelo.marca !== null ? this.modelo.marca.nombre_marca : "N/A",
            "modelo": this.modelo.nombre_modelo,
            "estado": this.estado,
            "categoria": this.categoria !== null? this.categoria.nombre_categoria : "N/A",
            "precio": this.precio,
            "disponibilidad": this.disponibilidad === 1 ? "Disponible" : "No disponible",
            "tipo_producto": this.tipo_producto.nombre_tipo_producto,
            "descuento": this.descuento === 0 ? "N/A" : this.descuento,
            "stock_sucursales": this.detalle_producto !== null ? this.detalle_producto : "N/A"
        }
        return to_Json
    }
}

module.exports = Producto ;
