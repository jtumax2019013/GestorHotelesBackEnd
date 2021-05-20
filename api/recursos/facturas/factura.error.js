class FacturaNoExiste extends Error{
    constructor(message){
        super(message)
        this.message = message || 'La factura no existe en la base de datos'
        this.status = 204
        this.name = 'FacturaNoExiste'
    }
}

class UsuarioNoExiste extends Error{
    constructor(message){
        super(message)
        this.message = message || 'El usuario no existe en la base de datos'
        this.status = 204
        this.name = 'UsuarioNoExiste'
    }
}

class HotelNoExiste extends Error{
    constructor(message){
        super(message)
        this.message = message || 'El hotel no existe en la base de datos'
        this.status = 204
        this.name = "HotelNoExiste"
    }
}

class RolInvalido extends Error{
    constructor(message){
        super(message)
        this.message = message || 'El usuario no cumple con el rol para esta accion'
        this.status = 404
        this.name = "RolInvalido"
    }
}

module.exports = {
    FacturaNoExiste,
    UsuarioNoExiste,
    HotelNoExiste,
    RolInvalido
}