class DatosDeUsuarioYaEnUso extends Error {
  constructor(message) {
    super(message);
    this.message =
      message || "El email o usuario ya estan asociados con una cuenta.";
    this.status = 409;
    this.name = "DatosDeUsuarioYaEnUso";
  }
}

class CredencialesIncorrectas extends Error {
  constructor(message) {
    super(message);
    this.message =
      message ||
      "Credenciales incorrectas. Asegurate que el username y contraseña sean correctas.";
    this.status = 400;
    this.name = "CredencialesIncorrectas";
  }
}

class RolDeUsuarioInvalido extends Error {
  constructor(message) {
    super(message);
    this.message =
      message || "El Rol de este usuario es invalido para esta operacion";
    this.status = 401;
    this.name = "RolDeUsuarioInvalido";
  }
}

class UsuarioNoExiste extends Error {
  constructor(message) {
    super(message);
    this.message = message || "Usuario no existe en la base de datos";
    this.status = 204;
    this.name = "UsuarioNoExiste";
  }
}

module.exports = {
  DatosDeUsuarioYaEnUso,
  CredencialesIncorrectas,
  RolDeUsuarioInvalido,
  UsuarioNoExiste,
};
