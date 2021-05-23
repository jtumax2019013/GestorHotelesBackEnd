const express = require("express");
const passport = require("passport");
const log = require("./../../../utils/logger");
const reservationController = require("./reservaciones.controller");
const userController = require("./../Usuarios/usuarios.controller");
const hotelController = require("./../Hoteles/hoteles.controller");
const roomController = require("./../Habitaciones/habitacion.controller");
const procesarErrores = require("./../../libs/errorHandler").procesarErrores;
const {
  FechaIncorrecta,
  ReservacionNoExiste,
  HotelNoExiste,
  HabitacionNoExiste,
} = require("./reservaciones.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const reservationRouter = express.Router();

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`El id ${id} suministrado en el URL no es valido`);
    return;
  }
  next();
}
function validarIds(req, res, next) {
  let id = req.params.idR;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`El id ${id} suministrado en el URL no es valido`);
    return;
  }
  next();
}




reservationRouter.get(
  "/",
  procesarErrores((req, res) => {
    return reservationController.foundReservation().then((reservaciones) => {
      res.json(reservaciones);
    });
  })
);

reservationRouter.post(
  "/:idH/:idR/set",
  [jwtAuthenticate],
  procesarErrores(async (req, res) => {
    let nuevaReservacion = req.body;
    let fechaIngreso = req.body.fechaIngreso;
    let fechaSalida = req.body.fechaSalida;
    let idUser = req.user.id;
    let idHotel = req.params.idH;
    let idRoom = req.params.idR;
    let hotel;
    let room;
    let disp = "ocupado";

    hotel = await hotelController.foundOneHotel({ id: idHotel });

    room = await roomController.foundOneRoom({ id: idRoom });

    if (!hotel) {
      log.info("El hotel no existe en la base de datos");
      throw new HotelNoExiste(
        `El hotel con id [${idHotel}] no existe en la base de datos`
      );
    }

    if (!room) {
      log.info("La habitacion no existe");
      throw new HabitacionNoExiste();
    }
    roomController
      .updateAvailability(idRoom, disp)
      .then((estadoActualizado) => {
        log.info(`El estado de la habitacion con [${idRoom}] fue actualizado`);
      });

    reservationController
      .setReservation(nuevaReservacion, fechaIngreso, fechaSalida)
      .then((nuevaReservacionCreada) => {
        if (nuevaReservacionCreada) {
          res.json(nuevaReservacionCreada);
          log.info("Reservacion creada con exito");
          userController
            .setHistory(idUser, nuevaReservacionCreada.id)
            .then((reservacionSeteada) => {
              log.info(
                `el usuario con id [${idUser}] fue actualizado con su nueva reservacion y agregada a su historial`
              );
              hotelController
                .setReservation(idHotel, nuevaReservacionCreada.id)
                .then((reservacionSeteadaHotel) => {
                  log.info(
                    `El hotel con id [${idHotel}] fue actualizado con una reservacion de un cliente`
                  );
                  reservationController
                    .setRoom(nuevaReservacionCreada.id, idRoom)
                    .then((habitacionSeteada) => {
                      log.info(
                        `La reservacion ya tiene habitacion, su id es [${idRoom}]`
                      );
                    });
                  hotelController
                    .setSolicitud(idHotel)
                    .then((solicitudActualizada) => {
                      log.info(`Se ha incrementado las solicitudes del hotel`);
                    });
                });
            });
        }
      });
  })
);

reservationRouter.delete(
  "/:idR/:idH",
  [jwtAuthenticate, validarIds],
  procesarErrores(async (req, res) => {
    let idReservacion = req.params.idR;
    let reservacionEliminar;
    let idRoom = req.params.idH;
    let disp = "Disponible";

    reservacionEliminar = await reservationController.foundOneReservacion({
      id: idReservacion,
    });

    if (!reservacionEliminar) {
      log.info(
        `La reservacion con id [${idReservacion}] no existe en la base de datos`
      );
      throw new ReservacionNoExiste();
    }

    let reservacionBorrada = await reservationController.deleteReservation(
      idReservacion
    );
    log.info(
      `La reservacion con [${idReservacion}] ha sido cancelada con exito`
    );
    roomController
      .updateAvailability(idRoom, disp)
      .then((estadoActualizado) => {
        log.info(`El estado de la habitacion con [${idRoom}] fue actualizado`);
        res.json(reservacionBorrada);
      });
  })
);

module.exports = reservationRouter;
