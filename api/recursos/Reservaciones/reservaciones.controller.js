const Reservacion = require("./reservaciones.model");

function foundReservation() {
  return Reservacion.find({});
}

function setReservation(reservation, fechaIngreso, fechaSalida) {
  return new Reservacion({
    ...reservation,
    fechaIngreso: Date.parse(fechaIngreso),
    fechaSalida: Date.parse(fechaSalida),
  }).save();
}

function setRoom(id, idRoom) {
  return Reservacion.findOneAndUpdate(
    { _id: id },
    { $push: { room: idRoom } },
    { new: true }
  );
}

function deleteReservation(id) {
  return Reservacion.findByIdAndRemove(id);
}

function foundOneReservacion({ id: id }) {
  if (id) {
    return Reservacion.findById(id);
  }
  throw new Error(
    "Funcion de obtener una reservacion fue llamada sin especificar el id"
  );
}

module.exports = {
  foundReservation,
  setReservation,
  deleteReservation,
  foundOneReservacion,
  setRoom,
};
