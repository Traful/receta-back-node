export const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";
export const API_PORT = process.env.API_PORT || 3001;
export const API_JWT_KEY = process.env.API_JWT_KEY || "1234567890";

export const DB_USER = process.env.DB_USER || process.env.USER || "nouser";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = process.env.DB_PORT || 3306;
export const DB_DATABASE = process.env.DB_DATABASE || "recetav2";


export const FL_URL_BASE = process.env.FL_URL_BASE || "https://test-servicios.farmalink.com.ar/api/";
export const FL_USER = process.env.FL_USER || "cmpc.ws00";
export const FL_PASS = process.env.FL_PASS || "Password00";
export const FL_OAUTH_USER = process.env.FL_OAUTH_USER || "CMPCClient";
export const FL_OAUTH_PASS = process.env.FL_OAUTH_PASS || "Password00";

export const FL_ID_ORGANIZACION = process.env.FL_ID_ORGANIZACION || 39;
export const FL_TIPO_ORGANIZACION = process.env.FL_TIPO_ORGANIZACION || "NMD";
export const FL_ENTIDAD = process.env.FL_ENTIDAD || 7100;
export const FL_CREDENCIAL = process.env.FL_CREDENCIAL || 12345678;
export const FL_RANGO_HABILITADO = process.env.FL_RANGO_HABILITADO || 9339;

export const JITSI_APP_ID = process.env.JITSI_APP_ID || "vpaas-magic-cookie-82c9ba6e7c13412683b9a2d4da436d59";
export const JITSI_KID = process.env.JITSI_KID || "vpaas-magic-cookie-82c9ba6e7c13412683b9a2d4da436d59/e90d45";

export const SMTP_HOST = process.env.SMTP_HOST || "NO_DATA";
export const SMTP_USERNAME = process.env.SMTP_USERNAME || "NO_DATA";
export const SMTP_SENDER_NAME = process.env.SMTP_SENDER_NAME || "NO_DATA";
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "NO_DATA";
export const SMTP_PORT = process.env.SMTP_PORT || 465;

export const URL_FONT_APP = process.env.URL_FONT_APP || "https://localhost:5173/";

export const extras = {
	idOrganizacion: FL_ID_ORGANIZACION,
	tipoOrganizacion: FL_TIPO_ORGANIZACION,
	entidadDePrueba: FL_ENTIDAD,
	credencial: FL_CREDENCIAL,
	rangoHabilitado: FL_RANGO_HABILITADO
};

//"https://test-servicios.farmalink.com.ar/api/oauth/token/generate",
//"https://servicios.farmalink.com.ar/api/oauth/token/generate",

export const farmaLinkInfo = {
	urlBase: FL_URL_BASE, 
	user: FL_USER,
	password: FL_PASS,
	oauthUser: FL_OAUTH_USER,
	oauthPassword: FL_OAUTH_PASS
};