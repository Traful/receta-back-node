import { query } from "./../db/db.js";

export const getPlanes = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		let results = await query("SELECT pl.* FROM rec_obrasoc_plan pl ORDER BY pl.plan");
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

export const getPlanesByIdObraSocial = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		let { idObraSocial } = req.params;
		let results = await query(`SELECT pl.* FROM rec_obrasoc_plan pl WHERE pl.id_obrasoc = ${idObraSocial} ORDER BY pl.plan`);
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