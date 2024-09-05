import { query } from "./../db/db.js";
import { addReceta, addAuditoria, addMuniExcepcion, cargarTodosLosMedicamentos } from "./helpers/utils.js";
import { sendToFarmaLink } from "./helpers/farmalink.js";
import Validate from "../utils/validate.js";
import { obtenerFechaHoraMySQL, sumarDiasAFecha } from "../utils/funcs.js";

export const getPacienteById = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null
	};
	let { id } = req.params;
	try {
		let sql = "SELECT p.* FROM rec_paciente p WHERE p.id = ?"
		let results = await query(sql, [id]);
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

export const getPacienteByDni = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null
	};
	let { dni } = req.params;
	try {
		let sql = "SELECT p.* FROM rec_paciente p WHERE p.dni = ?"
		let results = await query(sql, [dni]);
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

export const getRecetas = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null
	};
	let { dni, fdesde, fhasta } = req.params;
	try {
		let sql = `
			SELECT
				r.idobrasocafiliado,
				tp.matricula,
				r.idreceta,
				r.fechaemision,
				tp.apellido,
				tp.nombre,
				r.diagnostico
			FROM rec_receta r
			INNER JOIN rec_paciente p ON
				p.id = r.idpaciente
			INNER JOIN tmp_person tp ON
				tp.matricula = r.matricprescr
			WHERE
				r.estado IS NULL
		`;
		if(dni) sql += ` AND p.dni = ${dni}`;
		if(fdesde) sql += ` AND DATE(r.fechaemision) BETWEEN '${fdesde}' AND '${fhasta}'`;
		sql += " ORDER BY r.idreceta DESC";
		let results = await query(sql);
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

export const getCertificados = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null
	};
	let { dni, fdesde, fhasta } = req.params;
	try {
		let sql = `
			SELECT
				b.idestudio,
				b.id_encriptado,
				CONCAT(p.apellido, ' ', p.nombre) AS apeNom,
				p.dni,
				CONCAT(tp.apellido, ' ', tp.nombre) AS medNom,
				b.matricprescr,
				b.diagnostico,
				b.fechaemision
			FROM cert_cabecera b
			INNER JOIN rec_paciente p ON
				p.id = b.idpaciente
			INNER JOIN tmp_person tp ON
				tp.matricula = b.matricprescr
			WHERE
				b.idestudio > 0
		`;
		if(dni) sql += ` AND p.dni = ${dni}`;
		if(fdesde) sql += ` AND DATE(b.fechaemision) BETWEEN '${fdesde}' AND '${fhasta}'`;
		sql += " ORDER BY b.idestudio DESC";
		let results = await query(sql);
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

export const getEstudios = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null
	};
	let { dni, fdesde, fhasta } = req.params;
	try {
		let sql = `
			SELECT
				b.idestudio,
				b.id_encriptado,
				CONCAT(p.apellido, ' ', p.nombre) AS apeNom,
				p.dni,
				CONCAT(tp.apellido, ' ', tp.nombre) AS medNom,
				b.matricprescr,
				b.diagnostico,
				b.fechaemision
			FROM est_receta b
			INNER JOIN rec_paciente p ON
				p.id = b.idpaciente
			INNER JOIN tmp_person tp ON
				tp.matricula = b.matricprescr
			WHERE
				b.idestudio > 0
		`;
		if(dni) sql += ` AND p.dni = ${dni}`;
		if(fdesde) sql += ` AND DATE(b.fechaemision) BETWEEN '${fdesde}' AND '${fhasta}'`;
		sql += " ORDER BY b.idestudio DESC";
		let results = await query(sql);
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

export const setReceta = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	let valid = new Validate(null);
	let verificar = {
		idespecialidad: { type: "number", min: 1 },
		idpaciente: { type: "number", min: 1 },
		//talla: { type: "number", min: 1 },
		//peso: { type: "number", min: 1 },
		//email: { type: "string", isValidMail: true },
		//telefono: { type: "string" },
		idobrasocial: { type: "number", min: 1 },
		idlugaratencion: { type: "number", min: 1 },
		//nromatriculadoc: { type: "string" },
		tipoplan: { type: "number", min: 1 },
		timetratamiento: { type: "number", min: 1 },
		motexcepcion: { type: "string" },
		diagnostico: { type: "string", min: 5 },
		//identreservada: { type: "boolean" },
		tolerancia: { type: "string" },
		medicamentos: { type: "array", min: 1 }
	};

	valid.validar(req.body, verificar);
	if(valid.hasErrors()) {
		res.status(409).json(valid.getErrors());
		return;
	}

	//Faltan otras validaciones acá y posible ajuste de datos

	//await query("TRUNCATE TABLE rec_receta");
	//await query("TRUNCATE TABLE rec_auditoria");
	//await query("TRUNCATE TABLE rec_prescrmedicamento");
	//await query("TRUNCATE TABLE muni_excep");

	try {
		//Determinar si la obra social valida las recetas
		let results = await query("SELECT os.id_validador, os.cod_validador FROM rec_obrasoc os WHERE os.id = ?", [req.body.idobrasocial]);
		let { id_validador, cod_validador } = results.data[0];

		let ahora = obtenerFechaHoraMySQL();
		let matricula = req.user.data.matricula;
		let { timetratamiento, idespecialidad, idpaciente, idobrasocial, idlugaratencion, diagnostico, tolerancia, identreservada, medicamentos, motexcepcion, telefono } = req.body;

		if(parseInt(idobrasocial, 10) !== 156 ) { //Si no es la obra social de municipio no se guarda lugar de atención
			idlugaratencion = null;
		}

		let primerIdReceta = null;
		let IdAuditoria = null;
		
		let renglones = medicamentos.length;
		if(parseInt(timetratamiento, 10) === 1) renglones = medicamentos.filter(m => parseInt(m.conidcion, 10) === 2).length;

		let recetasIds = []; //Para generar PDF

		for(let i = 0; i < timetratamiento; i++) {
			let values = [ahora, req.ip, matricula, idespecialidad, idpaciente, idobrasocial, idlugaratencion, diagnostico, tolerancia, identreservada];
			let ultimoId = await addReceta(values);

			if(ultimoId) {
				recetasIds.push(ultimoId); //Para generar PDF

				// Auditoria
				if(i === 0) {
					primerIdReceta = ultimoId;
					let valuesAuditoria = [idpaciente, matricula, idespecialidad, ahora, idobrasocial, timetratamiento, renglones, primerIdReceta];
					IdAuditoria = await addAuditoria(valuesAuditoria);
				} else {
					let sql = `UPDATE rec_auditoria SET idreceta${i + 1} = ? WHERE id = ?`;
					await query(sql, [ultimoId, IdAuditoria]);
				}
				// Fin Auditoria
				
				// Obra Social 156 Excepcion
				if(parseInt(idobrasocial, 10) === 156) {
					await addMuniExcepcion([ultimoId, idpaciente, motexcepcion, telefono]);
					/*
					Este Update de los datos del paciente que solo ocurre con la OS 156 y que solo considera el telefono debería revisarse!!!!
					$sql = "UPDATE rec_paciente SET telefono = :nrocelular WHERE idpaciente = :idpaciente";
					$sql = $conexionre->prepare($sql);
					$sql->bindParam(':nrocelular', $celular, PDO::PARAM_STR);
					$sql->bindParam(':idpaciente', $idpaciente, PDO::PARAM_INT);
					$sql->execute();
					*/
				}
				// Fin Obra Social 156 Excepcion

				// Carga de medicamentos (tantas veces como recetas se generen 1 x 1)
				await cargarTodosLosMedicamentos(ultimoId, idobrasocial, medicamentos);
				// Fin Carga de medicamentos (tantas veces como recetas se generen)

				// Envío a Farmalink
				if(id_validador) {
					await sendToFarmaLink(ultimoId);
				}
				// Fin Envío a Farmalink

				ahora = sumarDiasAFecha(ahora, 30); //Se le suman 30 días por cada mes de tratamiento
			} else {
				resp.ok = false;
				resp.msg = "Ocurrión un error al cargar los datos de la prescripcion.";
			}
		}

		//await generarPdfDeNuevaReceta(recetasIds);

		resp.data = null;
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

export const setEstudio = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	let valid = new Validate(null);
	let verificar = {
		idespecialidad: { type: "number", min: 1 },
		idpaciente: { type: "number", min: 1 },
		idobrasocial: { type: "number", min: 1 },
		diagnostico: { type: "string", min: 5 },
		identreservada: { type: "boolean" },
		estudios: { type: "array", min: 1 }
	};

	valid.validar(req.body, verificar);
	if(valid.hasErrors()) {
		res.status(409).json(valid.getErrors());
		return;
	}

	//await query("TRUNCATE TABLE est_receta");
	//await query("TRUNCATE TABLE est_prescrestudio");

	try {
		let sql = `
			INSERT INTO est_receta
			(fechaemision, ipprescriptor, matricprescr, matricespec_prescr, idpaciente, idobrasocafiliado, diagnostico, identidadreserv)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`;

		let ahora = obtenerFechaHoraMySQL();
		let matricula = req.user.data.matricula;
		let { idespecialidad, idpaciente, idobrasocial, diagnostico, identreservada, estudios } = req.body;

		let results = await query(sql, [ahora, req.ip, matricula, idespecialidad, idpaciente, idobrasocial, diagnostico, identreservada]);
		let idEstudio = results.data.insertId;

		if(idEstudio) {
			for(let i = 0; i < estudios.length; i++) {
				let estudio = estudios[i];
				sql = `
					INSERT INTO est_prescrestudio
					(idestudio, nro_orden, codigo, descripcion)
					VALUES (?, ?, ?, ?)
				`;
				await query(sql, [idEstudio, (i + 1), 0, estudio]);
			}
		} else {
			resp.ok = false;
			resp.msg = "Ocurrión un error al cargar los datos de la prescripcion.";
		}

		resp.data = null;
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