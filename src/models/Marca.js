class Marca{
    constructor(id_marca, nombre_marca=""){
        this.id_marca = id_marca
        this.nombre_marca=nombre_marca
    }
    toJson(){
        const json = {
            "id_marca": this.id_marca,
            "nombre_marca": this.nombre_marca
        }
        return json
    }
}

module.exports = Marca