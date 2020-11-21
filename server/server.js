require('./config/config');
require('colors');

const express = require('express');
const app = express();

// Mongo DB connection
const mongoose = require('mongoose');

// Para el cuerpo del JSON
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// controllers
// app.use(require('./controllers/usuario'));
// app.use(require('./controllers/login'));
app.use(require('./controllers/index'));

console.log(`Cadena de conexión: ${process.env.URLDB.yellow}`.grey);

// DB connection
mongoose.connect(
	// 'mongodb://localhost:27017/cafe',
	process.env.URLDB,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	},
	(err, res) => {
		if (err) throw err;
		console.log('Base de datos ONLINE'.green);
	}
);

// LISTEN
app.listen(process.env.PORT, () =>
	console.log(`Servidor escuchando puerto ${process.env.PORT.yellow}`.grey)
);
