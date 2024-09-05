import { Router } from "express";
import { getPdfReceta } from "./../controllers/c_pdf.js";

const rPdf = Router();

// [GET]
rPdf.get("/receta/:id/:orden", getPdfReceta);

export default rPdf;