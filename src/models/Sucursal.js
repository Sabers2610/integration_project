class Sucursal {
    constructor(id_sucursal=0, nombre = '', direccion = '') {
      this.id_sucursal = id_sucursal;
      this.nombre = nombre;
      this.direccion = direccion;
    }

    getSucursal(){
      const to_Json={
        "id_sucursal":this.id_sucursal,
        "nombre":this.nombre,
        "direccion":this.direccion
      }
      return to_Json;
    }
  }
  
module.exports = Sucursal;