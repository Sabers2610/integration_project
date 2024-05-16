class Modelo{
    constructor(id_modelo, nombre_modelo="", marca){
        this.id_modelo = id_modelo
        this.nombre_modelo = nombre_modelo
        this.marca = marca
    }
    toJson(){
        const json = {
            "id_modelo": this.id_modelo,
            "nombre_modelo":this.nombre_modelo,
            "marca": this.marca.toJson()
        }
        return json
    }
}

module.exports = Modelo