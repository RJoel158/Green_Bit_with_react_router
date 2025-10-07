// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from './Routes/userRoutes.js';
import materialRoutes from './Routes/materialRoutes.js';
import requestRoutes from './Routes/requestRoutes.js';
import { verifyEmailConnection } from './Services/emailService.js';
import { checkConnection } from './Config/DBConnect.js';

// Cargar variables de entorno
dotenv.config();

// Debug: Verificar variables de entorno de BD
console.log('🔍 Variables de entorno de BD:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***configured***' : 'NOT SET');

const app = express();

// Configurar CORS usando variable de entorno
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Servir archivos estáticos (imágenes)
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(uploadDir));

// Usar rutas de usuarios
app.use("/api/users", userRoutes);
app.use("/api/material", materialRoutes);
app.use("/api/request", requestRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Ruta para verificar el estado de la base de datos
app.get('/api/db-status', async (req, res) => {
  const isConnected = await checkConnection();
  res.json({
    database: {
      connected: isConnected,
      host: process.env.DB_HOST,
      status: isConnected ? 'online' : 'offline'
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 ${process.env.APP_NAME || 'GreenBit'} v${process.env.APP_VERSION || '1.0.0'}`);
  console.log(`🌐 Servidor escuchando en puerto ${PORT}`);
  console.log(`📱 Frontend permitido desde: ${process.env.FRONTEND_URL}`);
  console.log(`🗄️  Base de datos: ${process.env.DB_HOST}/${process.env.DB_NAME}`);
  console.log(`📂 Directorio de uploads: ${uploadDir}`);
  
  // Verificar conexión de email al iniciar
  const emailReady = await verifyEmailConnection();
  if (emailReady) {
    console.log("📧 Servicio de email listo para enviar credenciales");
  } else {
    console.log("⚠️ Servicio de email no disponible - revisa tu configuración .env");
  }
  
  console.log("✅ Servidor completamente iniciado");
});