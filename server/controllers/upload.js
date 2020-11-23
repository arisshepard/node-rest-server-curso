const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function (req, res) {
	let tipo = req.params.tipo;
	let id = req.params.id;

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).json({
			ok: false,
			err: { message: 'No se ha seleccionado ningún archivo' },
		});
	}

	// Validar tipo
	let tiposValidos = ['productos', 'usuarios'];
	if (tiposValidos.indexOf(tipo) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message: 'Los tipos permitidos son: ' + tiposValidos.join(', '),
				tipo,
			},
		});
	}

	// extensiones permitidas
	let archivo = req.files.archivo;
	let nombreCortado = archivo.name.split('.');
	let extensionArchivo = nombreCortado[nombreCortado.length - 1];
	let extensionesPermitidas = ['png', 'jpg', 'gif', 'jpeg'];

	if (extensionesPermitidas.indexOf(extensionArchivo) < 0) {
		return res.status(400).json({
			ok: false,
			err: {
				message:
					'Las extensiones permitidas son: ' + extensionesPermitidas.join(', '),
				ext: extensionArchivo,
			},
		});
	}

	// Cambiar nombre al archivo
	let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

	// Use the mv() method to place the file somewhere on your server
	archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
		if (err) return res.status(500).json({ ok: false, err });

		// res.json({ ok: true, message: 'Se subió el fichero correctamente' });
		if (tipo === 'usuarios') {
			imagenUsuario(id, res, nombreArchivo, tipo);
		} else {
			imagenProducto(id, res, nombreArchivo, tipo);
		}
	});
});

let imagenUsuario = (id, res, nombreArchivo, tipo) => {
	Usuario.findById(id, (err, usuarioDb) => {
		if (err) {
			borrarArchivo(nombreArchivo, tipo);

			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!usuarioDb) {
			borrarArchivo(nombreArchivo, tipo);

			return res.status(400).json({
				ok: false,
				err: { message: 'Usuario no existe' },
			});
		}

		borrarArchivo(usuarioDb.img, tipo);

		usuarioDb.img = nombreArchivo;
		usuarioDb.save((err, usuarioGuardado) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			res.json({ ok: true, usuario: usuarioGuardado, img: nombreArchivo });
		});
	});
};

let imagenProducto = (id, res, nombreArchivo, tipo) => {
	Producto.findById(id, (err, productoDb) => {
		if (err) {
			borrarArchivo(nombreArchivo, tipo);

			return res.status(500).json({
				ok: false,
				err,
			});
		}

		if (!productoDb) {
			borrarArchivo(nombreArchivo, tipo);

			return res.status(400).json({
				ok: false,
				err: { message: 'Producto no existe' },
			});
		}

		borrarArchivo(productoDb.img, tipo);

		productoDb.img = nombreArchivo;
		productoDb.save((err, productoGuardado) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					err,
				});
			}

			res.json({ ok: true, producto: productoGuardado, img: nombreArchivo });
		});
	});
};

let borrarArchivo = (nombreImagen, tipo) => {
	let pathImagen = path.resolve(
		__dirname,
		`../../uploads/${tipo}/${nombreImagen}`
	);

	if (fs.existsSync(pathImagen)) {
		fs.unlinkSync(pathImagen);
	}
};

module.exports = app;
