import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

import { API_PORT, API_JWT_KEY } from "./config.js";

// Rutas
import rUsers from "./routes/r_users.js";
import rPacientes from "./routes/r_pacientes.js";
import rObrasSociales from "./routes/r_obrassociales.js";
import rPlanes from "./routes/r_planes.js";
import rVademecum from "./routes/r_vademecum.js";

import rTurnos from "./routes/r_turnos.js";

//Esta ruta es probable que deba ser removida, hasta el día de la fecha [09/07/2024] solo existe para pruebas
import rFarmalink from "./routes/r_farmalink.js";

import rJitsi from "./routes/r_jitsi.js";

const app = express();

// Settings
app.set("API_PORT", API_PORT);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
	origin: "*",
	methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"]
}));

const base = `/api`;

app.use((req, res, next) => {
	let authorized = [`${base}/users/login`, `${base}/jitsi/token`, `${base}/jitsi/invite`];
	if(authorized.includes(req.originalUrl) || req.originalUrl.startsWith(`${base}/statics/`)) {
		next();
		return;
	}
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; //Authorization: Bearer JWT_ACCESS_TOKEN
	if(token === null) return res.sendStatus(401);
	jwt.verify(token, API_JWT_KEY, (err, user) => {
		if(err) return res.sendStatus(401);
		req.user = user;
		next();
	});
});

// Rutas

app.use(`${base}/statics`, express.static("public"));

app.use(`${base}/users`, rUsers);
app.use(`${base}/pacientes`, rPacientes);
app.use(`${base}/obrassociales`, rObrasSociales);
app.use(`${base}/planes`, rPlanes);
app.use(`${base}/vademecum`, rVademecum);

app.use(`${base}/turnos`, rTurnos);

//Esta ruta es probable que deba ser removida, hasta el día de la fecha [09/07/2024] solo existe para pruebas
app.use(`${base}/farmalink`, rFarmalink);

app.use(`${base}/jitsi`, rJitsi);

app.listen(app.get("API_PORT"), () => {
	console.log(`Api - Receta Eletrónica - Escuchando peticiones en el puerto: ${app.get("API_PORT")}`);
	console.info(`http://localhost:${app.get("API_PORT")}${base}`);
});