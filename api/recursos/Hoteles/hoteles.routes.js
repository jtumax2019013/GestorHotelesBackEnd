const express = require("express");
const passport = require("passport");

const log = require("./../../../utils/logger");
const validarHotel = require("./hoteles.validate").validarHotel;
const hotelController = require("./hoteles.controller");
const userController = require('./../Usuarios/usuarios.controller');
const procesarErrores = require("./../../libs/errorHandler").procesarErrores;
const { HotelNoExiste, RolInvalido } = require("./hoteles.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const hotelRouter = express.Router();

function validarId(req, res, next) {
  let id = req.params.id;
  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`El Id [${id}] suministrado en el URL no es valido`);
    return;
  }
  next();
}

hotelRouter.get(
  "/",
  procesarErrores((req, res) => {
    return hotelController.foundHotel().populate('user').populate('reservation').then((hoteles) => {
      res.json(hoteles);
    });
  })
);

hotelRouter.post(
  "/create/:id",
  [jwtAuthenticate, validarHotel],
  procesarErrores(async (req, res) => {
    let nuevoHotel = req.body;
    let idAdmin = req.params.id;
    let userAdmin;
    let rolUsuario = req.user.rol;

    if (rolUsuario != "ROL_ADMINAPP") {
      log.info("El usuario no tiene el rol para esta accion");
      throw new RolInvalido();
    }

    userAdmin = await userController.foundOneUser({id: idAdmin});

    if(userAdmin.rol != "ROL_ADMINHOTEL"){
        log.info("El usuario no tiene el rol para esta accion");
        throw new RolInvalido('El usuario no tiene el rol para administrar un hotel')
    }

    hotelController.createHotel(nuevoHotel, idAdmin).then((hotel) => {
        res.json(hotel)
        log.info("Hotel creado con exito")
    })
    
  })
);

hotelRouter.put('/:id', [jwtAuthenticate, validarId, validarHotel], procesarErrores(async (req, res) => {
    let idHotel = req.params.id;
    let rolUser = req.user.rol;
    let updateHotel;

    updateHotel = await hotelController.foundOneHotel({ id: idHotel });

    if(!updateHotel){
        throw new HotelNoExiste(`El hotel con id [${idHotel}] no existe`)
    }

    if(rolUser != "ROL_ADMINHOTEL"){
        log.info('El usuario no tiene el rol correcto')
        throw new RolInvalido()
    }

    hotelController.updateHotel(idHotel, req.body).then((hotel) => {
        res.json(hotel)
        log.info(`Hotel con id [${idHotel}] ha sido actualizado con exito`, hotel)
    })

}))

hotelRouter.delete('/:id', [jwtAuthenticate, validarId], procesarErrores(async (req, res) => {
    let idHotel = req.params.id;
    let hotelAEliminar;

    hotelAEliminar = await hotelController.foundOneHotel({id: idHotel})
    
    if(!hotelAEliminar){
        log.info(`El hotel con id [${idHotel}] no existe en la base de datos`)
        throw new HotelNoExiste();
    }
    
    let hotelBorrado = await hotelController.deleteHotel(idHotel)
    log.info(`EL hotel con id [${idHotel}] a sido eliminado`)
    res.json(hotelBorrado);

}))

module.exports = hotelRouter;