import { getFarmaLinkToken, sendToFarmaLink } from "./helpers/farmalink.js";

export const getFarmalinkToken = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};
	let token = await getFarmaLinkToken();
	if(token) {
		resp.data = token;
	} else {
		resp.ok = false;
		resp.msg = "Ocurrió un error al intentar obtener el token del servicio de FarmaLink";
	}
	res.status(resp.ok ? 200 : 409).json(resp);
};

export const sendRecetaToFarmalink = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};
	let ok = await sendToFarmaLink(req.params.idreceta);
	resp = ({ ...resp, ...ok });
	res.status(resp.ok ? 200 : 409).json(resp);
};
