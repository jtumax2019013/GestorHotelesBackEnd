const Joi = require("@hapi/joi");
const log = require("./../../../utils/logger");

const blueprintReservation = Joi.object({
  fechaIngreso: Joi.required(),
  fechaSalida: Joi.required(),
  numeroTarjeta: Joi.number().positive().min(16).required(),
  totalPagar: Joi.number().positive().precision(2).required(),
});

let validarReservacion = (req, res, next) => {
  const resultado = blueprintReservation.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.info(
      "Fallo la validacion de la reservacion",
      resultado.error.details.map((error) => error.message)
    );
    res.status(400);
    res.send(
      "Informacion de la reservacion no cumple. La fecha de ingreso tiene que ser con el formato DD-MM-YYYY, la fecha de salida tiene que ser con el formato DD-MM-YYYY, el numero de la tarjeta no tiene que pasarse de 16 y no tiene que estar por debajo de 15"
    );
  }
};

module.exports = {
  validarReservacion,
};
