function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

class Validate {
	constructor(db) {
		this.conn = db;
		this.errors = [];
	}

	validar(fields, verificaciones) {
		const valores = { ...fields };
		this.errors = [];

		for(const [key, rules] of Object.entries(verificaciones)) {
			if(!valores.hasOwnProperty(key)) {
				this.errors.push(`${key} es un valor requerido.`);
			} else {
				const v = valores[key];
				let lastType = null;

				for(const [rule, value] of Object.entries(rules)) {
					switch(rule) {
						case "type":
							lastType = value;
							switch(value) {
								case "number":
									if(!isNumeric(v)) {
										this.errors.push(`${key} [${v}] no es un número válido.`);
									}
									break;
								case "string":
									if(typeof v !== "string") {
										this.errors.push(`${key} [${v}] no es una cadena de caracteres válida.`);
									}
									break;
								case "date":
									if(isNaN(Date.parse(v))) {
										this.errors.push(`${key} [${v}] no es una fecha válida.`);
									}
									break;
								case "time":
									const formato = "H:i:s";
									const horarioObj = new Date(`1970-01-01T${v}`);
									const horario = horarioObj.toISOString().slice(11, 19);
									if(horario !== v) {
										this.errors.push(`${key} [${v}] no es un horario válido.`);
									}
									break;
								case "array":
									if(!Array.isArray(v)) {
										this.errors.push(`${key} no es un array válido.`);
									}
									break;
								case "boolean":
									if(typeof v !== "boolean") {
										this.errors.push(`${key} no es un valor booleano válido.`);
									}
									break;
								default:
									this.errors.push(`${value} no es un 'type' válido.`);
								break;
							}
							break;
						case "min":
							switch(lastType) {
								case "number":
									if(v < value) {
										this.errors.push(`${key} [${v}] no debe ser menor a ${value}.`);
									}
									break;
								case "string":
									if(v.length < value) {
										this.errors.push(`${key} [${v}] debe tener al menos ${value} caracteres.`);
									}
									break;
								case "date":
									const fecha1Obj = new Date(v);
									const fecha2Obj = new Date(value);
									if(fecha1Obj < fecha2Obj) {
										this.errors.push(`${key} [${v}] debe ser menor a la fecha ${value}.`);
									}
									break;
								case "time":
									const formato = "H:i:s";
									const horarioObj = new Date(`1970-01-01T${v}`);
									const horario = horarioObj.toISOString().slice(11, 19);
									if(horario !== v || horarioObj < new Date(`1970-01-01T${value}`)) {
										this.errors.push(`${key} [${v}] no debe ser menor a la hora ${value}.`);
									}
									break;
								case "array":
									if(v.length < value) {
										this.errors.push(`${key} debe tener al menos ${value} item/s.`);
									}
									break;
								default:
									break;
							}
							break;
						case "max":
							switch(lastType) {
								case "number":
									if(v > verificaciones[key][rule]) {
										this.errors.push(`${key} [${v}] no debe ser mayor a ${verificaciones[key][rule]}.`);
									}
									break;
								case "string":
									if(v.length > verificaciones[key][rule]) {
										this.errors.push(`${key} [${v}] debe tener como máximo ${verificaciones[key][rule]} caracteres.`);
									}
									break;
								case "date":
									let fecha1_obj = new Date(v);
									let fecha2_obj = new Date(verificaciones[key][rule]);
									if(fecha1_obj.getTime() > fecha2_obj.getTime()) {
										this.errors.push(`${key} [${v}] no debe ser mayor que la fecha ${verificaciones[key][rule]}.`);
									}
									break;
								case "time":
									//let formato = 'H:i:s';
									let horario_obj = new Date(`1970-01-01T${v}`);
									if(!(isFinite(horario_obj) && horario_obj.toISOString().slice(11, 19) === v && horario_obj <= new Date(`1970-01-01T${verificaciones[key][rule]}`))) {
										this.errors.push(`${key} [${v}] no debe ser mayor a la hora ${verificaciones[key][rule]}.`);
									}
									break;
								case "array":
									if(v.length > verificaciones[key][rule]) {
										this.errors.push(`${key} debe tener como máximo ${verificaciones[key][rule]} item/s.`);
									}
									break;
								default:
									break;
							}
							break;
						case "isValidMail":
							const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
							if(lastType === "string" && (!patronCorreo.test(v))) {
								this.errors.push(`${key} [${v}] no es una dirección eletrónica válida.`);
							}
							break;
						default:
							this.errors.push(`${rule} no es una regla válida.`);
							break;
					}
				}
			}
		}
	}

	hasErrors() {
		return this.errors.length > 0;
	}

	getErrors() {
		return {
			ok: false,
			msg: "Hay errores en los datos suministrados",
			data: null,
			errores: this.errors
		};
	}
};

export default Validate;