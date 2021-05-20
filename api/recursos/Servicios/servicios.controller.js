const Servicio = require('./servicios.model')

function foundServices(){
    return Servicio.find({})
}

function createServices(service){
    return new Servicio({
        ...service
    }).save();
}

function deleteServices(id){
    return Servicio.findByIdAndRemove(id);
}

function foundOneService({id: id}){
    if(id){
        return Servicio.findById(id);
    }
    throw new Error('Funcion obtener servicio del controlador fue llamado sin especificar el id')
}

module.exports = {
    foundServices,
    createServices,
    deleteServices,
    foundOneService
}