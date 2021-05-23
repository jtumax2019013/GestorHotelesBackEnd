const Usuario = require("./usuarios.model");

function foundUser() {
  return Usuario.find({}).populate('bills').populate('history');
}

function createUser(user, hashedPassword) {
  return new Usuario({
    ...user,
    password: hashedPassword,
  }).populate('bills').populate('history').save();
}

function deleteUser(id) {
  return Usuario.findByIdAndRemove(id).populate('bills').populate('history');
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
  ).populate('bills').populate('history');
}

function setHotel(id, idHotel){
  return Usuario.findOneAndUpdate({_id: id}, {$push: {hotel }}).populate('bills').populate('history')
}

function setBills(id, idBills) {
  return Usuario.findOneAndUpdate(
    { _id: id },
    { $push: { bills: idBills } },
    { new: true }
  ).populate('bills').populate('history');
}

function setHistory(id, idHistory) {
  return Usuario.findOneAndUpdate(
    {
      _id: id,
    },
    { $push: { history: idHistory } },
    { new: true }
  ).populate('bills').populate('history');
}

function existingUser(username, email) {
  return new Promise((resolve, reject) => {
    Usuario.find()
      .or([{ username: username }, { email: email }]).populate('bills').populate('history')
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
    return Usuario.findOne({ username: username }).populate('bills').populate('history');
  }
  if (id) {
    return Usuario.findById(id).populate('bills').populate('history');
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
