import mysql from "mysql2/promise";
import { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } from "./../config.js";

const pool = mysql.createPool({
	host: DB_HOST,
	port: DB_PORT,
	database: DB_DATABASE,
	user: DB_USER,
	password: DB_PASSWORD,
	waitForConnections: true,
	connectionLimit: 10,
	maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
	idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0
});

export const query = async (sql, params = []) => {
	let response = {
		ok: true,
		msg: "",
		data: null
	};
	try {
		const connection = await pool.getConnection();
		const [rows, fields] = await connection.execute(sql, params);
		connection.release();
		response.data = rows;
	} catch(error) {
		console.log(error);
		response.ok = false;
		response.msg = error.message;
	}
	return response;
};