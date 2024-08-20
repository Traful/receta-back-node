/*
	No se bien que verga es esto, pero salen del archivo: back_pacientes.php
	Se dividen en 3 tipos de consulta:
	1) por defecto "recetas"
	2) certMed (Certificado Medico)
	3) estComp (Estudios Complementarios)

	Tablas:

	rec_receta
	rec_paciente
	cert_cabecera
	est_receta
	
	* tmp_person [ya migrada]

	Lo loco de esto es que se puede filtrar por DNI del paciente y/o desde hasta fecha, lo raro es el o
*/

--1) por defecto "recetas"
SELECT
	r.idobrasocafiliado,
	tp.matricula,
	r.idreceta,
	r.fechaemision,
	tp.apellido,
	tp.nombre,
	r.diagnostico
FROM rec_receta AS r
INNER JOIN rec_paciente AS p ON
	p.id = r.idpaciente
INNER JOIN tmp_person AS tp ON
	tp.matricula = r.matricprescr
WHERE
	r.estado IS NULL
ORDER BY r.idreceta DESC

--2) certMed (Certificado Medico)
SELECT
	b.idestudio,
	b.id_encriptado,
	CONCAT(p.apellido, ' ', p.nombre) AS apeNom,
	p.dni,
	CONCAT(tp.apellido, ' ', tp.nombre) AS medNom,
	b.matricprescr,
	b.diagnostico,
	b.fechaemision
FROM cert_cabecera AS b
INNER JOIN rec_paciente AS p ON
	p.id = b.idpaciente
INNER JOIN tmp_person AS tp ON
	tp.matricula = b.matricprescr
WHERE
	b.idestudio > 0
ORDER BY b.idestudio DESC

--3) estComp (Estudios Complementarios)
SELECT
	b.idestudio,
	b.id_encriptado,
	CONCAT(p.apellido, ' ', p.nombre) AS apeNom,
	p.dni,
	CONCAT(tp.apellido, ' ', tp.nombre) AS medNom,
	b.matricprescr,
	b.diagnostico,
	b.fechaemision
FROM est_receta AS b
INNER JOIN rec_paciente AS p ON
	p.id = b.idpaciente
INNER JOIN tmp_person AS tp ON
	tp.matricula = b.matricprescr
WHERE
	b.idestudio > 0
ORDER BY b.idestudio DESC