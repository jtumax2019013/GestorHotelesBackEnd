const express = require("express");
const passport = require("passport");

const log = require("./../../../utils/logger");
const validarFactura = require("./factura.validate").validarFactura;
const billController = require("./facturas.controller");
const userController = require("./../Usuarios/usuarios.controller");
const hotelController = require("./../Hoteles/hoteles.controller");
const procesarErrores = require("./../../libs/errorHandler").procesarErrores;
const {
  FacturaNoExiste,
  UsuarioNoExiste,
  HotelNoExiste,
  RolInvalido,
} = require("./factura.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const billRouter = express.Router();

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`El id ${id} suministrado en el URL no es valido`);
    return;
  }
  next();
}

billRouter.get(
  "/",
  procesarErrores((req, res) => {
    return billController.foundBill().then((facturas) => {
      res.json(facturas);
    });
  })
);

billRouter.post(
  "/:id/set",
  [jwtAuthenticate, validarId, validarFactura],
  procesarErrores(async (req, res) => {
    let nuevaFactura = req.body;
    let idUsuario = req.user.id;
    let idHotel = req.params.id;
    let hotel;

    hotel = await hotelController.foundOneHotel({ id: idHotel });

    if (!hotel) {
      log.info("El hotel no existe");
      throw new HotelNoExiste();
    }

    billController.setBill(nuevaFactura, idUsuario).then((facturaCreated) => {
      if (facturaCreated) {
        res.json(facturaCreated);
        log.info("La factura creado con exito");
        hotelController.setUser(idHotel, idUsuario).then((usuarioSeteado) => {
          log.info(
            `El Hotel con id [${idHotel}] fue actualizado con su nueva cliente`
          );
          userController
            .setBills(idUsuario, facturaCreated.id)
            .then((facturaSeteada) => {
              log.info(
                `El usuario con id [${idUsuario}] fue actualizado con su nueva factura`
              );
            });
        });
      }
      log.error("La factura no se pudo crear");
      throw new UsuarioNoExiste();
    });
  })
);

module.exports = billRouter;
