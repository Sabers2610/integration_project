class Estado{
    constructor(id_estado=0, nombre_estado=''){
        this.id_estado=id_estado
        this.nombre_estado=nombre_estado
    }
    toJson(){
        const to_Json={
            "id_estado": this.id_estado,
            "nombre_estado": this.nombre_estado
        }
        return to_Json
    }
}

module.exports = Estado