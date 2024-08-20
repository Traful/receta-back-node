import { query } from "./../db/db.js";

const sqlFiltro = (filtro) => {
	let sql = "";
	if(filtro.length > 0) {
		sql = `
			WHERE monodroga LIKE '%${filtro}%'
			OR nombre_comercial LIKE '%${filtro}%'
			OR laboratorio LIKE '%${filtro}%'
			OR presentacion LIKE '%${filtro}%'
		`;
	}
	return sql;
};

export const getVademecumByIdObraSocial = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		let { idObraSocial } = req.params;
		/*
			vademecum, vad_muni_si y vad_020 son vistas, hay que ver si conviene reemplazar
			por sql a la tabla correspondiente ya que si las tablas de origen de las vistas son
			muy diferentes es probable que si convenga utilizar las vistas
		*/
		let tabla = "vademecum"; //por defecto
		if(parseInt(idObraSocial, 10) === 156) tabla = "vad_muni_si"; //MUNI-X-CBA
		if(parseInt(idObraSocial, 10) === 20) tabla = "vad_020"; //CPCE
		let sql = `
			SELECT
				t.id,
				t.monodroga,
				t.nombre_comercial,
				t.presentacion,
				t.laboratorio,
				t.cod_monodroga,
				t.nro_alfabeta,
				t.codigo,
				t.tipo_venta,
				t.condicion${parseInt(idObraSocial, 10) === 156 ? ", t.prescripmax" : ""}
			FROM ${tabla} t
			ORDER BY t.id
		`;
		/*
			WHERE
				monodroga LIKE :busqueda
				OR nombre_comercial LIKE :busqueda
				OR laboratorio LIKE :busqueda
				OR presentacion LIKE :busqueda
			ORDER BY id
			LIMIT :inicio, :tamanio"
		*/
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

export const getVademecumByIdObraSocialPaginada = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		info: {
			total_registros: 0,
			total_paginas: 0,
			regsxpagina: 0,
			pagina: 0,
			filtro: ""
		},
		data: null,
		errores: []
	};

	try {
		let { idObraSocial, cantidad, pagina } = req.params;
		resp.info.regsxpagina = parseInt(cantidad, 10);
		resp.info.pagina = parseInt(pagina, 10);
		let filtro = "";
		if(req.params.filtro) {
			filtro = req.params.filtro;
			resp.info.filtro = filtro;
		}
		/*
			vademecum, vad_muni_si y vad_020 son vistas, hay que ver si conviene reemplazar
			por sql a la tabla correspondiente ya que si las tablas de origen de las vistas son
			muy diferentes es probable que si convenga utilizar las vistas
		*/
		let tabla = "vademecum"; //por defecto
		if(parseInt(idObraSocial, 10) === 156) tabla = "vad_muni_si"; //MUNI-X-CBA
		if(parseInt(idObraSocial, 10) === 20) tabla = "vad_020"; //CPCE

		//Calculo de total de registros
		let sql = `SELECT COUNT(*) AS total FROM ${tabla}`;
		sql += sqlFiltro(filtro);
		let results = await query(sql);
		resp.info.total_registros = results.data[0].total;

		//calculo la cantidad maxima de paginas
		let calc = parseInt(resp.info.total_registros / resp.info.regsxpagina);
		let resto = resp.info.total_registros % resp.info.regsxpagina;
		if(resto > 0) calc += 1;
		resp.info.total_paginas = calc;

		//validacion de criterios
		if(resp.info.pagina > resp.info.total_paginas) resp.info.pagina = resp.info.total_paginas;

		//devuelvo los datos del vademcum correspondiente
		sql = `
			SELECT
				t.id,
				t.monodroga,
				t.nombre_comercial,
				t.presentacion,
				t.laboratorio,
				t.cod_monodroga,
				t.nro_alfabeta,
				t.codigo,
				t.tipo_venta,
				t.condicion${parseInt(idObraSocial, 10) === 156 ? ", t.prescripmax" : ""}
			FROM ${tabla} t
		`;
		sql += sqlFiltro(filtro);
		sql += " ORDER BY t.id";

		//caclulo de registros [paginado]
		let inicio = 0;
		if(resp.info.pagina > 1) {
			inicio = ((resp.info.pagina - 1) * resp.info.regsxpagina);
		}
		sql += ` LIMIT ${inicio}, ${resp.info.regsxpagina}`;

		//devolución de la consulta
		results = await query(sql);
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