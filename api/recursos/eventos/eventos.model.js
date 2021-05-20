const mongoose = require("mongoose");

const eventoSchema = new mongoose.Schema({
  tipoEvento: {
    type: String,
    minlength: 1,
    required: [true, "El evento necesita un tipo"],
  },
  fecha: {
    type: Date,
    required: [true, "El evento necesita una fecha"],
  },
  horario: {
    type: String,
    required: [true, "El evento necesita una hora"],
  },
  descripcion: {
    type: String,
    minlength: 1,
    required: [true, "El evento necesita una descripcion"],
  },
});

module.exports = mongoose.model("evento", eventoSchema);
