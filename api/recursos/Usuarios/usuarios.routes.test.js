let request = require("supertest");
let bcrypt = require("bcrypt");
let mongoose = require("mongoose");

let log = require("../../../utils/logger");
let Usuario = require("./usuarios.model");
let app = require("../../../index").app;
let server = require("../../../index").server;

let authToken;

let ejemplosUsuarios = [
  {
    username: "jtumax",
    email: "jtumax@gmail.com",
    name: "josue",
    lastname: "tumax",
    password: "ejemplo12",
    rol: "ROL_ADMINAPP",
  },
  {
    username: "ejemplo12",
    email: "ejemplo12@gmail.com",
    name: "juan",
    lastname: "sisi",
    password: "ejemplo7",
    rol: "ROL_CLIENT",
  },
  {
    username: "ejemplo14",
    email: "ejemplo14@gmail.com",
    name: "simon",
    lastname: "velasquez",
    password: "ejemplo9",
    rol: "ROL_CLIENT",
  },
];

let usuarioActualizar = {
  username: "ejemplo14",
  email: "ejemplo14@gmail.com",
  name: "simon",
  lastname: "velasquez",
  password: "ejemplo9",
  rol: "ROL_CLIENT",
};

let usuarioNoValido = {
  username: "ejemplo99",
  email: "ejemplo99@gmail.com",
  name: "fernando",
  lastname: "velasquez",
  password: "ejemplo99",
  rol: "ROL_CLIENT",
};

let nuevoUsuario = {
  username: "ejemplo12",
  email: "ejemplo12@gmail.com",
  name: "juan",
  lastname: "sisi",
};

let idDeUsuarioInvalido = "5ab8dbcc6539f91c2288b0c1";

let tokenInvalido =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmEzMjJiZGQ2NTRhN2RiZmNjNGUzMCIsImlhdCI6MTUyMjE1MTk3OSwiZXhwIjoxNTIyMjM4Mzc5fQ.AAtAAAAkYuAAAy9O-AA0sAkcAAAAqfXskJZxhGJuTIk";

function usuarioYaExistentenYAtributosCorrectos(usuario, done) {
  Usuario.find({ username: usuario.username })
    .then((usuarios) => {
      expect(usuarios).toBeInstanceOf(Array);
      expect(usuarios).toHaveLength(1);
      expect(usuarios[0].username).toEqual(usuario.username);
      expect(usuarios[0].email).toEqual(usuario.email);
      let iguales = bcrypt.compareSync(usuario.password, usuarios[0].password);
      expect(iguales).toBeTruthy();
      done();
    })
    .catch((err) => {
      done(err);
    });
}

async function usuarioNoExiste(usuario, done) {
  try {
    let usuarios = await Usuario.find().or([
      { username: usuario.username },
      { email: usuario.email },
    ]);
    expect(usuarios).toHaveLength(0);
    done();
  } catch (err) {
    done(err);
  }
}

describe("Usuarios", () => {
  beforeEach((done) => {
    Usuario.deleteMany({}, (err) => {
      done();
    });
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  describe("GET /usuarios", () => {
    it("Si no hay usuarios, deberia retornar un array vacio", (done) => {
      request(app)
        .get("/usuarios")
        .end((err, res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });

    it("Si existen usuarios, deberia de retornar un array", (done) => {
      Promise.all(
        ejemplosUsuarios.map((usuario) => new Usuario(usuario).save())
      ).then((usuarios) => {
        request(app)
          .get("/usuarios")
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body).toHaveLength(3);
            done();
          });
      });
    });
  });

  describe("POST /usuarios", () => {
    it("Un usuario que cumple las condiciones deberia ser creado y su validacion es correcta", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(ejemplosUsuarios[0])
          .end((err, res) => {
            expect(res.status).toBe(201);
            expect(typeof res.text).toBe("string");
            expect(res.text).toEqual("Usuario creado con exito");
            usuarioYaExistentenYAtributosCorrectos(ejemplosUsuarios[0], done);
          });
      });
    });

    it("Crear un usuario con un username ya registrado deberia fallar", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Promise.all(
          ejemplosUsuarios.map((usuario) => new Usuario(usuario).save())
        ).then((usuarios) => {
          request(app)
            .post("/usuarios/create")
            .send({
              username: "jtumax",
              email: "ftumax@gmail.com",
              name: "josue",
              lastname: "baquiax",
              password: "ejemplo1",
              rol: "ROL_ADMIN",
            })
            .end((err, res) => {
              expect(res.status).toBe(400);
              expect(typeof res.text).toBe("string");
              done();
            });
        });
      });
    });

    it("Crear un usuario con email ya registrado deberia fallar", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Promise.all(
          ejemplosUsuarios.map((usuario) => new Usuario(usuario).save())
        ).then((usuarios) => {
          request(app)
            .post("/usuarios/create")
            .send({
              username: "soyunejemplo",
              email: "ejemplo12@gmail.com",
              name: "ejemplo12",
              lastname: "ejemplodeltest",
              password: "testdelapp12",
              rol: "ROL_CLIENT",
            })
            .end((err, res) => {
              expect(res.status).toBe(409);
              expect(typeof res.text).toBe("string");
              done();
            });
        });
      });
    });

    it("Crear un usuario sin username deberia de fallar", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send({
            email: "ejemploparalaapp@gmail.com",
            name: "ejemploapp12",
            lastname: "solosoyunejemplo",
            password: "testparalaapp12",
            rol: "ROL_CLIENT",
          })
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    it("Crear un usuario sin password deberia de fallar", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send({
            username: "holasoyunejemplo12",
            email: "soyuncorreo@gmail.com",
            name: "ejemploapp12",
            lastname: "solosoyunejemplo",
            rol: "ROL_CLIENT",
          })
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    it("Crear un usuario sin email deberia de fallar", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send({
            username: "holasoyunejemplo12",
            name: "ejemploapp12",
            lastname: "solosoyunejemplo",
            password: "soylacontraseñadetest",
            rol: "ROL_CLIENT",
          })
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    it("Un usuario con un email no valido no deberia de ser creado", (done) => {
      let usuarioParaEjemplo = {
        username: "fernandotumax12",
        email: "@gmail.com",
        name: "juanito",
        lastname: "nono",
        password: "ejemplo7",
        rol: "ROL_CLIENT",
      };
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioParaEjemplo)
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    it("Un usuario con un username con menos de 3 caracteres no deberia de ser guardado", (done) => {
      let usuarioParaEjemplo = {
        username: "fer",
        email: "correocorrecto@gmail.com",
        name: "juanito",
        lastname: "nono",
        password: "ejemplo7",
        rol: "ROL_CLIENT",
      };
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioParaEjemplo)
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    it("Un usuario con un username con más de 30 caracteres no deberia de ser guardado", (done) => {
      let usuarioParaEjemplo = {
        username: "fernandotumax12".repeat(10),
        email: "correocorrecto@gmail.com",
        name: "juanito",
        lastname: "nono",
        password: "ejemplo7",
        rol: "ROL_CLIENT",
      };
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioParaEjemplo)
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    it("Un usuario con una password con menos de 6 caracteres no deberia de ser guardado", (done) => {
      let usuarioParaEjemplo = {
        username: "fernandotumax12",
        email: "correocorrecto@gmail.com",
        name: "juanito",
        lastname: "nono",
        password: "ejem",
        rol: "ROL_CLIENT",
      };
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioParaEjemplo)
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    it("Un usuario con una password con más de 200 caracteres no deberia de ser guardado", (done) => {
      let usuarioParaEjemplo = {
        username: "fernandotumax12",
        email: "correocorrecto@gmail.com",
        name: "juanito",
        lastname: "nono",
        password: "ejemplo7".repeat(80),
        rol: "ROL_CLIENT",
      };
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioParaEjemplo)
          .end((err, res) => {
            expect(res.status).toBe(400);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    it("El username, email, nombre y apellido de un usuario valido deben ser guardados con lowercase", (done) => {
      let usuarioParaEjemplo = {
        username: "FeRnAnDoTuMaX12",
        email: "correocorrecto@gmail.com",
        name: "JuAnItO",
        lastname: "nOnO",
        password: "ejemplo7",
        rol: "ROL_CLIENT",
      };
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioParaEjemplo)
          .end((err, res) => {
            expect(res.status).toBe(201);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });
  });

  describe("PUT /usuarios/:id", () => {
    let idDeUsuarioExistenteActualizar;
    beforeEach((done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario(usuarioActualizar)
          .save()
          .then((usuario) => {
            idDeUsuarioExistenteActualizar = usuario._id;
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
    });

    it("Tratar de obtener un usuario con id invalido deberia retornar un 400", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioActualizar)
          .end((err, res) => {
            expect(res.status).toBe(201);
            request(app)
              .post("/usuarios/login")
              .send({
                username: usuarioActualizar.username,
                password: usuarioActualizar.password,
              })
              .end((err, res) => {
                expect(res.status).toBe(200);
                authToken = res.body.token;
                request(app)
                  .put("/usuarios/123")
                  .set("Authorization", `Bearer ${authToken}`)
                  .end((err, res) => {
                    expect(res.status).toBe(400);
                    done();
                  });
              });
          });
      });
    });

    it("Tratar de actualizar un usuario que no existe deberia de retornar un 204", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioActualizar)
          .end((err, res) => {
            expect(res.status).toBe(201);
            request(app)
              .post("/usuarios/login")
              .send({
                username: usuarioActualizar.username,
                password: usuarioActualizar.password,
              })
              .end((err, res) => {
                expect(res.status).toBe(200);
                authToken = res.body.token;
                request(app)
                  .put(`/usuarios/${idDeUsuarioInvalido}`)
                  .set("Authorization", `Bearer ${authToken}`)
                  .send(nuevoUsuario)
                  .end((err, res) => {
                    expect(res.status).toBe(204);
                    done();
                  });
              });
          });
      });
    });

    it("El id del usuario no pertenece al usuario logeado no deberia actualizar", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario(usuarioActualizar)
          .save()
          .then((usuario) => {
            idDeUsuarioExistenteActualizar = usuario._id;
          })
          .catch((err) => {
            log.error(err);
          });
        request(app)
          .post("/usuarios/create")
          .send(usuarioNoValido)
          .end((err, res) => {
            expect(res.status).toBe(201);
            request(app)
              .post("/usuarios/login")
              .send({
                username: usuarioNoValido.username,
                password: usuarioNoValido.password,
              })
              .end((err, res) => {
                expect(res.status).toBe(200);
                authToken = res.body.token;
                request(app)
                  .put(`/usuarios/${idDeUsuarioExistenteActualizar}`)
                  .set("Authorization", `Bearer ${authToken}`)
                  .send(nuevoUsuario)
                  .end((err, res) => {
                    expect(res.status).toBe(400);
                    done();
                  });
              });
          });
      });
    });

    it("Si el id del usaurio son iguales y entrega el token valido, la actualizacion sera exitosa", (done) => {
      let usuarioActualizarCorrectamente = {
        username: "ejemplo14",
        email: "ejemplo14@gmail.com",
        name: "simon",
        lastname: "velasquez",
        password: "ejemplo9",
        rol: "ROL_CLIENT",
      };
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioActualizarCorrectamente.username,
          email: usuarioActualizarCorrectamente.email,
          name: usuarioActualizarCorrectamente.name,
          lastname: usuarioActualizarCorrectamente.lastname,
          password: bcrypt.hashSync(
            usuarioActualizarCorrectamente.password,
            10
          ),
          rol: usuarioActualizarCorrectamente.rol,
        })
          .save()
          .then((usuario) => {
            idDeUsuarioExistenteActualizar = usuario._id;
          })
          .catch((err) => {
            done(err);
          });
        request(app)
          .post("/usuarios/login")
          .send({
            username: usuarioActualizarCorrectamente.username,
            password: usuarioActualizarCorrectamente.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            request(app)
              .put(`/usuarios/${idDeUsuarioExistenteActualizar}`)
              .set("Authorization", `Bearer ${authToken}`)
              .send(nuevoUsuario)
              .end((err, res) => {
                expect(res.status).toBe(200);
                expect(typeof res.text).toBe("string");
                done();
              });
          });
      });
    });
  });

  describe("DELETE /usuarios/:id", () => {
    let idDeUsuarioExistenteEliminar;
    it("Tratar de obtener un usuario con id invalido deberia de retornar un 400", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioActualizar)
          .end((err, res) => {
            expect(res.status).toBe(201);
            request(app)
              .post("/usuarios/login")
              .send({
                username: usuarioActualizar.username,
                password: usuarioActualizar.password,
              })
              .end((err, res) => {
                expect(res.status).toBe(200);
                authToken = res.body.token;
                request(app)
                  .delete("/usuarios/123")
                  .set("Authorization", `Bearer ${authToken}`)
                  .end((err, res) => {
                    expect(res.status).toBe(400);
                    done();
                  });
              });
          });
      });
    });

    it("Tratar de eliminar un usuario que no existe deberia de retornar un 204", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        request(app)
          .post("/usuarios/create")
          .send(usuarioActualizar)
          .end((err, res) => {
            expect(res.status).toBe(201);
            request(app)
              .post("/usuarios/login")
              .send({
                username: usuarioActualizar.username,
                password: usuarioActualizar.password,
              })
              .end((err, res) => {
                expect(res.status).toBe(200);
                authToken = res.body.token;
                request(app)
                  .delete(`/usuarios/${idDeUsuarioInvalido}`)
                  .set("Authorization", `Bearer ${authToken}`)
                  .end((err, res) => {
                    expect(res.status).toBe(204);
                    done();
                  });
              });
          });
      });
    });

    it("Si el id no pertence con el usuario logeado que se quiere eliminar no se realiza la accion", (done) => {
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario(usuarioActualizar)
          .save()
          .then((usuario) => {
            idDeUsuarioExistenteEliminar = usuario._id;
          })
          .catch((err) => {
            log.error(err);
          });
        request(app)
          .post("/usuarios/create")
          .send(usuarioNoValido)
          .end((err, res) => {
            expect(res.status).toBe(201);
            request(app)
              .post("/usuarios/login")
              .send({
                username: usuarioNoValido.username,
                password: usuarioNoValido.password,
              })
              .end((err, res) => {
                expect(res.status).toBe(200);
                authToken = res.body.token;
                request(app)
                  .delete(`/usuarios/${idDeUsuarioExistenteEliminar}`)
                  .set("Authorization", `Bearer ${authToken}`)
                  .end((err, res) => {
                    expect(res.status).toBe(400);
                    done();
                  });
              });
          });
      });
    });

    it("Si el id del usuario son iguales y entrega el token valido, se eliminara correctamente su cuenta", (done) => {
      let usuarioEliminarCorrectamente = {
        username: "ejemplo14",
        email: "ejemplo14@gmail.com",
        name: "simon",
        lastname: "velasquez",
        password: "ejemplo9",
        rol: "ROL_CLIENT",
      };
      Usuario.deleteMany({}, (err) => {
        if (err) {
          done(err);
        }
        Usuario({
          username: usuarioEliminarCorrectamente.username,
          email: usuarioEliminarCorrectamente.email,
          name: usuarioEliminarCorrectamente.name,
          lastname: usuarioEliminarCorrectamente.lastname,
          password: bcrypt.hashSync(usuarioEliminarCorrectamente.password, 10),
          rol: usuarioEliminarCorrectamente.rol,
        })
          .save()
          .then((usuario) => {
            idDeUsuarioExistenteEliminar = usuario._id;
          })
          .catch((err) => {
            log.error(err);
          });
        request(app)
          .post("/usuarios/login")
          .send({
            username: usuarioEliminarCorrectamente.username,
            password: usuarioEliminarCorrectamente.password,
          })
          .end((err, res) => {
            expect(res.status).toBe(200);
            authToken = res.body.token;
            request(app)
              .delete(`/usuarios/${idDeUsuarioExistenteEliminar}`)
              .set("Authorization", `Bearer ${authToken}`)
              .end((err, res) => {
                expect(res.status).toBe(200);
                expect(typeof res.text).toBe("string");
                done();
              });
          });
      });
    });
  });
});
