class ServicioNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message =
      message ||
      "El servicio que busca o quiere eliminar no existe en la base de datos";
    this.status = 204;
    this.name = "ServicioNoExiste";
  }
}

class RolDelUsuarioIncorrecto extends Error {
  constructor(message) {
    super(message);
    this.message = message || "El usuario no es administrador del hotel";
    this.status = 400;
    this.name = "RolDeUsuarioIncorrecto";
  }
}

class HabitacionNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message = message || "El Hotel no existe en la base de datos";
    this.status = 204;
    this.name = "HabitacionNoExiste";
  }
}

module.exports = {
  ServicioNoExiste,
  RolDelUsuarioIncorrecto,
  HabitacionNoExiste,
};
