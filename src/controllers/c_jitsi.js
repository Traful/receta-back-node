import { generate } from "./helpers/jitsijwt.js";
import uuid from "uuid-random";
import fs from "fs/promises";
import { JITSI_APP_ID, JITSI_KID, SMTP_HOST, SMTP_USERNAME, SMTP_SENDER_NAME, SMTP_PASSWORD, SMTP_PORT, URL_FONT_APP } from "../config.js";
import { generateAccessToken } from "../utils/funcs.js";
import nodemailer from "nodemailer";

export const generateToken = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		token: null
	};

	let fields = req.body;
	let { nombre, email, avatar } = fields.user;

	try {
		const privateKey = await fs.readFile("src/controllers/helpers/jitsi.pk", "utf8");
		const token = generate(privateKey, {
			id: uuid(),
			/*
			name: name,
			email: email,
			avatar: `https://robohash.org/:${generateRandomString(4)}`,
			*/
			name: nombre,
			email: email,
			avatar: avatar,
			appId: JITSI_APP_ID,
			kid: JITSI_KID
		});
		resp.token = token;
	} catch(error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};

const sendmailData = (transporter, mailOptions) => {
	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (error, info) => {
			if(error) {
				console.error(error);
				reject({ ok: true, msg: `Error al enviar el correo: ${error.message}` })
			} else {
				resolve({ ok: true, messageId: info.messageId });
			}
		});
	})
};

export const sendInviteLink = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		token: null
	};

	try {
		//nombreSala: nombreSala,
		//user: {
		//	"hidden-from-recorder": false,
		//	moderator: true,
		//	name: "Muni-1",
		//	id: uuid(),
		//	avatar: "",
		//	email: "muni1@muni1.com"
		//}
		let fields = req.body;
		let token = generateAccessToken(fields);
		
		if(token) {
			//Envío de mail
			//SMTP_SENDER_NAME ???
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
			<h4>Estimado Dr/a ${fields.nombre}</h4>
			<p>Se requiere de su atención en forma remota, por favor ingresar a la <a href="${URL_FONT_APP}tele/meeting/remote?token=${token}">reunión</a>.</p>
			`;

			// Configura el contenido del correo
			let mailOptions = {
				from: SMTP_USERNAME, // Remitente
				to: fields.email, // Destinatario
				subject: "Telemedicina - Consulta Médica", // Asunto
				//text: "Contenido del correo en texto plano", // Contenido en texto plano
				html: htmlBody // O puedes enviar el contenido en HTML
			};

			// Enviar el correo
			let envio = await sendmailData(transporter, mailOptions);
			if(envio.ok) {
				resp.token = token;
				resp.messageId = envio.messageId;
			} else {
				resp.ok = false;
				resp.msg = envio.msg;
			}
			/*
			transporter.sendMail(mailOptions, (error, info) => {
				if(error) {
					resp.ok = false;
					resp.msg = `Error al enviar el correo: ${error.message}`;
				} else {
					resp.token = token;
					resp.messageId = info.messageId;
				}
			});
			*/
		} else {
			resp.ok = false;
			resp.msg = `Error al generar el token.`;
		}
	} catch(error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};