import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { API_JWT_KEY } from "./../config.js";

const SALT_ROUNDS = 10;

export const generateHash = (password) => {
	return bcrypt.hash(password, SALT_ROUNDS);
};

export const isValidPassword = (password, hash) => {
	return bcrypt.compare(password, hash);
};

export const generateAccessToken = (user) => {
	let data = {
		exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8), //8 Hs
		//exp: Math.floor(Date.now() / 1000) + (1), //1 seg?
		data: ({...user})
	};
	return jwt.sign(data, API_JWT_KEY, { algorithm: "HS256" });
};

export const obtenerFechaHoraMySQL = () => {
	let ahora = new Date();
	let formattedDateTime = ahora.toISOString().slice(0, 19).replace('T', ' ');
	return formattedDateTime;
}

export const sumarDiasAFecha = (fechaString, dias) => {
	let fecha = new Date(fechaString);
	fecha.setDate(fecha.getDate() + dias);
	let nuevaFechaString = fecha.toISOString().slice(0, 19).replace('T', ' ');
	return nuevaFechaString;
};

export const obtenerFechaActual = () => {
	let fecha = new Date();
	let año = fecha.getFullYear();
	let mes = String(fecha.getMonth() + 1).padStart(2, '0');
	let día = String(fecha.getDate()).padStart(2, '0');
	return `${año}-${mes}-${día}`;
};