class EventoNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message = message || "El evento no existe en la base de datos";
    this.status = 204;
    this.name = "EventoNoExiste";
  }
}

class HotelNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message = message || "El hotel no existe en la base de datos";
    this.status = 204;
    this.name = "HotelNoExiste";
  }
}

class RolInvalido extends Error {
  constructor(message) {
    super(message);
    this.message =
      message || "El usuario no tiene el rol adecuado para esta accion";
    this.status = 404;
    this.name = "RolInvalido";
  }
}

module.exports = {
  EventoNoExiste,
  HotelNoExiste,
  RolInvalido,
};
