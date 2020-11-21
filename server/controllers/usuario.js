const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const {
	verificaToken,
	verificaAdmin_Role,
} = require('../middlewares/autenticacion');

// DELETE
// borrar registro físicamente
// app.delete('/usuario/:id', function (req, res) {
// 	let id = req.params.id;
// 	Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
// 		if (err) {
// 			return res.status(400).json({
// 				ok: false,
// 				err: err,
// 			});
// 		}

// 		if (!usuarioBorrado) {
// 			return res.status(400).json({
// 				ok: false,
// 				err: { message: 'Usuario no encontrado' },
// 			});
// 		}

// 		res.json({ ok: true, usuario: usuarioBorrado });
// 	});
// });

// borrado lógico
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
	let id = req.params.id;
	let cambiaEstado = {
		estado: false,
	};
	Usuario.findByIdAndUpdate(
		id,
		cambiaEstado,
		{ new: true },
		(err, usuarioBorrado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err: err,
				});
			}

			if (!usuarioBorrado) {
				return res.status(400).json({
					ok: false,
					err: { message: 'Usuario no encontrado' },
				});
			}

			res.json({ ok: true, usuario: usuarioBorrado });
		}
	);
});

// GET
app.get('/usuario', verificaToken, (req, res) => {
	// return res.json({
	// 	usuario: req.usuario,
	// 	nombre: req.usuario.nombre,
	// 	email: req.usuario.email,
	// });

	let desde = Number(req.query.desde || 0);

	let limite = Number(req.query.limite || 5);
	// let desde = req.query.desde || 0;

	let condicion = { estado: true };

	Usuario.find(condicion, 'nombre email role estado google img')
		.skip(desde)
		.limit(limite)
		.exec((err, usuarios) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err: err,
				});
			}

			Usuario.count(condicion, (err, count) => {
				res.json({ ok: true, usuarios, total: count });
			});
		});
	// res.json('get usuario');
});

// POST
app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {
	let body = req.body;

	let usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		role: body.role,
	});

	usuario.save((err, usuarioDB) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				err: err,
			});
		}

		res.json({ ok: true, usuario: usuarioDB });
	});
});

// PUT
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
	let id = req.params.id;
	let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

	// usuario.findById(id, (err, usuarioDB) => {
	// 	usuarioDB.save();
	// });

	Usuario.findByIdAndUpdate(
		id,
		body,
		{ new: true, runValidators: true },
		(err, usuarioDB) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					err: err,
				});
			}
			res.json({ ok: true, usuario: usuarioDB });
		}
	);

	// res.json({ id });
});

module.exports = app;
