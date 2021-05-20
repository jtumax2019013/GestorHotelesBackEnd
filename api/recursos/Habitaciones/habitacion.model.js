const mongoose = require("mongoose");

const habitacionSchema = new mongoose.Schema({
  disponibilidad: {
    type: String,
    required: [true, "La habitacion necesita una disponibilidad"],
  },
  descripcion: {
    type: String,
    required: [true]
  },
  services: [{ type: mongoose.Schema.ObjectId, ref: "servicio" }],
});

module.exports = mongoose.model("habitacion", habitacionSchema);
