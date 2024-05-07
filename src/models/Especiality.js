class Especiality {
    constructor(id_especiality=0, name_especiality="", enabled=true){
        this.id_especialty = id_especiality
        this.name_especialty = name_especiality
        this.enabled = enabled
    }

    toJson() {
        const json = {
            id_especiality: this.id_especiality,
            name_especiality:this.name_especiality,
            enabled:this.enabled ? "Habilitada" : "Deshabilitada"
        }

        return json
    }
}

module.exports = Especiality