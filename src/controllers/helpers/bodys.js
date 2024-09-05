import puppeteer from "puppeteer";
import QRCode from "qrcode";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { obtenerFechaHoraMySQL } from "./../../utils/funcs.js";
import { sendMailData } from "./utils.js";
import { query } from "./../../db/db.js";
import nodemailer from "nodemailer";
import { API_BASE_URL, SMTP_HOST, SMTP_USERNAME, SMTP_SENDER_NAME, SMTP_PASSWORD, SMTP_PORT, URL_FONT_APP } from "./../../config.js";


/*
	require "phpmailer/class.phpmailer.php";
	require "phpmailer/class.smtp.php";
	$configurationSet = 'ConfigSet';
	$bodyText =  "";
	$sender = "receta@cmpc.org.ar";
	$senderName = "RECETA ELECTRONICA CMPC";


	$mail = new PHPMailer(true);

	// Specify the SMTP settings.
	$mail->isSMTP();
	$mail->setFrom($sender, $senderName);
	$mail->Username   = "AKIAT6MBAVXI4W7SWYPX"; 
	$mail->Password   = "BGokKkLDOreXzpAeQRaRWYG4ZzVXetBXZYp2Q+2s8+Y6";
	$mail->Host       = "email-smtp.us-east-1.amazonaws.com";
	$mail->Port       = 587;
	$mail->SMTPAuth   = true;
	$mail->SMTPSecure = 'tls';
	//$mail->addCustomHeader('X-SES-CONFIGURATION-SET', $configurationSet);
*/

export const generatePdfName = () => {
	// Ejemplo: 'e9a1d7c6-2384-4c7a-9d52-39e58f3b024b'
	const uniqueId = uuidv4();
	return `${uniqueId}.pdf`;
};

export const generateQrCode = (data) => {
	return new Promise((resolve, reject) => {

		QRCode.toDataURL(data, {
			color: {
				dark: "#000000",  // Color del código QR
				light: "#ffffff"  // Color del fondo
			}
		}, (err, url) => {
			if(err) {
				reject("Error al generar el código QR");
			} else {
				resolve(url);
			}
		});
	});
};

export const bodyHtmlReceta = async (idReceta, idOrden, tipo = "ORIGINAL", link = null) => {
	let sql = `
	SELECT
		r.idreceta,
		r.fechaemision,
		r.diagnostico,
		r.idobrasocafiliado,
		CONCAT(p.apellido, ', ', p.nombre) AS paciente,
		p.dni,
		p.nromatriculadoc AS nro_afiliado,
		os.descripcion,
		p.email,
		CONCAT(m.apellido, ', ', m.nombre) AS medico,
		r.matricprescr,
		e.denominacion
	FROM rec_receta r
	INNER JOIN rec_paciente p ON
		p.id = r.idpaciente
	INNER JOIN tmp_person m ON
		m.matricula = r.matricprescr
		INNER JOIN rec_obrasoc os ON
		os.id = r.idobrasocafiliado
	LEFT JOIN tmp_especialidades e ON
		e.especialidad = r.matricespec_prescr
	WHERE
		r.idreceta = ?
	`;

	let results = await query(sql, [idReceta]);
	let receta = results.data[0];

	let nroReceta = `${receta.idreceta}-${idOrden}`;
	nroReceta = nroReceta.padStart(14, "0");

	let logoHeader = "cmpc.jpg";
	let logoOSpie = "sinlogo.jpg";

	let vademecum = "vademecum";
	switch(parseInt(receta.idobrasocafiliado, 10)) {
		case 156: //Muni
			logoHeader = "156.jpg";
			vademecum = "vad_muni_si";
			break;
		case 20: //CPCE
			logoHeader = "20.jpg";
			vademecum = "vad_020";
			break;
		case 115:
			logoOSpie = "115.jpg";
			break;
	}

	let html = `
	<!DOCTYPE html>
	<html lang="es">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Document</title>
	</head>
	<body>
		<table width="100%">
			<thead>
				<tr>
					<th colspan="2" width="50%" align="left"><font size="1.2em">Receta Electrónica</font></th>
					<th colspan="4" width="50%" align="right"><font size="0.8em">${tipo}</font></th>
				</tr>  
			</thead>
			<tbody>
				<tr>
					<td colspan="6" width="100%"><hr style="border: 1px solid #000;" /></td>
				</tr>  
				<tr>
					<td colspan="2" width="25%"><img src="${API_BASE_URL}/imglogos/${logoHeader}" width="180px"></td>
					<td colspan="2" width="35%"><h2>Nro: ${nroReceta}</h2></td>
					<td colspan="2" width="40%" align="right">Fecha Válida Desde: ${obtenerFechaHoraMySQL(receta.fechaemision).substring(0, 10).split("-").reverse().join("/")}</td>
				</tr>
				<tr>
					<td colspan="6" width="100%"><hr style="border: 1px solid #CCC;" /></td>
				</tr> 
				<tr>
					<td colspan="3" width="40%"><font size="1.2em">Paciente</font></td>
					<td colspan="3" width="60%"><font size="1.2em">Obra Social</font></td>
				</tr>  
				<tr>
					<td colspan="3" width="40%"><font size="1em">${receta.paciente} DNI ${receta.dni}</font></td>
					<td colspan="3" width="60%"><font size="1em">${receta.descripcion} - Nro: ${receta.nro_afiliado}</font></td>
				</tr>
				<tr>
					<td colspan="6" width="100%"><hr style="border: 1px solid #CCC;" /></td>
				</tr> 
				<tr>
					<td colspan="6" width="100%"><font size="1.2em">Prescripción</font></td>
				</tr> 
			</tbody>
		</table>
		<table width="100%" border="1" cellspacing="0" bordercolor="ccc" cellpadding="2">
			<tr>
				<td colspan="1" width="3%"><b>Cant</b></td>
				<td colspan="1" width="30%"><b>Monodroga</b></td>
				<td colspan="1" width="30%"><b>Sugerida</b></td>
				<td colspan="1" width="20%"><b>Presentación</b></td>
				<td colspan="2" width="2%"><b>Dosis por día</b></td>
			</tr>
	`;
	//Buscar los medicamentos recetados segun el número de orden
	sql = `
		SELECT
			m.idreceta,
			m.idmedicamento,
			m.nro_orden,
			m.cantprescripta,
			m.posologia,
			v.monodroga,
			v.nombre_comercial,
			v.presentacion
		FROM rec_prescrmedicamento m
		LEFT JOIN ${vademecum} v ON
			v.id = m.idmedicamento
		WHERE
			m.idreceta = ?
	`;

	let params = [idReceta];

	if(idOrden > 0) {
		sql = sql + " AND m.nro_orden = ?";
		params.push(idOrden);
	}

	let results2 = await query(sql, params);
	let medicacion = results2.data;

	for(let index = 0; index < medicacion.length; index++) {
		const medicamento = medicacion[index];
		let h = `
			<tr>
				<td>${medicamento.cantprescripta}</td>
				<td>${medicamento.monodroga.toUpperCase()}</td>
				<td>${medicamento.nombre_comercial.toUpperCase()}</td>
				<td>${medicamento.presentacion.toUpperCase()}</td>
				<td colspan="2">${medicamento.posologia}</td>
			</tr>
		`;
		html = html + h;
	}

	
	let qr = await generateQrCode(link ? link : `${API_BASE_URL}/api/pdf/receta/${idReceta}/${idOrden}`);

	let nameFile = `fo_${receta.matricprescr}.txt`;
	let filePath = `public/foto/${nameFile}`;
	let foto = `${API_BASE_URL}/foto/`;

	try {
		fs.accessSync(filePath, fs.constants.F_OK);
		foto = foto + nameFile;
	} catch (err) {
		foto = foto + "fo_no.txt";
	}

	html = html + `
		</table>
		<table width="100%" cellpadding="2">
			<tr>
				<td colspan="6" width="100%"><font size="1.2em">Diagnóstico</font></td>
			</tr>
			<tr>
				<td colspan="2" width="50%" valign="top" style="border: 1px solid #ccc;">${receta.diagnostico}</td>
				<td colspan="2" width="10%" align="center"><img src="${qr}" alt="Código QR"></td>
				<td colspan="2" width="40%" align="center">
					<img width="100px" src="${foto}" alt="Foto"><br>
					${receta.medico}<br>
					MP. ${receta.matricprescr}<br>
					${receta.denominacion ? receta.denominacion : ""}
				</td>
			</tr>
		</table>
		<table width="100%" cellpadding="2">
			<tr>
				<td colspan="6" width="100%"><hr style="border: 1px solid #CCC;" /></td>
			</tr>
			<tr>
				<td colspan="2" width="30%"><img src="${API_BASE_URL}/imglogos/${logoOSpie}" width="80%"></td>
				<td colspan="2" width="60%" align="left"><font size="0.5em">Ley 27553 Recetas electr&oacute;nicas o digitales. Ley de prescripci&oacute;n y venta de medicamentos utilizando recetas electr&oacute;nicas, modificaci&oacute;n de las leyes 17132, 17565, 17818 Y 1930.<br/> Ley 27680 de Prevenci&oacute;n y Control de la Resistencia a los Antimicrobianos.</font></td>
				<td colspan="2" width="10%" align="right"><img src="${API_BASE_URL}/imglogos/desarrolladoporpara.jpg" width="90%"></td>
			</tr>
		</table>
	</body>
	</html>
	`;
	return html;
};

export const genPdfFromHtmlToFile = async (html, filename) => {
	const browser = await puppeteer.launch({ headless: "new" });
	const page = await browser.newPage();
	await page.setContent(html);
	await page.pdf({ path: filename, format: "A4", landscape: true, margin: { left: 10, right: 10, top: 10, bottom: 10 } });
	await browser.close();
};

export const genPdfFromHtml = async (html) => {
	const browser = await puppeteer.launch({ headless: "new" });
	const page = await browser.newPage();
	await page.setContent(html);
	const pdfBuffer = await page.pdf({ format: "A4", landscape: true, margin: { left: 10, right: 10, top: 10, bottom: 10 } });
	await browser.close();
	return pdfBuffer;
};

export const generarPdfDeNuevaReceta = async (recetasIds) => {
	let sql = "SELECT MAX(p.nro_orden) AS renglones FROM rec_prescrmedicamento p WHERE p.idreceta = ?";
	let bodyHtml = `
	<head>
		<style>
			.page-break {
				page-break-before: always;
			}
		</style>
	</head>
	<body>
	`;
	for(let index = 0; index < recetasIds.length; index++) {
		let idReceta = recetasIds[index];
		let results = await query(sql, [idReceta]);
		let renglones = parseInt(results.data[0].renglones, 10);
		for(let indexR = 1; indexR <= renglones; indexR++) {
			bodyHtml = bodyHtml + await bodyHtmlReceta(idReceta, indexR, "ORIGINAL", null);
			if(indexR < renglones) bodyHtml = bodyHtml + `<div class="page-break"></div>`;
		}
		if(index < (recetasIds.length - 1)) bodyHtml = bodyHtml + `<div class="page-break"></div>`;
	}
	bodyHtml = bodyHtml + "</body>";
	let name = generatePdfName();
	let filename = `public/pdfs/${name}`;
	await genPdfFromHtmlToFile(bodyHtml, filename);
	return name;
};

export const sendMailReceta = async (filename, paciente, email) => {
	let resp = {
		ok: true,
		msg: "",
		data: null
	};

	let transporter = nodemailer.createTransport({
		host: SMTP_HOST, // El host de tu servidor SMTP
		port: SMTP_PORT, // El puerto (puede variar, 465 para SSL)
		secure: parseInt(SMTP_PORT) === 465 ? true : false,
		auth: {
			user: SMTP_USERNAME,
			pass: SMTP_PASSWORD
		}
	});

	let htmlBody = `
		<h4>Estimado Sr/a ${paciente}</h4>
		<p>Adjuntamos al presente su prescripción médica.</p>
		<p>Sin otro particular saluda a Ud. muy atte.</p>
	`;

	// Configura el contenido del correo
	let mailOptions = {
		from: SMTP_USERNAME, // Remitente
		to: email, // Destinatario
		subject: "Telemedicina - Consulta Médica", // Asunto
		//text: "Contenido del correo en texto plano", // Contenido en texto plano
		html: htmlBody, // O puedes enviar el contenido en HTML
		attachments: [
			{
				filename: "receta.pdf", // Nombre del archivo adjunto
				path: `public/pdfs/${filename}` // Ruta al archivo en tu sistema
			}
		]
	};

	// Enviar el correo
	let envio = await sendMailData(transporter, mailOptions);

	if(envio.ok) {
		resp.messageId = envio.messageId;
	} else {
		resp.ok = false;
		resp.msg = envio.msg;
	}

	return resp;
};