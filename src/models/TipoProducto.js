class TipoProducto{
    constructor(id_tipoProducto=0, nombre_tipoProducto="", habilitada=true){
        this.id_tipoProducto = id_tipoProducto,
        this.nombre_tipoProducto = nombre_tipoProducto
        this.habilitada = habilitada
    }
    toJson(){
        const json = {
            "id_tipoProducto": this.id_tipoProducto,
            "nombre_tipoProducto": this.nombre_tipoProducto,
            "habilitada": this.habilitada ? "Habilitada" : "Deshabilitada",
        }
        return json
    }
}

module.exports = TipoProducto
