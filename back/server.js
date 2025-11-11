// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './Routes/index.js';
import { verifyEmailConnection } from './Services/emailService.js';
import DBConnect from './config/DBConnect.js';

// Cargar variables de entorno
dotenv.config();

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorios necesarios para uploads
const ensureUploadDirectories = () => {
  const uploadDirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/temp'),
    path.join(__dirname, 'uploads/images'),
    path.join(__dirname, 'uploads/announcements')
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Directorio creado: ${dir}`);
    }
  });
};

// Crear directorios al iniciar
ensureUploadDirectories();

// Debug: Verificar variables de entorno de BD
console.log('🔍 Variables de entorno de BD:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***configured***' : 'NOT SET');

const app = express();
const server = createServer(app);

// Configurar CORS usando variable de entorno
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
};

// Configurar Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Mapa para mantener usuarios conectados
const connectedUsers = new Map();

app.use(cors(corsOptions));
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Servir archivos estáticos (imágenes)
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(uploadDir));

// ========================================
// RUTAS CENTRALIZADAS
// ========================================
// Todas las rutas están organizadas en un único lugar: Routes/index.js
// Se montan aquí con los prefijos de API correspondientes
app.use('/api', routes);

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

// Configurar Socket.IO
io.on('connection', (socket) => {
  console.log('[Socket.IO] Usuario conectado:', socket.id);

  // El cliente debe enviar su userId al conectarse
  socket.on('join', (userId) => {
    if (userId) {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`[Socket.IO] Usuario ${userId} registrado con socket ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`[Socket.IO] Usuario ${socket.userId} desconectado`);
    }
  });
});

// Función para enviar notificación en tiempo real
export const sendRealTimeNotification = (userId, notification) => {
  const socketId = connectedUsers.get(String(userId));
  if (socketId) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('notification', notification);
      console.log(`[Socket.IO] Notificación enviada a usuario ${userId}:`, notification.title);
      return true;
    }
  }
  console.log(`[Socket.IO] Usuario ${userId} no conectado`);
  return false;
};

const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ========================================

// 404 handler - debe ir antes del error handler
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada: ' + req.method + ' ' + req.path 
  });
});

// Error handler global - SIEMPRE debe ser el último middleware
app.use((err, req, res, next) => {
  console.error('[ERROR GLOBAL]:', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    stack: err.stack.split('\n').slice(0, 3).join('\n')
  });
  
  res.status(err.status || 500).json({ 
    success: false, 
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

server.listen(PORT, async () => {
  console.log(`🚀 ${process.env.APP_NAME || 'GreenBit'} v${process.env.APP_VERSION || '1.0.0'}`);
  console.log(`🌐 Servidor + Socket.IO escuchando en puerto ${PORT}`);
  console.log(`📱 Frontend permitido desde: ${process.env.FRONTEND_URL}`);
  console.log(`🗄️  Base de datos: ${process.env.DB_HOST}/${process.env.DB_NAME}`);
  console.log(`📂 Directorio de uploads: ${uploadDir}`);
  console.log(`🔔 Sistema de notificaciones en tiempo real activo`);
  
  // Verificar conexión de email al iniciar
  const emailReady = await verifyEmailConnection();
  if (emailReady) {
    console.log("📧 Servicio de email listo para enviar credenciales");
  } else {
    console.log("⚠️ Servicio de email no disponible - revisa tu configuración .env");
  }
  
  console.log("✅ Servidor completamente iniciado");
});