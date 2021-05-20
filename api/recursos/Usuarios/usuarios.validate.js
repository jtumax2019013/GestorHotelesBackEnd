const Joi = require("@hapi/joi");
const log = require("./../../../utils/logger");

const blueprintUser = Joi.object({
  username: Joi.string().alphanum().min(4).max(40).required(),
  password: Joi.string().min(6).max(200).required(),
  email: Joi.string().email().required(),
  name: Joi.string().max(100).required(),
  lastname: Joi.string().max(100).required(),
  rol: Joi.string()
    .valid("ROL_ADMINAPP", "ROL_CLIENT", "ROL_ADMINHOTEL")
    .required(),
  _id: Joi.string().optional().allow(''),
  bills: Joi.array(),
  history: Joi.array()
});

let validarUsuario = (req, res, next) => {
  const resultado = blueprintUser.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.info(
      "Fallo la validacion del usuario",
      resultado.error.details.map((error) => error.message)
    );
    res
      .status(400)
      .send(
        "Informacion del usuario no cumple con los requisitos. El nombre del usuario debe ser alafanúmerico y tener entre 3 y 30 carácteres. La contraseña debe tener entre 6 y 200 carácteres. Asegúrate de que el email sea válido. Asegurate de poner nombre y apellido del usuario. Asegurate de poner el Rol acadecuado (ROL_ADMIN o ROL_CLIENT)"
      );
  }
};

const blueprintLogin = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().optional().allow(''),
  name: Joi.string().optional().allow(''),
  lastname: Joi.string().optional().allow(''),
  rol: Joi.string().optional().allow(''),
  _id: Joi.string().optional().allow(''),
  bills: Joi.array().optional().allow(''),
  history: Joi.array().optional().allow('')
});

let validarLogin = (req, res, next) => {
  const resultado = blueprintLogin.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.info(
      "Fallo la validacion del login",
      resultado.error.details.map((error) => error.message)
    );
    res
      .status(400)
      .send(
        "Login fallo. Debes especificar el username y contraseña del usuario."
      );
  }
};

const blueprintUpdate = Joi.object({
  username: Joi.string().alphanum().min(3).max(100).required(),
  name: Joi.string().max(100).required(),
  lastname: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  bills: Joi.optional(),
  history: Joi.optional(),
  rol: Joi.optional(),
  __v: Joi.optional(),
  _id: Joi.optional()
});

let validarUpdate = (req, res, next) => {
  const resultado = blueprintUpdate.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.info(
      "Fallo la validacion del usuario",
      resultado.error.details.map((error) => error.message)
    );
    res
      .status(400)
      .send("Informacion del usuario no cumple con los requisitos.");
  }
};

module.exports = {
  validarUsuario,
  validarLogin,
  validarUpdate,
};
