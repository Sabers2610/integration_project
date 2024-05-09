class TipoProducto{
    constructor(id_tipoProducto=0, nombre_tipoProducto="", categoria=null, habilitada=true){
        this.id_tipoProducto = id_tipoProducto,
        this.nombre_tipoProducto = nombre_tipoProducto
        this.habilitada = habilitada
        this.categoria = categoria
    }
    toJson(){
        const json = {
            "id_tipoProducto": this.id_tipoProducto,
            "nombre_tipoProducto": this.nombre_tipoProducto,
            "habilitada": this.habilitada ? "Habilitada" : "Deshabilitada",
            "Categoria": this.categoria ? this.categoria.toJson() : "No posee"
        }
        return json
    }
}

module.exports = TipoProducto
