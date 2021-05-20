let request = require("supertest");
let mongoose = require("mongoose");
let bcrypt = require("bcrypt");

let log = require("../../../utils/logger");
let Usuario = require("../Usuarios/usuarios.model");
let Reservacion = require("./reservaciones.model");
let app = require("../../../index").app;
let server = require("../../../index").server;

let authToken;

let usuarioPrueba = {
  username: "ejemplo777",
  email: "ejemplo777@gmail.com",
  name: "simon",
  lastname: "velasquez",
  password: "ejemplo7",
  rol: "ROL_ADMINHOTEL",
};

let ejemploReservaciones = [
  {
    fechaIngreso: "2012-01-01",
    fechaSalida: "2013-01-02",
    numeroTarjeta: 123456789123456,
    totalPagar: 150.5,
  },
  {
    fechaIngreso: "2014-01-01",
    fechaSalida: "2015-01-02",
    numeroTarjeta: 123456789123456,
    totalPagar: 150.5,
  },
  {
    fechaIngreso: "2016-01-01",
    fechaSalida: "2017-01-02",
    numeroTarjeta: 123456789123456,
    totalPagar: 150.5,
  },
];

let reservacionPrueba = {
  fechaIngreso: "2012-01-01",
  fechaSalida: "2013-01-02",
  numeroTarjeta: 123456789123456,
  totalPagar: 150.5,
};

let idReservacionInvalido = "5ab8dbcc6539f91c2288b0c1";

describe("Reservaciones", () => {
  beforeEach((done) => {
    Reservacion.deleteMany({}, (err) => {
      done();
    });
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  describe("GET /reservaciones", () => {
    test("Si no hay reservaciones, deberia retornar un array vacio", (done) => {
      request(app)
        .get("/reservaciones")
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });

    test("Si existen reservaciones, deberia de retornar un array", (done) => {
      Promise.all(
        ejemploReservaciones.map((reservacion) =>
          new Reservacion(reservacion).save()
        )
      ).then((reservaciones) => {
        request(app)
          .get("/reservaciones")
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body).toHaveLength(3);
            done();
          });
      });
    });
  });

  describe("POST /reservaciones", () => {
    test("Una reservacion que cumple con las condiciones deberia ser creado y su validacion es correcta", (done) => {
      Reservacion.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioPrueba.username,
          email: usuarioPrueba.email,
          name: usuarioPrueba.name,
          lastname: usuarioPrueba.lastname,
          password: bcrypt.hashSync(usuarioPrueba.password, 10),
          rol: usuarioPrueba.rol,
        })
          .save()
          .then((usuario) => {
            log.info("usuario de prueba creado");
            console.log(usuario.password);
          })
          .catch((err) => {
            log.error(err);
          });
        request(app)
          .post("/usuarios/login")
          .send({
            username: usuarioPrueba.username,
            password: usuarioPrueba.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            request(app)
              .post("/reservaciones/set")
              .set("Authorization", `Bearer ${authToken}`)
              .send(reservacionPrueba)
              .end((err, res) => {
                expect(res.status).toBe(200);
                done();
              });
          });
      });
    });

    test("Crear una reservacion sin fecha de ingreso debe fallar", (done) => {
      Reservacion.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioPrueba.username,
          email: usuarioPrueba.email,
          name: usuarioPrueba.name,
          lastname: usuarioPrueba.lastname,
          password: bcrypt.hashSync(usuarioPrueba.password, 10),
          rol: usuarioPrueba.rol,
        })
          .save()
          .then((usuario) => {
            log.info("usuario de prueba creado");
            console.log(usuario.password);
          })
          .catch((err) => {
            log.error(err);
          });
        request(app)
          .post("/usuarios/login")
          .send({
            username: usuarioPrueba.username,
            password: usuarioPrueba.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            request(app)
              .post("/reservaciones/set")
              .set("Authorization", `Bearer ${authToken}`)
              .send({
                fechaSalida: "2013-01-02",
                numeroTarjeta: 123456789123456,
                totalPagar: 150.5,
              })
              .end((err, res) => {
                expect(res.status).toBe(400);
                done();
              });
          });
      });
    });

    test("Crear una reservacion sin fecha de salida deberia de fallar", (done) => {
      Reservacion.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioPrueba.username,
          email: usuarioPrueba.email,
          name: usuarioPrueba.name,
          lastname: usuarioPrueba.lastname,
          password: bcrypt.hashSync(usuarioPrueba.password, 10),
          rol: usuarioPrueba.rol,
        })
          .save()
          .then((usuario) => {
            log.info("usuario de prueba creado");
            console.log(usuario.password);
          })
          .catch((err) => {
            log.error(err);
          });
        request(app)
          .post("/usuarios/login")
          .send({
            username: usuarioPrueba.username,
            password: usuarioPrueba.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            request(app)
              .post("/reservaciones/set")
              .set("Authorization", `Bearer ${authToken}`)
              .send({
                fechaIngreso: "2013-01-02",
                numeroTarjeta: 123456789123456,
                totalPagar: 150.5,
              })
              .end((err, res) => {
                  expect(res.status).toBe(400)
                  done()
              })
          });
      });
    });
  });

  describe('DELELTE /reservaciones/:id', () => {
      let idDeReservacionExistenteEliminar;
      test("Tratar de obtener una reservacion con un id invalido deberia de retornar un 400", (done) => {
            Reservacion.deleteMany({}, (err) => {
                if(err){
                    done(err)
                }
                Usuario({
                    username: usuarioPrueba.username,
                    email: usuarioPrueba.email,
                    name: usuarioPrueba.name,
                    lastname: usuarioPrueba.lastname,
                    password: bcrypt.hashSync(usuarioPrueba.password, 10),
                    rol: usuarioPrueba.rol,
                  })
                    .save()
                    .then((usuario) => {
                      log.info("usuario de prueba creado");
                      console.log(usuario.password);
                    })
                    .catch((err) => {
                      log.error(err);
                    });
                request(app)
                    .post('/usuarios/login')
                    .send({
                        username: usuarioPrueba.username,
                        password: usuarioPrueba.password
                    })
                    .end((err, res) => {
                        expect(res.status).toBe(200)
                        authToken = res.body.token;
                        request(app)
                            .delete('/reservaciones/123')
                            .set('Authorization', `Bearer ${authToken}`)
                            .end((err, res) => {
                                expect(res.status).toBe(400)
                                done()
                            })
                    })
                
            })  
      })

      test('Tratar de eliminar una reservacion que no existe deberia de retornar un 204', (done) => {
          Usuario.deleteMany({}, (err) => {
              if(err){
                  done(err)
              }
              Usuario({
                username: usuarioPrueba.username,
                email: usuarioPrueba.email,
                name: usuarioPrueba.name,
                lastname: usuarioPrueba.lastname,
                password: bcrypt.hashSync(usuarioPrueba.password, 10),
                rol: usuarioPrueba.rol,
              })
                .save()
                .then((usuario) => {
                  log.info("usuario de prueba creado");
                  console.log(usuario.password);
                })
                .catch((err) => {
                  log.error(err);
                });
                request(app)
                    .post('/usuarios/login')
                    .send({
                        username: usuarioPrueba.username,
                        password: usuarioPrueba.password
                    })
                    .end((err, res) => {
                        expect(res.status).toBe(200)
                        authToken = res.body.token
                        request(app)
                            .delete(`/reservaciones/${idReservacionInvalido}`)
                            .set('Authorization', `Bearer ${authToken}`)
                            .end((err, res) => {
                                expect(res.status).toBe(204)
                                done()
                            })
                    })
          })
      })

      test('Si el id de la reservacion es igual y entrega un token valido, se eliminara correctamente', (done) => {
          Reservacion.deleteMany({}, (err) => {
              if(err){
                  done(err)
              }
              Usuario({
                username: usuarioPrueba.username,
                email: usuarioPrueba.email,
                name: usuarioPrueba.name,
                lastname: usuarioPrueba.lastname,
                password: bcrypt.hashSync(usuarioPrueba.password, 10),
                rol: usuarioPrueba.rol,
              })
                .save()
                .then((usuario) => {
                  log.info("usuario de prueba creado");
                  console.log(usuario.password);
                })
                .catch((err) => {
                  log.error(err);
                });
                Reservacion(reservacionPrueba).save()
                    .then((reservacion) => {
                        idDeReservacionExistenteEliminar = reservacion._id
                    })
                    .catch((err) => {
                        log.error(err)
                    })
                request(app)
                    .post('/usuarios/login')
                    .send({
                        username: usuarioPrueba.username,
                        password: usuarioPrueba.password
                    })
                    .end((err, res) => {
                        expect(res.status).toBe(200)
                        authToken = res.body.token
                        request(app)
                            .delete(`/reservaciones/${idDeReservacionExistenteEliminar}`)
                            .set('Authorization', `Bearer ${authToken}`)
                            .end((err, res) => {
                                expect(res.status).toBe(200)
                                done()
                            })
                    })
          })
      })

  })

});
