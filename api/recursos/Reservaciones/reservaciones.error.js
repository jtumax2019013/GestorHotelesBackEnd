class FechaIncorrecta extends Error {
  constructor(message) {
    super(message);
    this.message = message || "La fecha que ingreso no es valida";
    this.status = 400;
    this.name = "FechaIncorrecta";
  }
}

class ReservacionNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message = message || "La reservacion no existe en la base de datos";
    this.status = 204;
    this.name = "ReservacionNoExiste";
  }
}

class HotelNoExiste extends Error{
  constructor(message){
    super(message);
    this.message = message || "El hotel no existe en la base de datos";
    this.status = 204
    this.name = "HotelNoExiste"
  }
}

class HabitacionNoExiste extends Error{
  constructor(message){
    super(message);
    this.message = message || "La habitacion no existe en la base de datos";
    this.status = 204
    this.name = "HabitacionNoExiste"
  }
}


module.exports = {
  FechaIncorrecta,
  ReservacionNoExiste,
  HotelNoExiste,
  HabitacionNoExiste
};
