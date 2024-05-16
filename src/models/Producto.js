const { FormatError } = require("../utils/exception.js")

class Producto {
    constructor(detalle_producto=null, tipo_producto=null, id_producto=0, nombre_producto, codigo='', precio=0,modelo=null,disponibilidad=false, descuento=0){
        this.id_producto=id_producto;
        this.setNombreProducto(nombre_producto)
        this.codigo=codigo
        this.setPrecio(precio)
        this.modelo=modelo;
        this.tipo_producto=tipo_producto;
        this.detalle_producto=detalle_producto;
        this.disponibilidad=disponibilidad;
        this.setDescuento(descuento)
    }

    setNombreProducto(nombre_producto) {
        var regex = /^[a-zA-Z]+$/;
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
        else if(this.tipo_producto.id_tipoProducto !== 1){
            throw new FormatError("No puede setear descuento a un producto que no este en promocion", "SQL_FORMAT_ERROR")
        }
        else this.descuento = descuento
    }

    toJson(){
        const to_Json={
            "id_producto": `FER-${this.id_producto}`,
            "nombre_producto":this.nombre_producto,
            "marca": this.modelo.marca !== null ? this.modelo.marca.nombre_marca : "N/A",
            "codigo_modelo": `${this.modelo.nombre_modelo}-${this.codigo}`,
            "precio": this.precio,
            "disponibilidad": this.disponibilidad,
            "categoria": this.tipo_producto.categoria !== null ? this.tipo_producto.categoria.nombre_categoria : "N/A",
            "tipo_producto": this.tipo_producto.nombre_tipo_producto,
            "descuento": this.descuento === 0 ? "N/A" : this.descuento
        }
        return to_Json
    }
}

module.exports = Producto ;
