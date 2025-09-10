// server.js
import express from "express";
import cors from "cors";
import userRoutes from './Routes/userRoutes.js';
import { verifyEmailConnection } from './Services/emailService.js';

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Usar rutas de usuarios
app.use("/api/users", userRoutes);

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