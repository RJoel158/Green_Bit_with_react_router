// test-connection.js - Prueba rápida de conexión
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

console.log('=== PRUEBA DE CONEXIÓN ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');

const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false
    });

    console.log('✅ Conexión exitosa');
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Código:', error.code);
  }
};

testConnection();