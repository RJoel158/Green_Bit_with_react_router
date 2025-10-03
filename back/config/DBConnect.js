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
  // Configuraciones de timeout para manejar mejor la conectividad
  acquireTimeout: 10000, // 10 segundos para obtener conexión
  timeout: 10000, // 10 segundos para queries
  reconnect: true,
  // Configuración SSL si es necesaria
  ssl: false
});

console.log("Pool de MySQL (mysql2) inicializado.");

// Función para verificar la conectividad
export const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✅ Conexión a la base de datos verificada");
    return true;
  } catch (error) {
    console.error("❌ Error de conexión a la base de datos:", {
      code: error.code,
      message: error.message,
      host: "mysql-reciclaje.alwaysdata.net"
    });
    return false;
  }
};

// Verificar conexión al inicializar
checkConnection();

export default pool;
