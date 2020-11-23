const express = require('express');

let {
	verificaToken,
	verificaAdmin_Role,
} = require('../middlewares/autenticacion');

const app = express();

const Categoria = require('../models/categoria');

// ================================
// Mostrar todas las categorias
// ================================
app.get('/categoria', verificaToken, (req, res) => {
	let desde = Number(req.query.desde || 0);

	let limite = Number(req.query.limite || 5);

	Categoria.find()
		.sort('descripcion')
		.skip(desde)
		.limit(limite)
		.populate('usuario', 'nombre email')
		.exec((err, categorias) => {
			if (err) {
				return generarError(res, 500, err.message);
			}

			Categoria.countDocuments({}, (err, count) => {
				if (err) {
					return generarError(res, 500, err.message);
				}

				res.json({ ok: true, categorias, total: count });
			});
		});
});

// ================================
// Mostrar una categoria por ID
// ================================
app.get('/categoria/:id', verificaToken, (req, res) => {
	let id = req.params.id;

	Categoria.findById(id, (err, categoria) => {
		if (err) {
			return generarError(res, 500, err.message);
		}

		if (!categoria) {
			return generarError(res, 400, 'No se encontró la categoría');
		}

		res.json({ ok: true, categoria });
	});
});

// ================================
// Crear una categoría
// ================================
app.post('/categoria', verificaToken, (req, res) => {
	// regresa la nueva categoría
	// req.usuario._id
	let body = req.body;

	let categoria = new Categoria({
		descripcion: body.descripcion,
		usuario: req.usuario._id,
	});

	// Usuario.findById(usuario, (err, usuarioDb) => {
	// 	if (err) {
	// 		return generarError(res, 500, err.message);
	// 	}

	// 	if (!usuarioDb) {
	// 		return generarError(res, 400, 'No existe el usuario');
	// 	}
	// });

	categoria.save((err, categoriaDb) => {
		if (err) {
			return generarError(res, 500, err.message);
		}

		res.json({ ok: true, categoria: categoriaDb });
	});
});

// ================================
// Actualizar una categoría
// ================================
app.put('/categoria/:id', verificaToken, (req, res) => {
	let id = req.params.id;
	let body = req.body;
	let desCategoria = { descripcion: body.descripcion };

	Categoria.findByIdAndUpdate(
		id,
		desCategoria,
		{ new: true, runValidators: true, context: 'query' },
		(err, categoriaDb) => {
			if (err) {
				return generarError(res, 500, err.message);
			}

			res.json({ ok: true, categoria: categoriaDb });
		}
	);
});

// ================================
// Borrar una categoría
// ================================
app.delete(
	'/categoria/:id',
	[verificaToken, verificaAdmin_Role],
	(req, res) => {
		// Solo un admin puede borrar una categoria
		// Eliminación física

		let id = req.params.id;

		Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
			if (err) {
				return generarError(res, 500, err.message);
			}

			if (!categoriaBorrada) {
				return generarError(res, 400, 'No existe la categoría.');
			}

			res.json({ ok: true, message: 'Categoría borrada' });
		});
	}
);

let generarError = (res, statusCode, text) => {
	return res.status(statusCode).json({ ok: false, message: text });
};

module.exports = app;
