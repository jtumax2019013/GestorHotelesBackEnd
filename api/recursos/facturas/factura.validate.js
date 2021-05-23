const Joi = require('@hapi/joi')
const log = require('./../../../utils/logger')

const blueprintBill = Joi.object({
    totalPagar: Joi.number().positive().precision(2).required(),
    usuarioPagar: Joi.string().required().allow('')
})

let validarFactura = (req, res, next) => {
    let resultado = blueprintBill.validate(req.body, {abortEarly:false, convert:false})
    if(resultado.error === undefined){
        next()
    }else{
        log.info('Hubo un problema en la validacion de la factura', resultado.error.details.map(err => err.message))
        res.status(400).send("Informacion no cumple con los requisitos, compruebe que el total a pagar sea un numero positivo, tenga solo 2 digitos y no este vacio")
    }
}

module.exports = {
    validarFactura
}