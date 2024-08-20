import crypto from "crypto";
import { query } from "./../db/db.js";
import Validate from "./../utils/validate.js";
import { generateHash, isValidPassword, generateAccessToken } from "./../utils/funcs.js";

export const getUsers = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	let results = await query("SELECT * FROM users");
	console.log(results);
	res.json({ msg: "Get Users"});
};

export const getEspecialidadesByMatricula = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	let { matricula } = req.params;

	try {
		let sql = `
			SELECT
				c.apellido,
				c.nombre,
				c.matricula,
				b.denominacion,
				a.matricula_especialista,
				a.fecha_especialista,
				a.fecha_vencimiento,
				a.libro_tomo,
				a.libro_folio,
				a.cantidad_renovacion
			FROM tmp_especialistas a
			INNER JOIN tmp_especialidades b ON
				b.especialidad = a.especialidad
			INNER JOIN tmp_person c ON
				c.matricula = a.matricula
			WHERE
				a.matricula = ?
				AND a.tipo_especialidad = 1
				AND STR_TO_DATE(a.fecha_vencimiento, '%d/%m/%Y') > CURDATE()
		`;
		let results = await query(sql, [matricula]);
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

export const logIn = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	let valid = new Validate(null);
	let verificar = {
		matricula: {
			type: "string"
		},
		password:  {
			type: "string"
		}
	};

	valid.validar(req.body, verificar);
	if(valid.hasErrors()) {
		res.status(409).json(valid.getErrors());
		return;
	}

	let { matricula, password } = req.body;

	try {
		let sql = `
			SELECT
				TRUNCATE((m.matricula / 10), 0) AS matr,
				m.matricula,
				p.persona,
				u.tipo_user,
				m.situacion,
				CASE
					WHEN m.rematriculado IS NULL THEN 'S'
					WHEN m.rematriculado = '' THEN 'S'
					ELSE 'N'
				END AS rematriculado,
				p.apellido,
				p.nombre,
				p.nro_documento,
				p.sexo
			FROM usuarios u
			LEFT JOIN tmp_matriculados m ON
				m.matricula = u.mat_id
			LEFT JOIN tmp_person p ON
				p.persona = m.persona
			WHERE
				SUBSTR(u.mat_id, 1, (LENGTH(u.mat_id) - 1)) = ?
				AND u.usu_clave = ?
		`;
		let contramd5 = crypto.createHash("md5").update(password + "contra").digest("hex");
		let results = await query(sql, [matricula, contramd5]);
		if(results.data.length > 0) {
			let user = results.data[0];
			if(user.rematriculado === 'S') {
				// --> Arreglo especial para médicos que trabajan para la Municipalidad (Obra social 156)
				let verifMuni = await query("SELECT * FROM rec_obrasoc_medico WHERE idobrasocial = 156 AND matric = ?", [user.matricula]); //AND activo = 1??
				if(verifMuni.data.length > 0) {
					let dataDias = verifMuni.data[0];
					let fechaActual = new Date();
					let dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
					let diaSemana = fechaActual.getDay();
					let puede = parseInt(dataDias[dias[diaSemana]], 10) === 1;
					user.muni = {
						esmunicipal: true,
						puedehoy: puede
					}
				} else {
					user.muni = {
						esmunicipal: false,
						puedehoy: false
					}
				}
				// <-- End Arreglo especial para médicos que trabajan para la Municipalidad
				let token = generateAccessToken(user);
				resp.data = ({...user, token: token});
			} else {
				resp.ok = false;
				resp.msg = "La matrícula no se encuentra habilitada.";
			}
		} else {
			resp.ok = false;
			resp.msg = "La matrícula y/o contraseña no es válida.";
		}
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