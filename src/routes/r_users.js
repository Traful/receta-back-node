import { Router } from "express";
import { getUsers, getEspecialidadesByMatricula, logIn } from "./../controllers/c_users.js";

const rUsers = Router();

// [GET]
rUsers.get("", getUsers);
rUsers.get("/especialidades/:matricula", getEspecialidadesByMatricula);

// [POST]
rUsers.post("/login", logIn);

export default rUsers; 