// server.js
import express from "express";
import cors from "cors";
import userRoutes from './Routes/userRoutes.js';


const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Usar rutas de usuarios
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
