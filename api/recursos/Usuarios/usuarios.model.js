const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 1,
        required: [true, 'Usuario debe tener un nombre']
    },
    lastname: {
        type: String,
        minlength: 1,
        required: [true, 'Usuario debe tener un apellido']
    },
    username: {
        type: String,
        minlength: 1,
        required: [true, 'Usuario debe tener un username']
    },
    password: {
        type: String,
        minlength: 1,
        required: [true, 'Usuario debe tener una contraseña']
    },
    email: {
        type: String,
        minlength: 1,
        required: [true, 'Usuario debe tener un email']
    },
    rol: {
        type: String,
        minlength: 1,
        required: [true, 'Usuario debe tener un rol']
    },
    bills: [{type: mongoose.Schema.ObjectId, ref:'factura'}],
    history: [{type: mongoose.Schema.ObjectId, ref:'reservacion'}]
})

module.exports = mongoose.model('usuario', usuarioSchema)