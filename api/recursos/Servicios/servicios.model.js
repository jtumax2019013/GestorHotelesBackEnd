const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema({
  tipoServicio: {
    type: String,
    required: [true, "el servicio necesita un tipo"],
  },
  precio: {
    type: Number,
    required: [true, "el servicio necesita un precio"],
  },
  descripcion: {
    type: String,
    required: [true, "el servicio necesita una descripcion"],
  },
});

module.exports = mongoose.model("servicio", servicesSchema);
