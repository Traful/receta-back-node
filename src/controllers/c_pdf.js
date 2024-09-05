import { bodyHtmlReceta, genPdfFromHtml } from "./helpers/bodys.js";

export const getPdfReceta = async (req, res) => {
	try {
		const recetaHtml = await bodyHtmlReceta(req.params.id, req.params.orden);
		const pdfUint8Array = await genPdfFromHtml(recetaHtml);
		const pdfBuffer = Buffer.from(pdfUint8Array);

		res.setHeader("Content-Disposition", "attachment; filename=receta.pdf");
		res.setHeader("Content-Type", "application/pdf");
		res.send(pdfBuffer);

	} catch (error) {
		console.error(error);
		res.status(500).send("Error generando el PDF");
	}
};