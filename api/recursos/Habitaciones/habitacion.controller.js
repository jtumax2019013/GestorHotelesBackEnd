const Habitacion = require("./habitacion.model");

function foundRoom() {
  return Habitacion.find({});
}

function setRoom(room) {
  return new Habitacion({
    ...room,
  }).save();
}

function deleteRoom(id) {
  return Habitacion.findByIdAndRemove(id);
}

function updateAvailability(id, data) {
  return Habitacion.findOneAndUpdate(
    {
       _id: id 
    },
    { 
      disponibilidad: data
    },
    { new: true }
  );
}

function foundOneRoom({ id: id }) {
  if (id) {
    return Habitacion.findById(id);
  }
  throw new Error(
    "Funcion de obtener una habitacion fue llamada sin especificar el id"
  );
}

function setServices(id, idServices) {
  return Habitacion.findOneAndUpdate(
    {
      _id: id,
    },
    {
      $push: { services: idServices },
    },
    {
      new: true,
    }
  );
}

module.exports = {
  foundRoom,
  setRoom,
  deleteRoom,
  foundOneRoom,
  setServices,
  updateAvailability,
};
