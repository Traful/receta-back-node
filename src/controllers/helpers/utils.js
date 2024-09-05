import { query } from "../../db/db.js";

const queryInsert = async (sql, values) => {
	try {
		let results = await query(sql, values);
		let insertedId = results.data.insertId;
		return insertedId;		
	} catch (error) {
		console.error(error);
	}
	return null;
};

export const addReceta = async (values) => {
	let sql = `
		INSERT INTO rec_receta
		(fechaemision, ipprescriptor, matricprescr, matricespec_prescr, idpaciente, idobrasocafiliado, lugaratencion, diagnostico, diagnostico2, identidadreserv)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;
	let id = await queryInsert(sql, values);
	return id;
};

export const addAuditoria = async (values) => {
	let sql = `
		INSERT INTO rec_auditoria
		(idpaciente, idprescriptor, matricespec_prescr, fecha_origen, idobrasoc, cantmeses, renglones, idreceta1) VALUES
		(?, ?, ?, ?, ?, ?, ?, ?)
	`;
	let id = await queryInsert(sql, values);
	return id;
};

export const addMuniExcepcion = async (values) => {
	let sql = `
		INSERT INTO muni_excep
		(idreceta, idpaciente, motivo, nrocelular)
		VALUES (?, ?, ?, ?)
	`;
	let id = await queryInsert(sql, values);
	return id;
};

export const addMedicamento = async (values) => {
	let sql = `
		INSERT INTO rec_prescrmedicamento
		(idreceta, nro_orden, idmedicamento, codigo, cantprescripta, posologia, bono_nombre, bono_autoriza, estado_auditoria)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`;
	let id = await queryInsert(sql, values);
	return id;
};

export const cargarTodosLosMedicamentos = async (ultimoId, idobrasocial, medicamentos) => {
	for(let indexMed = 0; indexMed < medicamentos.length; indexMed++) {
		let xMedicamento = medicamentos[indexMed];
		let estadoAuditoria = 1;
		if(parseInt(idobrasocial, 10) === 20) {
			if((parseInt(xMedicamento.condicion, 10) === 2) && ((i + 1) === 1)) {
				estadoAuditoria = 0;
			}
			if((parseInt(xMedicamento.condicion, 10) === 1) && ((i + 1) >= 2)) {
				estadoAuditoria = 0;
			}
			if((parseInt(xMedicamento.condicion, 10) === 2) && ((i + 1) >= 2)) {
				estadoAuditoria = 0;
			}
		}
		await addMedicamento([ultimoId, (indexMed + 1), xMedicamento.id, xMedicamento.codigo, xMedicamento.cantidad, xMedicamento.dosis, '', '', estadoAuditoria]);
	}
};