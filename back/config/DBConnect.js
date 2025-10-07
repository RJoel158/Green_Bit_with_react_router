// config/DBConnect.js
// Conexión a la base de datos usando mysql2/promise
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql-reciclaje.alwaysdata.net",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "reciclaje",
  password: process.env.DB_PASSWORD || "reciclaje2024*",
  database: process.env.DB_NAME || "reciclaje_365377",
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

console.log(`🔗 Pool de MySQL inicializado para ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

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
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    return false;
  }
};

// Verificar conexión al inicializar
checkConnection();

export default pool;
