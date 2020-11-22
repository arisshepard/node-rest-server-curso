const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {
	let body = req.body;

	Usuario.findOne({ email: body.email }, (err, usuarioDb) => {
		if (err) {
			return generarError(res, 500, err);
		}

		if (!usuarioDb) {
			return generarError(res, 400, 'Usuario o contraseña incorrectos');
		}

		if (!bcrypt.compareSync(body.password, usuarioDb.password)) {
			return generarError(res, 400, 'Usuario o contraseña incorrectos');
		}

		generarRespuesta(usuarioDb, res);
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
		return generarError(res, 403, err);
	});

	Usuario.findOne({ email: googleUser.email }, (err, usuarioDb) => {
		if (err) {
			return generarError(res, 500, err);
		}

		if (usuarioDb) {
			if (usuarioDb.google === false) {
				return generarError(
					res,
					500,
					'Debe usar su autenticación normal (no Google)'
				);
			} else {
				// Si el usuario es de google, le renovamos el token
				generarRespuesta(usuarioDb, res);
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
					return generarError(res, 500, err);
				}
				generarRespuesta(usuarioDb, res);
			});
		}
	});
});

let generarRespuesta = (usuarioDb, res) => {
	let token = jwt.sign({ usuario: usuarioDb }, process.env.SEED, {
		expiresIn: process.env.CADUCIDAD_TOKEN,
	});

	return res.json({ ok: true, usuario: usuarioDb, token });
};

let generarError = (res, statusCode, text) => {
	return res.status(statusCode).json({
		ok: false,
		err: { message: text },
	});
};

module.exports = app;
