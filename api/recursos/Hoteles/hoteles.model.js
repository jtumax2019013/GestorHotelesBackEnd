const mongoose = require('mongoose')

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 1,
        required: [true, 'Hotel debe tener un nombre']
    },
    direccion: {
        type: String,
        minlength: 1,
        required: [true, 'Hotel debe tener una direccion']
    },
    solicitud: {
        type: Number,
        required: [true, 'Hotel debe tener las solicitudes']
    },
    reservation: [{type: mongoose.Schema.ObjectId, ref:'reservacion'}],
    room : [{type: mongoose.Schema.ObjectId, ref:'habitacion'}],
    event: [{type: mongoose.Schema.ObjectId, ref:'evento'}],
    user: [{type: mongoose.Schema.ObjectId, ref:'usuario'}],
    admin: [{type: mongoose.Schema.ObjectId, ref:'usuario'}]
})

module.exports = mongoose.model('hotel', hotelSchema)