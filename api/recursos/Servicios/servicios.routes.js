const express = require("express");
const passport = require("passport");

const log = require("../../../utils/logger");
const validarServicio = require("./servicios.validate").validarServicio;
const servicesController = require("./servicios.controller");
const roomController = require('./../Habitaciones/habitacion.controller');
const procesarErrores = require("./../../libs/errorHandler").procesarErrores;
const {
  ServicioNoExiste,
  RolDelUsuarioIncorrecto,
  HabitacionNoExiste
} = require("./servicios.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const servicesRouter = express.Router();

function transformarBodyALowerCase(req, res, next) {
  req.body.tipoServicio &&
    (req.body.tipoServicio = req.body.tipoServicio.toLowerCase());
  req.body.descripcion &&
    (req.body.descripcion = req.body.descripcion.toLowerCase());
  next();
}

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`El id [${id}] suministrado en el URL no es valido`);
    return;
  }
  next();
}

servicesRouter.get(
  "/",
  procesarErrores((req, res) => {
    return servicesController.foundServices().then((services) => {
      res.json(services);
    });
  })
);

servicesRouter.post(
  "/:id/create",
  [jwtAuthenticate, validarServicio, transformarBodyALowerCase],
  procesarErrores( async (req, res) => {
    let nuevoServicio = req.body;
    let rolUsuario = req.user.rol;
    let idHabitacion = req.params.id;

    if (rolUsuario != "ROL_ADMINAPP" && rolUsuario != "ROL_ADMINHOTEL") {
      log.info(
        "El usuario no tiene acceso a esta accion por que no tiene el rol respectivo"
      );
      throw new RolDelUsuarioIncorrecto();
    }

    let habitacionExistente = await roomController.foundOneRoom({id: idHabitacion})

    if(!habitacionExistente){
      log.info(`La habitacion con id [${idHabitacion}] no existe`)
      throw new HabitacionNoExiste()

    }

     servicesController
      .createServices(nuevoServicio)
      .then((serviceCreated) => {
        res.status(201).send("Servicio creado con exito");
        log.info("Servicio creado")
          roomController.setServices(idHabitacion, serviceCreated.id).then((servicioSeteado) => {
            log.info(`La habitacion con id [${idHabitacion}] fue actualizada con su nuevo servicio`)
          })
      });
  })
);

servicesRouter.delete(
  "/:id",
  [jwtAuthenticate, validarId],
  procesarErrores(async (req, res) => {
    let idServicio = req.params.id;
    let servicioAEliminar;

    servicioAEliminar = await servicesController.foundOneService({
      id: idServicio,
    });

    if (!servicioAEliminar) {
      log.info(`El servicio no existe en la base de datos`);
      throw new ServicioNoExiste();
    }

    let rolUsuario = req.user.rol;
    if (rolUsuario != "ROL_ADMINHOTEL") {
      log.info(
        "El usuario no tiene acceso a esta accion por que no tiene el rol respectivo"
      );
      throw new RolDelUsuarioIncorrecto();
    }

    let servicioBorrado = await servicesController.deleteServices(idServicio);
    log.info("El servicio fue eliminado correctamente");
    res.json(servicioBorrado);
  })
);

module.exports = servicesRouter;