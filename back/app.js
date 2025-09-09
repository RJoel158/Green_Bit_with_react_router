import express from 'express';
import cors from 'cors';
import mysql from 'mysql';
import { Resend } from 'resend';


const app = express();
const resend = new Resend("re_9xSftQrK_D74rMR9LGz6eN1VZWr7iB7Cu");
app.get("/", async (req, res) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["svr0035567@est.univalle.edu"],
    subject: "Hola Tilin",
    html: "<strong> ya funca el correo che !</strong>",
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
});





const corsOptions = {
    origin: 'http://localhost:5173', // Cambia este puerto si tu Vite usa otro
};
app.use(cors(corsOptions));
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({ 
    host: "mysql-reciclaje.alwaysdata.net",
    user: "reciclaje_admin",
    password: "Univalle.",
    database: "reciclaje_proyecto1db",
});
db.connect(err => {
    if (err) return console.error('Error conectando a la BD:', err);
    console.log('Conectado a la base de datos');
});

// Ruta para registrar usuario desde React
app.post('/api/register', (req, res) => {
    const { username, email, phone, role_id } = req.body;

    if (!username || !email || !phone) {
        return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
    }

    const query = 'INSERT INTO users (username, email, phone, role_id, state) VALUES (?, ?, ?, ?, 0)';
    db.query(query, [username, email, phone, role_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Error al registrar el usuario' });
        }
        res.status(201).json({ success: true, id: results.insertId });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
