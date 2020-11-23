// ===========================
// Puerto
// ===========================
process.env.PORT = process.env.PORT || 3000;

// ===========================
// Entorno
// ===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===========================
// Vencimiento token
// ===========================
// 60 segundos
// 60 munutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = '48h';

// ===========================
// Authentication seed
// ===========================
process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';

// ===========================
// Base de datos
// ===========================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
	urlDB = 'mongodb://localhost:27017/cafe';
} else {
	urlDB = process.env.MONGO_URI;
}

console.log('La URL seleccionada: ', urlDB);

process.env.URLDB = urlDB;

// ===========================
// GOOGLE CLIENT ID
// ===========================
process.env.CLIENT_ID =
	process.env.CLIENT_ID ||
	'289268215414-6gbccmg3q0vrqut0le6vofbe3dupg9td.apps.googleusercontent.com';
