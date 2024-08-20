import { Router } from "express";
import { getObrasSociales, getLugaresAtencion } from "./../controllers/c_obrassociales.js";

const rObrasSociales = Router();

// [GET]
rObrasSociales.get("", getObrasSociales);
rObrasSociales.get("/lugares/atencion", getLugaresAtencion)

export default rObrasSociales; 