const mongoose = require('mongoose')

const facturaSchema = new mongoose.Schema({
    totalPagar: {
        type: Number,
        required: [true, 'La factura necesita un total']
    },
    usuarioAPagar: [{type: mongoose.Schema.ObjectId, ref:'usuario'}]
})

module.exports = mongoose.model('factura', facturaSchema);