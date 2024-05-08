class DetalleProducto{
    constructor(sucursal,stock=0){
        this.stock = stock;
        this.sucursal = sucursal;
    }
    
    getDetalleProducto(){

        const to_Json={
            "stock":this.stock,
            "sucursal":this.sucursal.getSucursal(),
        }
        return to_Json;
    }
}

module.exports = DetalleProducto;