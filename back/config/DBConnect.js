// config/DBConnect.js
// Conexión a la base de datos usando mysql2/promise
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "mysql-reciclaje.alwaysdata.net",
  user: "reciclaje_admin",
  password: "Univalle.",
  database: "reciclaje_proyecto2db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("Pool de MySQL (mysql2) inicializado.");

export default pool;
