const express = require("express");
const passport = require("passport");

const log = require("./../../../utils/logger");
const validarHabitacion = require("./habitacion.validate").validarRoom;
const roomController = require("./habitacion.controller");
const hotelController = require("./../Hoteles/hoteles.controller");
const reservacionController = require('./../Reservaciones/reservaciones.controller')
const procesarErrores = require("./../../libs/errorHandler").procesarErrores;
const {
  HabitacionNoExiste,
  HotelNoExiste,
  RolInvalido,
  ReservacionNoExiste
} = require("./habitacion.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const roomRouter = express.Router();

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`El id ${id} suministrado en el URL no es valido`);
    return;
  }
  next();
}

roomRouter.get(
  "/",
  procesarErrores((req, res) => {
    return roomController.foundRoom().then((habitaciones) => {
      res.json(habitaciones);
    });
  })
);

roomRouter.post(
  "/:id/create",
  [validarHabitacion, jwtAuthenticate],
  procesarErrores(async (req, res) => {
    let nuevaHabitacion = req.body;
    let idHotel = req.params.id;
    let hotel;
    let rolUser = req.user.rol;

    hotel = await hotelController.foundOneHotel({ id: idHotel });



    if (!hotel) {
      log.info("El hotel no existe");
      throw new HotelNoExiste();
    }

    if (rolUser != "ROL_ADMINAPP" && rolUser != "ROL_ADMINHOTEL") {
      log.info("El usuario no cumple con el rol");
      throw new RolInvalido();
    }

    roomController.setRoom(nuevaHabitacion).then((roomCreated) => {
      if (roomCreated) {
        res.json(roomCreated);
        log.info("Habitacion creada con exito");
        return hotelController
          .setRoom(idHotel, roomCreated.id)
          .then((habitacionSeteada) => {
            log.info(
              `El hotel con id [${idHotel}] fue actualizado con nuevas habitaciones`
            );
          });
      }
      log.error("La Habitacion no se pudo crear");
    });
  })
);

roomRouter.delete(
  "/:id",
  [jwtAuthenticate, validarId],
  procesarErrores(async (req, res) => {
    let idHabitacion = req.params.id;
    let habitacionEliminar;

    habitacionEliminar = await roomController.foundOneRoom({
      id: idHabitacion,
    });

    if (!habitacionEliminar) {
      log.info(
        `La habitacion con id [${idHabitacion}] no existe en la base de datos`
      );
      throw new HabitacionNoExiste();
    }

    let habitacionBorrada = await roomController.deleteRoom(idHabitacion);
    log.info(`La habitacion con [${idHabitacion}] ha sido eliminada con exito`);
    res.json(habitacionBorrada);
  })
);

module.exports = roomRouter;
