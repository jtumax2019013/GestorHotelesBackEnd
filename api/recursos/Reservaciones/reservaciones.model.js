const mongoose = require("mongoose");

const reservationSchema = mongoose.Schema({
  fechaIngreso: {
    type: Date,
    required: [true, "la reservacion necesita una fecha de ingreso"],
  },
  fechaSalida: {
    type: Date,
    required: [true, "la reservacion necesita una fecha de salida"],
  },
  numeroTarjeta: {
    type: Number,
    min: 0,
    required: [true, "la reservacion necesita una tarjeta del usuario"],
  },
  totalPagar: {
    type: Number,
    min: 0,
    required: [true, "la reservacion necesita un total a pagar"],
  },
  room: [{ type: mongoose.Schema.ObjectId, ref: "habitacion" }],
});

module.exports = mongoose.model("reservacion", reservationSchema);
