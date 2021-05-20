const express = require("express");
const passport = require("passport");

const log = require("./../../../utils/logger");
const validarEvento = require("./eventos.validate").validarEvento;
const eventoController = require("./eventos.controller");
const hotelController = require("./../Hoteles/hoteles.controller");
const procesarErrores = require("./../../libs/errorHandler").procesarErrores;
const { HotelNoExiste, EventoNoExiste, RolInvalido } = require("./eventos.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const eventoRouter = express.Router();

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`El id ${id} suministrado en el URL no es valido`);
    return;
  }
  next();
}

eventoRouter.get(
  "/",
  procesarErrores((req, res) => {
    return eventoController.foundEvent().then((eventos) => {
      res.json(eventos);
    });
  })
);

eventoRouter.post(
  "/:id/create",
  [jwtAuthenticate, validarEvento],
  procesarErrores(async (req, res) => {
    let nuevoEvento = req.body;
    let fecha = req.body.fecha;
    let idHotel = req.params.id;
    let rolUser = req.user.rol;
    let hotel;

    hotel = await hotelController.foundOneHotel({ id: idHotel });

    if (!hotel) {
      log.info(`El hotel con id [${idHotel}] no existe`);
      throw new HotelNoExiste();
    }

    if(rolUser != 'ROL_ADMINAPP' && rolUser != 'ROL_ADMINHOTEL'){
      log.info('El usuario no tiene el rol adecuado')
      throw new RolInvalido(`El usuario no tiene el rol adecuado tiene: ${rolUser}`);
    }

    eventoController.createEvent(nuevoEvento, fecha).then((nuevoEvento) => {
      if (nuevoEvento) {
        res.json(nuevoEvento);
        log.info("Evento creado con exito");
        hotelController
          .setEvent(idHotel, nuevoEvento.id)
          .then((eventoSeteado) => {
            log.info(
              `El hotel con id [${idHotel}] fue actualizado con su nuevo evento`
            );
          });
      }else{
        log.error("El evento no se pudo crear");
      }
    });
  })
);

eventoRouter.delete(
  "/:id",
  [jwtAuthenticate, validarId],
  procesarErrores(async (req, res) => {
    let idEvento = req.params.id;
    let eventoEliminar;

    eventoEliminar = await eventoController.foundOneEvent({ id: idEvento });

    if (!eventoEliminar) {
      log.info(`El evento con id [${idEvento}] no existe ne la base de datos`);
      throw new EventoNoExiste();
    }

    let eventoBorrado = await eventoController.deleteEvent(idEvento);
    log, info(`El evento con ${idEvento} ha sido cancelado con exito`);
    res.json(eventoBorrado);
  })
);

module.exports = eventoRouter;
