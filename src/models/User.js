// creamos las excepciones personalizadas para el usuario
const { FormatError } = require("../utils/exception.js")


//inicializamos la clase usuario
class User {
    // creamos el contructor de la clase
    constructor(rut="", name="", lastName="", age=0, direction="", email="", password="", especiality=null,employee=false,admin=false,enabled=true)
    {
        //seteamos losa tributos a sus respectivos validadores 
        this.setRut(rut)
        this.setName(name, lastName)
        this.setAge(age)
        this.setDirection(direction)
        this.setEmail(email)
        this.password = password
        this.especiality = especiality
        this.employee = employee
        this.admin = admin
        this.enabled = enabled
    }

    setRut(rut) {
        if(rut.length === 0 ) throw new FormatError("Missing Rut", "MISSING_USER_RUT")
        var rut2 = rut.replace(/-/g, "") // quitamos el guion del rut (debe venir en formato 11111111-1)
        if(!/^[0-9]+[0-9kK]{1}$/.test(rut2)){
            throw new RutError("Invalid Rut", "INVALID_USER_RUT");
        }

        var multiplicador = 2
        var suma = 0

        for(var i = rut.length - 2; i >= 0; i--){
            suma += parseInt(rut2.charAt(i)) * multiplicador
            multiplicador = multiplicador === 7 ? 2 : multiplicador+1
        }

        var digitoEsperado = 11 - (suma%11);
        if(digitoEsperado===1) digitoEsperado=0
        else if(digitoEsperado===10) digitoEsperado="K"
        
        console.log(digitoEsperado)
        console.log(rut.charAt(rut.length - 1))
        
        //HAY QUE REVISAR EL RUT
        
        this.rut = rut.toUpperCase()
    }

    setName(name,lastName) {
        if(name.length === 0 || lastName.length === 0) throw new FormatError("Missing name or last name", "MISSING_USER_NAME")
        const regex = /^[a-zA-Z]+$/

        var nameValidator = regex.test(name)
        var lastNameValidator = regex.test(lastName)

        if(!nameValidator || !lastNameValidator) throw new FormatError("Invalid Name or last name", "INVALID_USER_NAME")
        this.name = name
        this.lastName = lastName
    }

    setAge(age) {
        if(age < 0 || age > 110) throw new FormatError("invalid age", "INVALID_USER_AGE")
        this.age = age
    }

    setDirection(direction) {
        if(direction.length===0) throw new FormatError("Missing direction", "MISSING_USER_DIRECTION")
        this.direction = direction
    }

    setEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!regex.test(email)) throw new FormatError("Invalid Email", "INVALID_USER_email")
        this.email = email
    }

    toJson() {
        const json = {
            rut: this.rut,
            name:`${this.name} ${this.lastName}`,
            age:this.age,
            direction:this.direction,
            email:this.email,
            especiality: this.especiality !== null ? this.especiality.toJson() : "N/A",
            employee:this.employee ? "Empleado" : "Cliente",
            admin: this.admin ? "Admin" : "N/A",
            enabled: this.enabled ? "Habilitada" : "Deshabilitada"
        }

        return json
    }
}

module.exports = { User, FormatError}