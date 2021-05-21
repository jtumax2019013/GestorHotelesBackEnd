const Usuario = require("./usuarios.model");

function foundUser() {
  return Usuario.find({});
}

function createUser(user, hashedPassword) {
  return new Usuario({
    ...user,
    password: hashedPassword,
  }).save();
}

function deleteUser(id) {
  return Usuario.findByIdAndRemove(id);
}

function updateUser(id, user) {
  return Usuario.findOneAndUpdate(
    { _id: id },
    {
      ...user,
    },
    {
      new: true,
    }
  );
}

function setHotel(id, idHotel){
  return Usuario.findOneAndUpdate({_id: id}, {$push: {hotel }})
}

function setBills(id, idBills) {
  return Usuario.findOneAndUpdate(
    { _id: id },
    { $push: { bills: idBills } },
    { new: true }
  );
}

function setHistory(id, idHistory) {
  return Usuario.findOneAndUpdate(
    {
      _id: id,
    },
    { $push: { history: idHistory } },
    { new: true }
  );
}

function existingUser(username, email) {
  return new Promise((resolve, reject) => {
    Usuario.find()
      .or([{ username: username }, { email: email }])
      .then((usuarios) => {
        resolve(usuarios.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function foundOneUser({ username: username, id: id }){
  if (username) {
    return Usuario.findOne({ username: username });
  }
  if (id) {
    return Usuario.findById(id);
  }
  throw new Error(
    "Funcion obtener usuarios del controlador fue llamado sin especificar el username o id"
  );
}

function foundUserAdminHotel(){
    return Usuario.find({rol: "ROL_ADMINHOTEL"})
}

module.exports = {
  createUser,
  foundUser,
  foundOneUser,
  deleteUser,
  updateUser,
  existingUser,
  setHistory,
  setBills,
  foundUserAdminHotel
};
