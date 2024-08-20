import { query } from "./../db/db.js";

export const getObrasSociales = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		let results = await query("SELECT ro.* FROM rec_obrasoc ro ORDER BY ro.sigla");
		resp.data = results.data;
	} catch(error) {
		console.error(error.message);
		resp = {
			ok: false,
			msg: "Ocurrió un error al procesar la solicitud.",
			data: null,
			errores: [error.message]
		};
	}
	
	res.status(resp.ok ? 200 : 409).json(resp);
};

export const getLugaresAtencion = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		let results = await query("SELECT ml.idctro, ml.centrosalud FROM muni_lugar ml");
		resp.data = results.data;
	} catch(error) {
		console.error(error.message);
		resp = {
			ok: false,
			msg: "Ocurrió un error al procesar la solicitud.",
			data: null,
			errores: [error.message]
		};
	}
	
	res.status(resp.ok ? 200 : 409).json(resp);
};