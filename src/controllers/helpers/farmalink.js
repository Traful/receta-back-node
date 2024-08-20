import { Buffer } from "node:buffer";
import { query } from "./../../db/db.js";
import { obtenerFechaActual } from "../../utils/funcs.js";
import { extras, farmaLinkInfo } from "../../config.js";

/*
	Infromacion del servicio:
	https://catalogo-srv.farmalink.com.ar/
	user: cmpc
	pass: quilmes7
*/

export const getFarmaLinkToken = async () => {
	let token = null;
	
	const oauthCredentials = Buffer.from(`${farmaLinkInfo.oauthUser}:${farmaLinkInfo.oauthPassword}`).toString("base64");

	const myHeaders = new Headers();
	myHeaders.append("grant_type", "PASSWORD");
	myHeaders.append("username", farmaLinkInfo.user);
	myHeaders.append("password", farmaLinkInfo.password);
	myHeaders.append("scope", "Switch.RecetaElectRest");
	myHeaders.append("Authorization", `Basic ${oauthCredentials }`);

	const requestOptions = {
		method: "POST",
		headers: myHeaders,
		redirect: "follow"
	};

	try {
		let response = await fetch(`${farmaLinkInfo.urlBase}oauth/token/generate`, requestOptions);
		let result = await response.json();
		token = result;
	} catch(error) {
		console.error(error);
	}
	return token;
};

export const sendToFarmaLink = async (idReceta) => {
	let resp = {
		ok: true,
		msg: "",
		data: []
	};
	try {
		let sql = `
		SELECT
			r.idreceta,
			r.fechaemision,
			r.matricprescr,
			r.idobrasocafiliado,
			r.diagnostico,
			p.dni
		FROM rec_receta r
		INNER JOIN rec_paciente p ON
			p.id = r.idpaciente
		WHERE
			r.idreceta = ?;
		`;
		let response = await query(sql, [idReceta]);
		let receta = response.data[0];

		let vademecum = "vademecum";
		if(parseInt(receta.idobrasocafiliado, 10) === 156) vademecum = "vad_muni_si"; //MUNI-X-CBA
		if(parseInt(receta.idobrasocafiliado, 10) === 20) vademecum = "vad_020"; //CPCE

		if(receta?.idreceta) {
			sql = `
			SELECT
				m.idreceta,
				m.nro_orden,
				m.cantprescripta,
				v.nro_alfabeta,
				v.cod_monodroga
			FROM rec_prescrmedicamento m
			INNER JOIN ${vademecum} v on
				v.id = m.idmedicamento
			WHERE
				m.idreceta = ?
			ORDER BY
				m.nro_orden;
			`;
			response = await query(sql, [receta.idreceta]);
			let medicamentos = response.data;

			let tokenData = await getFarmaLinkToken();
			tokenData = `${tokenData.token_type} ${tokenData.access_token}`;

			for(let index = 0; index < medicamentos.length; index++) {
				let medicamento = medicamentos[index];

				//Armado del JSON de la receta que se envía a FarmaLink
				let nroReceta = `${medicamento.idreceta}${medicamento.nro_orden}`;
				let idRecElectronica = `${extras.rangoHabilitado}${nroReceta.toString().padStart(12 - (extras.rangoHabilitado.toString().length + nroReceta.toString().length), "0")}`;

				let bodyReceta = {
					altaRecetaElectRq: {
						infoCabeceraRq: {
							idOrganizacion: extras.idOrganizacion.toString(),
							tipoOrganizacion: extras.tipoOrganizacion
						},
						recElectronica: {
							idRecElectronica: idRecElectronica,
							nroRecElectronica: idRecElectronica,
							fechaVigenciaDesde: obtenerFechaActual(),
							//fechaVigenciaHasta: "2024-07-25",
							//idImagen: "string",
							tipoTratamiento: "N", //Fijo N? No se que es este dato averiguar!
							afiliado: {
								codEntidad: parseInt(extras.entidadDePrueba, 10), //En realidad depende de la Obra Social (rec_obrasoc.cod_validador)
								pan: extras.credencial.toString(), //12345678 pero debería ser la que se carga en "rec_paciente.nromatriculadoc"
								dni: parseInt(receta.dni, 10)
							},
							medico: {
								tipoMatricula: "MP",
								provMatricula: "X",
								nroMatricula: receta.matricprescr.toString()
							},
							diagnostico: {
								//clasificador: "string",
								//codigo: "string",
								textoLibre: receta.diagnostico //Va igual por mas que sea diagnostico reservado?
							},
							detalleRecElectronica: {
								item: [
									{
										cantidad: parseInt(medicamento.cantprescripta, 10),
										codProducto: medicamento.nro_alfabeta.toString(), //del vademecum
										codDroga: medicamento.cod_monodroga.toString(), //del vademecum
										permiteSustitucion: "S"/*, //N = No, S = Si, fijo en S?
										diagnostico: {
											clasificador: "string",
											codigo: "string",
											textoLibre: "string"
										}
										*/
									}
								]
							}
						}
					}
				};

				//Envío al servicio de Farmalink
				resp.data = ([ ...resp.data, bodyReceta]);

				/*
				let myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/json");
				myHeaders.append("Authorization", tokenData);

				let response = await fetch(`${farmaLinkInfo.urlBase}recetaElect/altaReceta`, {
					method: "POST",
					headers: myHeaders,
					body: JSON.stringify(bodyReceta),
					redirect: "follow"
				});

				let result = await response.json();
				*/

			}
		} else {
			resp.ok = false;
			resp.msg = `Ocurrió un error al obtener los datos de la receta [${idReceta}]`;
		}
	} catch(error) {
		resp.ok = false;
		resp.msg = `Ocurrió un error al obtener los datos de la receta [${idReceta}] -> ${error.message}`;
	}
	return resp;
};