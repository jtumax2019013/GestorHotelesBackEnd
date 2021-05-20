const Evento = require("./eventos.model");

function foundEvent() {
  return Evento.find({});
}

function createEvent(event, fecha) {
  return new Evento({
    ...event,
    fecha: Date.parse(fecha),
  }).save();
}

function deleteEvent(id) {
  return Evento.findByIdAndRemove(id);
}

function foundOneEvent({ id: id }) {
  if (id) {
    return Evento.findById(id);
  }
  throw new Error(
    "Funcion de obtener un evento fua llamada sin especificar el id"
  );
}

module.exports = {
  foundEvent,
  foundOneEvent,
  createEvent,
  deleteEvent,
};
