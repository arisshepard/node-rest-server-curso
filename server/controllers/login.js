const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {
	let body = req.body;

	Usuario.findOne({ email: body.email }, (err, usuarioDb) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err: err,
			});
		}

		if (!usuarioDb) {
			return res.status(400).json({
				ok: false,
				err: { message: 'Usuario o contraseña incorrectos' },
			});
		}

		if (!bcrypt.compareSync(body.password, usuarioDb.password)) {
			return res.status(400).json({
				ok: false,
				err: { message: 'Usuario o (contraseña) incorrectos' },
			});
		}

		// expires in 30 days
		let token = jwt.sign({ usuario: usuarioDb }, process.env.SEED, {
			expiresIn: process.env.CADUCIDAD_TOKEN,
		});

		res.json({ ok: true, usuario: usuarioDb, token: token });
	});
});

// Configuraciones de Google
async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();

	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true,
	};

	// const userid = payload['sub'];
	// If request specified a G Suite domain:
	// const domain = payload['hd'];
}
// verify().catch(console.error);

app.post('/google', async (req, res) => {
	let token = req.body.idtoken;

	let googleUser = await verify(token).catch((err) => {
		return res.status(403).json({ ok: false, err: err });
	});

	Usuario.findOne({ email: googleUser.email }, (err, usuarioDb) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				err: err,
			});
		}

		if (usuarioDb) {
			if (usuarioDb.google === false) {
				return res.status(400).json({
					ok: false,
					err: { message: 'Debe usar su autenticación normal (no Google)' },
				});
			} else {
				// Si el usuario es de google, le renovamos el token
				let token = jwt.sign({ usuario: usuarioDb }, process.env.SEED, {
					expiresIn: process.env.CADUCIDAD_TOKEN,
				});

				return res.json({ ok: true, usuario: usuarioDb, token });
			}
		} else {
			// The user doesn't exists in the db
			let usuario = new Usuario();

			usuario.nombre = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = true;
			usuario.password = ':)';

			usuario.save((err, usuarioDb) => {
				if (err) {
					return res.status(500).json({
						ok: false,
						err: err,
					});
				}

				let token = jwt.sign({ usuario: usuarioDb }, process.env.SEED, {
					expiresIn: process.env.CADUCIDAD_TOKEN,
				});

				// console.log('Hello');

				return res.json({ ok: true, usuario: usuarioDb, token });
			});
		}
	});

	// res.json({ usuario: googleUser });
});

module.exports = app;
