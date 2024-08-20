import { Router } from "express";
import { getPacienteById, getPacienteByDni, getRecetas, getCertificados, getEstudios, setReceta, setEstudio } from "./../controllers/c_pacientes.js";

const rPacientes = Router();

// [GET]

rPacientes.get("/id/:id", getPacienteById);
rPacientes.get("/dni/:dni", getPacienteByDni);

rPacientes.get("/recetas/dni/:dni", getRecetas);
rPacientes.get("/recetas/dni/:dni/:fdesde/:fhasta", getRecetas);
rPacientes.get("/recetas/fecha/:fdesde/:fhasta", getRecetas);

rPacientes.get("/certificados/dni/:dni", getCertificados);
rPacientes.get("/certificados/dni/:dni/:fdesde/:fhasta", getCertificados);
rPacientes.get("/certificados/fecha/:fdesde/:fhasta", getCertificados);

rPacientes.get("/estudios/dni/:dni", getEstudios);
rPacientes.get("/estudios/dni/:dni/:fdesde/:fhasta", getEstudios);
rPacientes.get("/estudios/fecha/:fdesde/:fhasta", getEstudios);

// [POST]

rPacientes.post("/recetas", setReceta);
rPacientes.post("/estudios", setEstudio);

export default rPacientes; 