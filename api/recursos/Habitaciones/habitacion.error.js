class HabitacionNoExiste extends Error{
    constructor(message){
        super(message);
        this.message = message || "La habitacion no existe en la base de datos"
        this.status = 204
        this.name = "HabitacionNoExiste"
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

class ReservacionNoExiste extends Error{
    constructor(message){
        super(message)
        this.message = message || 'La reservacion no existe en la base de datos'
        this.status = 204
        this.name = "ReservacionNoExiste"
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
    HabitacionNoExiste,
    HotelNoExiste,
    RolInvalido,
    ReservacionNoExiste
}