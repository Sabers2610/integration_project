class Categoria{
    constructor(id_categoria=0, nombre_categoria="", habilitada=true){
        this.id_categoria = id_categoria
        this.nombre_categoria = nombre_categoria
        this.habilitada = habilitada
    }
    toJson() {
        const json = {
            "id_categoria": this.id_categoria,
            "nombre_categoria": this.nombre_categoria,
            "habilitada": this.habilitada ? "Habilitada" : "Deshabilitada"
        }
        return json
    }
}