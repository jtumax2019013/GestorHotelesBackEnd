const express = require("express");
const bodyparser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require('cors')

const logger = require("./utils/logger");
const authJWT = require("./api/libs/auth");
const config = require("./config");
const errorHandler = require("./api/libs/errorHandler");
const userRouter = require("./api/recursos/Usuarios/usuarios.routes");
const reservationRouter = require("./api/recursos/Reservaciones/reservaciones.routes");
const servicesRouter = require("./api/recursos/Servicios/servicios.routes");
const eventoRouter = require("./api/recursos/eventos/eventos.routes");
const roomRouter = require('./api/recursos/Habitaciones/habitacion.routes')
const billRouter = require('./api/recursos/facturas/factura.routes');
const hotelRouter = require('./api/recursos/Hoteles/hoteles.routes');

passport.use(authJWT);

mongoose.connect("mongodb://127.0.0.1:27017/gestorhoteles");
mongoose.connection.on("error", () => {
  logger.error("Fallo la conexion a mongodb");
  process.exit(1);
});

mongoose.set("useFindAndModify", false);

const app = express();

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json());

app.use(cors());

app.use(
  morgan("short", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(passport.initialize());

app.use("/usuarios", userRouter);
app.use("/reservaciones", reservationRouter);
app.use("/servicios", servicesRouter);
app.use("/eventos", eventoRouter);
app.use('/habitaciones', roomRouter);
app.use('/facturas', billRouter);
app.use('/hoteles', hotelRouter);

app.use(errorHandler.procesarErroresDeDB);
if (config.ambiente === "prod") {
  app.use(errorHandler.erroresEnProduccion);
} else {
  app.use(errorHandler.erroresEnDesarrollo);
}

const server = app.listen(config.puerto, () => {
  logger.info("Escuchando en el puerto 3000");
});

module.exports = {
  app,
  server,
};
