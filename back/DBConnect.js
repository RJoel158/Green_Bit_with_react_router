// DBConnect.js
import mysql from "mysql";

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "mysql-reciclaje.alwaysdata.net",
  user: "reciclaje_admin",
  password: "Univalle.",
  database: "reciclaje_proyecto1db",
});

// Helper de consultas con promesas
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

console.log("Conexión a la base de datos establecida.");

export default pool;
