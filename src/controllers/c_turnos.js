import { query } from "./../db/db.js";
import Validate from "./../utils/validate.js";
import { obtenerFechaHoraMySQL } from "../utils/funcs.js";

export const getTurnos = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};
	let sql = `
		SELECT
			t.*,
			CONCAT(p.apellido, ' ', p.nombre) AS p_fullname
		FROM turnos t
		LEFT JOIN rec_paciente p ON
			p.id = t.idPaciente
	`;
	let results = await query(sql); //"SELECT * FROM turnos"
	resp = { ...resp, ...results };
	res.status(resp.ok ? 200 : 409).json(resp);
};

export const setTurno = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	let valid = new Validate(null);
	let verificar = {
		idPaciente: { type: "number", min: 1 },
		descripcion: { type: "string", min: 1 },
		fechaHoraTurno: { type: "string", min: 18 },
		fechaHoraFinTurno: { type: "string", min: 18 },
		idObraSocial: { type: "number", min: 1 },
		color: { type: "string", min: 3 }
	};

	valid.validar(req.body, verificar);
	if(valid.hasErrors()) {
		res.status(409).json(valid.getErrors());
		return;
	}

	let ahora = obtenerFechaHoraMySQL();
	let { idPaciente, descripcion, fechaHoraTurno, fechaHoraFinTurno, idObraSocial, color } = req.body;

	let sql = `
		INSERT INTO turnos
		(idMedico, idPaciente, fechaHoraGeneracion, ipOperador, descripcion, fechaHoraTurno, fechaHoraFinTurno, idObraSocial, color, estado)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente');
	`;
	let results = await query(sql, [req.user.data.matricula, idPaciente, ahora, req.ip, descripcion, fechaHoraTurno, fechaHoraFinTurno, idObraSocial, color]);
	resp = { ...resp, ...results };
	res.status(resp.ok ? 200 : 409).json(resp);
};