const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
	descripcion: {
		type: String,
		unique: true,
		required: [true, 'La descripción es obligatoria'],
	},
	usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
});

// Para quitar el usuario al devolver una categoría
// categoriaSchema.methods.toJSON = function () {
// 	let categoria = this;
// 	let categoriaObject = categoria.toObject();

// 	delete categoriaObject.usuario;

// 	return categoriaObject;
// };

categoriaSchema.plugin(uniqueValidator, {
	message: '{PATH} debe ser única',
});

module.exports = mongoose.model('Categoria', categoriaSchema);
