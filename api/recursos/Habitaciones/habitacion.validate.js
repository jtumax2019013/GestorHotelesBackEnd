const Joi = require("@hapi/joi");
const log = require("./../../../utils/logger");

const blueprintRoom = Joi.object({
  disponibilidad: Joi.string()
    .max(100)
    .valid("disponible", "ocupado")
    .required(),
    descripcion: Joi.string().max(200).required(),
  services: Joi.array().optional(),
});

let validarRoom = (req, res, next) => {
  const resultado = blueprintRoom.validate(req.body, {
    abortEarly: false,
    convert: false,
  });

  if (resultado.error === undefined) {
    next();
  } else {
    log.info(
      "Fallo la validacion de la habitacion",
      resultado.error.details.map((err) => err.message)
    );
    res
      .status(400)
      .send(
        "Informacion no cumple con los requisitos. la habitacion necesita de una disponibilidad"
      );
  }
};

module.exports = {
  validarRoom,
};
