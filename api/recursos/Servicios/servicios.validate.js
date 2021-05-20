const Joi = require("@hapi/joi");
const log = require("../../../utils/logger");

const blueprintService = Joi.object({
  tipoServicio: Joi.string().valid("VIP", "Normal", "Suite").required(),
  precio: Joi.number().positive().precision(2).required(),
  descripcion: Joi.string().max(200).required(),
});

let validarServicio = (req, res, next) => {
  const resultado = blueprintService.validate(req.body, {
    abortEarly: false,
    convert: false,
  });
  if (resultado.error === undefined) {
    next();
  } else {
    log.info(
      "Fallo en la validacion del servicio",
      resultado.error.details.map((err) => err.message)
    );
    res
      .status(400)
      .send(
        "Informacion incorrecta del servicio. verifique el tipo de servicio sea VIP, Normal o Suite. el precio sea positivo y que solo tenga dos decimales. la descripcion no tenga más de 200 caracteres"
      );
  }
};

module.exports = {
  validarServicio,
};
