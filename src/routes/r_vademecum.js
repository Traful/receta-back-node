import { Router } from "express";
import { getVademecumByIdObraSocial, getVademecumByIdObraSocialPaginada } from "./../controllers/c_vademecum.js";

const rVademecum = Router();

// [GET]
rVademecum.get("/obrasocial/:idObraSocial", getVademecumByIdObraSocial);
rVademecum.get("/obrasocial/:idObraSocial/regs/:cantidad/pagina/:pagina", getVademecumByIdObraSocialPaginada);
rVademecum.get("/obrasocial/:idObraSocial/regs/:cantidad/pagina/:pagina/buscar/:filtro", getVademecumByIdObraSocialPaginada);

export default rVademecum; 