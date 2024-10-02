import { generate } from "./helpers/jitsijwt.js";
import uuid from "uuid-random";
import fs from "fs/promises";
import { JITSI_APP_ID, JITSI_KID, SMTP_HOST, SMTP_USERNAME, SMTP_SENDER_NAME, SMTP_PASSWORD, SMTP_PORT, URL_FONT_APP } from "../config.js";
import { generateAccessToken } from "../utils/funcs.js";
import nodemailer from "nodemailer";
import { sendMailData } from "./helpers/utils.js";

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
	} catch (error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
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

		if (token) {
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
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telemedicina - Consulta Médica</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 40px auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
            border: 1px solid #e0e0e0;
        }
        .header {
            background-color: #0066cc;
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h4 {
            color: #0066cc;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            color: #555;
            margin: 0 0 20px;
        }
        .logo-central {
            max-width: 100px;
            margin: 20px auto;
        }
        .button-container {
            text-align: center;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 20px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .button:hover {
            background-color: #218838;
        }
        .footer {
            background-color: #0066cc;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with logo -->
        <div class="header">
            <img src="https://aplicaciones.cmpc.org.ar/recursos/logoTelemedicar.png" alt="Telemedicina Logo">
        </div>

        <!-- Main content -->
        <div class="content">
            <h4>Estimado Dr/a ${fields.nombre},</h4>
            <p>
                Se requiere de su atención en forma remota para una consulta médica. A continuación, encontrará el enlace para ingresar a la reunión.
            </p>

          
            <p>
                Por favor, haga clic en el botón a continuación para unirse a la consulta médica de forma remota:
            </p>

            <!-- Button for the meeting link -->
            <div class="button-container">
                <a href="${URL_FONT_APP}tele/meeting/remote?token=${token}" class="button">
                    Unirse a la Reunión
                </a>
            </div>

			<!-- Image in the middle -->
            <img src="https://aplicaciones.cmpc.org.ar/recursos/logoAu.png" class="logo-central" alt="Logo" />

        </div>
  		
        <!-- Footer section -->
        <div class="footer">
            <p>© 2024 Telemedicina. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`;



			// Configura el contenido del correo
			let mailOptions = {
				from: `"Telemedic.Ar" <${SMTP_USERNAME}>`, // Nombre del remitente y correo electrónico
				to: fields.email, // Destinatario
				subject: "Consulta Médica", // Asunto
				//text: "Contenido del correo en texto plano", // Contenido en texto plano
				html: htmlBody // O puedes enviar el contenido en HTML
			};

			// Enviar el correo
			let envio = await sendMailData(transporter, mailOptions);
			if (envio.ok) {
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
	} catch (error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};