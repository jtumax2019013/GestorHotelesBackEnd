const Joi = require('@hapi/joi')
const log = require('./../../../utils/logger')

const blueprintEvent = Joi.object({
    tipoEvento: Joi.string().max(100).required(),
    fecha: Joi.required(),
    horario: Joi.required(),
    descripcion: Joi.string().max(200).required()
})

let validarEvento = (req, res, next) => {
    const resultado = blueprintEvent.validate(req.body, {
        abortEarly: false,
        convert: false
    });
    if(resultado.error === undefined){
        next()
    }else{
        log.info("Fallo la validacion del evento", resultado.error.details.map(err => err.message))
        res.status(400).send("Informacion no cumple con los requisitos. el tipo de evento no tiene que pasar de los 100 caracteres, se necesita una fecha, se necesita una hora, la descripcion no debe de pasar de 200 caracteres.")
    }
}

module.exports = {
    validarEvento
}