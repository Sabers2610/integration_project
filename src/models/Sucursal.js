class Sucursal {
    constructor(id_sucursal=0, nombre_sucursal = '', direccion = '') {
      this.id_sucursal = id_sucursal;
      this.nombre_sucursal = nombre_sucursal;
      this.direccion = direccion;
    }

    toJson(){
      const to_Json={
        "id_sucursal":this.id_sucursal,
        "nombre":this.nombre,
        "direccion":this.direccion
      }
      return to_Json;
    }
  }
  
module.exports = Sucursal;