import { Router } from "express";
import { getTurnos, setTurno } from "./../controllers/c_turnos.js";

const rTurnos = Router();

// [GET]
rTurnos.get("/", getTurnos);

// [POST]
rTurnos.post("/", setTurno);

export default rTurnos; 