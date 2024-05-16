const { FormatError } = require("../utils/exception");

class DetalleProducto{
    constructor(sucursal,stock=0){
        this.setStock(stock);
        this.sucursal = sucursal;
    }
    
    setStock(stock){
        if(stock < 1 || stock > 999999999) {
            throw new FormatError("Stock de producto no puede ser negativo o mayor a 999999999", "API_FORMAT_ERROR")
        }
        this.stock = stock
    }
    toJson(){

        const to_Json={
            "stock":this.stock,
            "id_sucursal":this.sucursal.id_sucursal,
            "nombre_sucursal": this.sucursal.nombre_sucursal
        }
        return to_Json;
    }
}

module.exports = DetalleProducto;