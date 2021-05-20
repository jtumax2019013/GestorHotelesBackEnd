const Factura = require("./factura.model");

function foundBill() {
  return Factura.find({});
}

function setBill(bill, user) {
  return Factura({
    ...bill,
    usuarioAPagar: user,
  }).save();
}

function foundOneBill({ id: id }) {
  if (id) {
    return Factura.findById(id);
  }
}

module.exports = {
  foundBill,
  setBill,
  foundOneBill,
};
