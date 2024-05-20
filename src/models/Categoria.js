class Categoria{
    constructor(id_categoria=0, nombre_categoria=""){
        this.id_categoria = id_categoria
        this.nombre_categoria = nombre_categoria
    }
    toJson() {
        const json = {
            "id_categoria": this.id_categoria,
            "nombre_categoria": this.nombre_categoria,
        }
        return json
    }
}

module.exports = Categoria