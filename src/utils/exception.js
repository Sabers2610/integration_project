class SQLError extends Error {
    constructor(message, type){
        super(message)
        this.name = "SQLError"
        this.type = type
    }
    exceptionJson() {
        const json = {
            "name": this.name,
            "type": this.type,
            "message": this.message
        }
        return json
    }
}

class FormatError extends Error{
    constructor(message, type){
        super(message)
        this.name="FormatError",
        this.type = type
    }
    exceptionJson() {
        const json = {
            "name": this.name,
            "type": this.type,
            "message": this.message
        }
        return json
    }
}

class AuthError extends Error{
    constructor(message, type){
        super(message)
        this.name="AuthError",
        this.type = type
    }
    exceptionJson() {
        const json = {
            "name": this.name,
            "type": this.type,
            "message": this.message
        }
        return json
    }
}

class PayError extends Error{
    constructor(message, type){
        super(message)
        this.name = "PayError"
        this.type = type
    }
}

module.exports = { SQLError, FormatError, AuthError, PayError}