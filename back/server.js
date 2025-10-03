// server.js
import express from "express";
import cors from "cors";
import userRoutes from './Routes/userRoutes.js';
import materialRoutes from './Routes/materialRoutes.js';
import requestRoutes from './Routes/requestRoutes.js';
import { verifyEmailConnection } from './Services/emailService.js';
import { checkConnection } from './Config/DBConnect.js';

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static('uploads'));

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
      host: 'mysql-reciclaje.alwaysdata.net',
      status: isConnected ? 'online' : 'offline'
    },
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  console.log(`📱 Frontend permitido desde: http://localhost:5173`);
  
  // Verificar conexión de email al iniciar
  const emailReady = await verifyEmailConnection();
  if (emailReady) {
    console.log("📧 Servicio de email listo para enviar credenciales");
  } else {
    console.log("⚠️ Servicio de email no disponible - revisa tu configuración .env");
  }
  
  console.log("✅ Servidor completamente iniciado");
});