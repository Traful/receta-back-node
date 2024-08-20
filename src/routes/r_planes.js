import { Router } from "express";
import { getPlanes, getPlanesByIdObraSocial } from "./../controllers/c_planes.js";

const rPlanes = Router();

// [GET]
rPlanes.get("", getPlanes);
rPlanes.get("/obrasocial/:idObraSocial", getPlanesByIdObraSocial);

export default rPlanes; 