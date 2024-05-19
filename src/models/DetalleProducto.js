const { FormatError } = require("../utils/exception");

class DetalleProducto{
    constructor(sucursal,stock=0){
        this.stock = stock
        this.sucursal = sucursal;
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