const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const log = require("./../../../utils/logger");
const config = require("../../../config");
const validarUsuario = require("./usuarios.validate").validarUsuario;
const validarLogin = require("./usuarios.validate").validarLogin;
const validarUpdate = require("./usuarios.validate").validarUpdate;
const userController = require("./usuarios.controller");
const procesarErrores = require("./../../libs/errorHandler").procesarErrores;
const {
  DatosDeUsuarioYaEnUso,
  CredencialesIncorrectas,
  RolDeUsuarioInvalido,
  UsuarioNoExiste,
} = require("./usuarios.error");

const jwtAuthenticate = passport.authenticate("jwt", { session: false });
const userRouter = express.Router();

function transformarBodyALowerCase(req, res, next) {
  req.body.username && (req.body.username = req.body.username.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  req.body.name && (req.body.name = req.body.name.toLowerCase());
  req.body.lastname && (req.body.lastname = req.body.lastname.toLowerCase());
  next();
}

function validarId(req, res, next) {
  let id = req.params.id;

  if (id.match(/^[a-fA-F0-9]{24}$/) === null) {
    res.status(400).send(`El id ${id} suministrado en el URL no es valido`);
    return;
  }
  next();
}

userRouter.get(
  "/",
  procesarErrores((req, res) => {
    return userController.foundUser().then((usuarios) => {
      res.json(usuarios);
    });
  })
);

userRouter.get('/adminHotel', jwtAuthenticate, procesarErrores((req, res) => {
  let rolHotel = req.user.rol;
  let admins = [];

  if(rolHotel != "ROL_ADMINAPP"){
    log.info('Rol de usuario invalido')
    throw new RolDeUsuarioInvalido();
  }

  return userController.foundUserAdminHotel().then((adminHotel) => {
    admins.push(adminHotel)
    res.send(admins)
    log.info("este es el array con los datos" + admins);
  })

}))

userRouter.post(
  "/create",
  [validarUsuario, transformarBodyALowerCase],
  procesarErrores((req, res) => {
    let nuevoUsuario = req.body;
    nuevoUsuario._id = null;
    return userController
      .existingUser(nuevoUsuario.username, nuevoUsuario.email)
      .then((usuarioEncontrado) => {
        if (usuarioEncontrado) {
          log.warn(
            `Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existen dentro de la base de datos`
          );
          throw new DatosDeUsuarioYaEnUso();
        }
        return bcrypt.hash(nuevoUsuario.password, 10);
      })
      .then((hash) => {
        return userController
          .createUser(nuevoUsuario, hash)
          .then((nuevoUsuarioCreado) => {
            res
              .status(201)
              .send(nuevoUsuarioCreado);
          });
      });
  })
);

userRouter.post(
  "/login",
  [validarLogin, transformarBodyALowerCase],
  procesarErrores(async (req, res) => {
    let usuarioNoAutenticado = req.body;

    let usuarioRegistrado = await userController.foundOneUser({
      username: usuarioNoAutenticado.username,
    }).populate('history');
    if (!usuarioRegistrado) {
      log.info(
        `Usuario [${usuarioNoAutenticado.username}] no existe. No puede ser autenticado`
      );
      throw new CredencialesIncorrectas();
    }
    let contraseñaCorrecta = await bcrypt.compare(
      usuarioNoAutenticado.password,
      usuarioRegistrado.password
    );
    if (contraseñaCorrecta) {
      let token = jwt.sign({ id: usuarioRegistrado._id }, config.jwt.secreto, {
        expiresIn: config.jwt.tiempoDeExpiracion,
      });
      log.info(
        `Usuario [${usuarioNoAutenticado.username}] completo la autenticacion con exito`
      );
      res.status(200).json({ token: token, user: usuarioRegistrado });
      res.send(usuarioRegistrado);
    } else {
      log.info(
        `Usuario ${usuarioNoAutenticado.username} no completo autenticacion. Contraseña incorrecta`
      );
      throw new CredencialesIncorrectas();
    }
  })
);

userRouter.put(
  "/:id",
  [jwtAuthenticate, validarId, validarUpdate],
  procesarErrores(async (req, res) => {
    let idUsuario = req.params.id;
    let id = req.user.id;
    let updateUser;

    updateUser = await userController.foundOneUser({ id: idUsuario });

    if (!updateUser) {
      throw new UsuarioNoExiste(`El usuario con id [${idUsuario}] no existe`);
    }

    if (id !== idUsuario) {
      log.warn(`El id [${id}] no coincide con el id enviado`);
      throw new CredencialesIncorrectas(`Los id no coinciden`);
    }

    userController.updateUser(idUsuario, req.body).then((usuario) => {
      res.json(usuario);
      log.info(
        `Usuario con id [${idUsuario}] ha sido actualizado con exito`,
        usuario
      );
    });
  })
);

userRouter.delete(
  "/:id",
  [jwtAuthenticate, validarId],
  procesarErrores(async (req, res) => {
    let idUsuario = req.params.id;
    let usuarioAEliminar;

    usuarioAEliminar = await userController.foundOneUser({ id: idUsuario });

    if (!usuarioAEliminar) {
      log.info(
        `El Usuario con id [${idUsuario}] no existe en la base de datos`
      );
      throw new UsuarioNoExiste(
        `Usuario con id [${idUsuario}] no existe. No se puede borrar nada`
      );
    }

    let usuarioId = req.user.id;
    if (usuarioId !== idUsuario) {
      log.info(
        `El usuario con id [${usuarioId}] no coincide con el id enviado`
      );
      throw new CredencialesIncorrectas(`el id de los usuarios no coinciden`);
    }

    let usuarioBorrado = await userController.deleteUser(idUsuario);
    log.info(`El usuario con id [${idUsuario}] a sido eliminado`);
    res.json(usuarioBorrado);
  })
);

module.exports = userRouter;
