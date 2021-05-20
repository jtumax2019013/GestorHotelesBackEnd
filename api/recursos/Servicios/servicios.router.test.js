let request = require("supertest");
let mongoose = require("mongoose");
let bcrypt = require("bcrypt");

let log = require("./../../../utils/logger");
let Usuario = require("./../Usuarios/usuarios.model");
let Servicio = require("./servicios.model");
let app = require("./../../../index").app;
let server = require("./../../../index").server;

let authToken;

let usuarioPrueba = {
  username: "ejemplo777",
  email: "ejemplo777@gmail.com",
  name: "simon",
  lastname: "velasquez",
  password: "ejemplo7",
  rol: "ROL_ADMINHOTEL",
};
let usuarioPrueba1 = {
  username: "ejemplo777777",
  email: "ejemplo7777777@gmail.com",
  name: "simon",
  lastname: "velasquez",
  password: "ejemplo7777",
  rol: "ROL_CLIENT",
};

let ejemploServicios = [
  {
    tipoServicio: "VIP",
    precio: 245.5,
    descripcion: "Este es un ejemplo",
  },
  {
    tipoServicio: "Normal",
    precio: 24592.5,
    descripcion: "Este es un ejemplo",
  },
  {
    tipoServicio: "Suite",
    precio: 24592.5,
    descripcion: "Este es un ejemplo",
  },
];

let servicioPrueba = {
  tipoServicio: "VIP",
  precio: 20121,
  descripcion: "hola",
};

let idServicioInvalido = "5ab8dbcc6539f91c2288b0c1";

describe("Servicios", () => {
  beforeEach((done) => {
    Servicio.deleteMany({}, (err) => {
      done();
    });
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  describe("GET /servicios", () => {
    test("Si no hay servicios, deberia de retornar un Array vacio", (done) => {
      request(app)
        .get("/servicios")
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });

    test("Si hay servicios, deberia de retornar un Array", (done) => {
      Promise.all(
        ejemploServicios.map((servicio) => {
          new Servicio(servicio).save().then((servicios) => {
            request(app)
              .get("/servicios")
              .end((err, res) => {
                expect(res.status).toBe(200);
                expect(res.body).toBeInstanceOf(Array);
                expect(res.body).toHaveLength(3);
                done();
              });
          });
        })
      );
    });
  });

  describe("POST /servicios", () => {
    test("Si el servicio cumple con los requisitos y el usuario tiene el rol correcto", (done) => {
      Servicio.deleteMany({}, (err) => {
        done(err);
      });
      Usuario({
        username: usuarioPrueba.username,
        email: usuarioPrueba.email,
        name: usuarioPrueba.name,
        lastname: usuarioPrueba.lastname,
        password: bcrypt.hashSync(usuarioPrueba.password, 10),
        rol: "ROL_ADMINHOTEL",
      })
        .save()
        .then((usuario) => {
          log.info("Usuario de prueba creado");
          console.log(usuario);
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
            .post("/servicios/create")
            .set("Authorization", `Bearer ${authToken}`)
            .send(servicioPrueba)
            .end((err, res) => {
              console.log(res.body);
              expect(res.status).toBe(201);
              done();
            });
        });
    });

    test("Crear un servicio sin un tipo deberia fallar", (done) => {
      Servicio.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioPrueba.username,
          email: usuarioPrueba.email,
          name: usuarioPrueba.name,
          lastname: usuarioPrueba.lastname,
          password: bcrypt.hashSync(usuarioPrueba.password, 10),
          rol: "ROL_ADMINHOTEL",
        })
          .save()
          .then((usuario) => {
            log.info("usuario creado");
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
              .post("/servicios/create")
              .set("Authorization", `Bearer ${authToken}`)
              .send({
                precio: 24592.5,
                descripcion: "Este es un ejemplo",
              })
              .end((err, res) => {
                expect(res.status).toBe(400);
                done();
              });
          });
      });
    });

    test("Crear un servicio sin un precio  deberia fallar", (done) => {
      Servicio.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioPrueba.username,
          email: usuarioPrueba.email,
          name: usuarioPrueba.name,
          lastname: usuarioPrueba.lastname,
          password: bcrypt.hashSync(usuarioPrueba.password, 10),
          rol: "ROL_ADMINHOTEL",
        })
          .save()
          .then((usuario) => {
            log.info("usuario creado");
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
              .post("/servicios/create")
              .set("Authorization", `Bearer ${authToken}`)
              .send({
                tipoServicio: "VIP",
                descripcion: "Este es un ejemplo",
              })
              .end((err, res) => {
                expect(res.status).toBe(400);
                done();
              });
          });
      });
    });

    test("Crear un servicio sin descripcion debe fallar", (done) => {
      Servicio.deleteMany({}, (err) => {
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
            log.info("usuario creado");
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
              .post("/servicios/create")
              .set("Authorization", `Bearer ${authToken}`)
              .send({
                tipoServicio: "VIP",
                precio: 12132.12,
              })
              .end((err, res) => {
                expect(res.status).toBe(400);
                done();
              });
          });
      });
    });

    test("Si el usuario no es rol de administrador del hotel deberia fallar", (done) => {
      Servicio.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioPrueba1.username,
          email: usuarioPrueba1.email,
          name: usuarioPrueba1.name,
          lastname: usuarioPrueba1.lastname,
          password: bcrypt.hashSync(usuarioPrueba1.password, 10),
          rol: usuarioPrueba1.rol,
        })
          .save()
          .then((usuario) => {
            log.info("usuario de prueba creado");
            console.log(usuario.rol);
          })
          .catch((err) => {
            log.error(err);
          });
        request(app)
          .post("/usuarios/login")
          .send({
            username: usuarioPrueba1.username,
            password: usuarioPrueba1.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            request(app)
              .post("/servicios/create")
              .set("Authorization", `Bearer ${authToken}`)
              .send(servicioPrueba)
              .end((err, res) => {
                expect(res.status).toBe(400);
                done();
              });
          });
      });
    });
  });

  describe("DELETE /servicios/:id", () => {
    let idDeServicioExistenteEliminar;
    test("Tratar de obtener un servicio con un id invalido deberia de retornar un 400", (done) => {
      Servicio.deleteMany({}, (err) => {
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
              .delete("/servicios/123")
              .set("Authorization", `Bearer ${authToken}`)
              .end((err, res) => {
                expect(res.status).toBe(400);
                done();
              });
          });
      });
    });
    test("Tratar de eliminar un servicio que no existe deberia de retornar un 204", (done) => {
      Servicio.deleteMany({}, (err) => {
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
              .delete(`/servicios/${idServicioInvalido}`)
              .set("Authorization", `Bearer ${authToken}`)
              .end((err, res) => {
                expect(res.status).toBe(204);
                done();
              });
          });
      });
    });

    test("Si el usuario no es rol de administrador del hotel deberia fallar", (done) => {
      Servicio.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioPrueba1.username,
          email: usuarioPrueba1.email,
          name: usuarioPrueba1.name,
          lastname: usuarioPrueba1.lastname,
          password: bcrypt.hashSync(usuarioPrueba1.password, 10),
          rol: usuarioPrueba1.rol,
        })
          .save()
          .then((usuario) => {
            log.info("usuario de prueba creado");
          })
          .catch((err) => {
            log.error(err);
          });
        Servicio(servicioPrueba)
          .save()
          .then((servicio) => {
            idDeServicioExistenteEliminar = servicio._id;
          })
          .catch((err) => {
            log.error(err);
          });
        request(app)
          .post("/usuarios/login")
          .send({
            username: usuarioPrueba1.username,
            password: usuarioPrueba1.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            request(app)
              .delete(`/servicios/${idDeServicioExistenteEliminar}`)
              .set("Authorization", `Bearer ${authToken}`)
              .end((err, res) => {
                expect(res.status).toBe(400);
                done();
              });
          });
      });
    });

    test("Si el usuario es rol administrador de hotel y tiene un id valido deberia de eliminar el servicio", (done) => {
      Servicio.deleteMany({}, (err) => {
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
          })
          .catch((err) => {
            log.error(err);
          });
        Servicio(servicioPrueba)
          .save()
          .then((servicio) => {
            idDeServicioExistenteEliminar = servicio._id;
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
              .delete(`/servicios/${idDeServicioExistenteEliminar}`)
              .set("Authorization", `Bearer ${authToken}`)
              .end((err, res) => {
                expect(res.status).toBe(200);
                done();
              });
          });
      });
    });
  });
});
