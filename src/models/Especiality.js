class Especiality {
    constructor(id_especiality=0, name_especiality="",){
        this.id_especiality = id_especiality
        this.name_especiality = name_especiality
    }

    toJson() {
        const json = {
            id_especiality: this.id_especiality,
            name_especiality:this.name_especiality,
        }

        return json
    }
}

module.exports = Especiality