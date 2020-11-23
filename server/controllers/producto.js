const express = require('express');
const Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/autenticacion');
const _ = require('underscore');

const app = express();

// ===========================
// Obtener productos disponibles
// ===========================
app.get('/productos', verificaToken, (req, res) => {
	// populate: usuario, categoria
	// paginado
	let limite = req.query.limite || 10;
	let desde = req.query.desde || 0;

	desde = Number(desde);
	limite = Number(limite);

	Producto.find({ disponible: true })
		.skip(desde)
		.limit(limite)
		.populate('usuario', 'nombre email')
		.populate('categoria', 'descripcion')
		.exec((err, productos) => {
			if (err) {
				return res.status(500).json({ ok: false, err });
			}

			res.json({ ok: true, productos });
		});
});

// ===========================
// Obtener un producto por ID
// ===========================
app.get('/productos/:id', verificaToken, (req, res) => {
	// populate: usuario, categoria
	const id = req.params.id;

	Producto.findById(id)
		.populate('usuario', 'nombre email')
		.populate('categoria', 'descripcion')
		.exec((err, productoDB) => {
			gestionarRespuesta(err, res, productoDB);
		});
});

// ===========================
// Buscar productos
// ===========================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
	const termino = req.params.termino;
	let regex = new RegExp(termino, 'i');

	Producto.find({ nombre: regex })
		.populate('categoria', 'nombre')
		.exec((err, productos) => {
			if (err) {
				return res.status(500).json({ ok: false, err });
			}

			res.json({ ok: true, productos });
		});
});

// ===========================
// Crear un producto
// ===========================
app.post('/productos', verificaToken, (req, res) => {
	// grabar el usuario
	// grabar una categoria
	const body = req.body;

	const producto = new Producto({
		nombre: body.nombre,
		descripcion: body.descripcion,
		precioUni: body.precioUni,
		categoria: body.categoria,
		usuario: req.usuario._id,
	});

	producto.save((err, productoDB) => {
		gestionarRespuesta(err, res, productoDB);
	});
});

// ===========================
// Actualizar un producto
// ===========================
app.put('/productos/:id', verificaToken, (req, res) => {
	// grabar el usuario
	// grabar una categoria
	const id = req.params.id;
	const body = req.body;
	const parametros = {
		nombre: body.nombre,
		descripcion: body.descripcion,
		precioUni: body.precioUni,
		categoria: body.categoria,
		disponible: body.disponible,
		usuario: req.usuario._id,
	};

	// Forma profesor

	// Producto.findById(id, (err, productoDB) => {
	// 	if (err) {
	// 		return res.status(500).json({ ok: false, err });
	// 	}

	// 	if (!productoDB) {
	// 		return res
	// 			.status(400)
	// 			.json({ ok: false, message: 'El producto no existe' });
	// 	}

	// 	productoDB.nombre = productoDB.nombre;
	// 	productoDB.descripcion = productoDB.descripcion;
	// 	productoDB.categoria = productoDB.categoria;
	// 	productoDB.precioUni = productoDB.precioUni;
	// 	productoDB.disponible = productoDB.disponible;

	// 	productoDB.save((err, productoGuardado) => {
	// 		if (err) {
	// 			return res.status(500).json({ ok: false, err });
	// 		}

	// 		res.json({ ok: true, producto: productoGuardado });
	// 	});
	// });

	Producto.findByIdAndUpdate(
		id,
		parametros,
		{ new: true, runValidators: true },
		(err, productoDB) => {
			gestionarRespuesta(err, res, productoDB);
		}
	);
});

// ===========================
// Borrar un producto
// ===========================
app.delete('/productos/:id', verificaToken, (req, res) => {
	// disponible = false
	const id = req.params.id;
	const cambiaDisponible = {
		disponible: false,
	};

	Producto.findByIdAndUpdate(id, cambiaDisponible, (err, productoBorrado) => {
		if (err) {
			return res.status(500).json({ ok: false, err });
		}

		if (!productoBorrado) {
			return res
				.status(400)
				.json({ ok: false, message: 'No existe el producto' });
		}

		res.json({ ok: true, message: 'Producto borrado correctamente' });
	});
});

let gestionarRespuesta = (err, res, productoDB) => {
	if (err) {
		return res.status(500).json({ ok: false, err });
	}

	if (!productoDB) {
		return res
			.status(400)
			.json({ ok: false, message: 'No existe el producto' });
	}

	res.json({ ok: true, producto: productoDB });
};

module.exports = app;
