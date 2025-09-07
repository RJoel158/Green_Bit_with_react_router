import express from 'express'; // Importa express
import cors from 'cors'; // Importa el paquete cors
import mysql from 'mysql'; // Importa el paquete mysql

const app = express(); // Crea una aplicación de express

const corsOptions = {
    origin: 'http://localhost:'
};   // Para manejar navegadores antiguos

app.use(cors(corsOptions)); // Usa el middleware cors con las opciones definidas
app.use(express.json()); // Middleware para parsear JSON

const db = mysql.createConnection({ 
    host: 'mysql-reciclaje.alwaysdata.net',
    user:  'reciclajedb',
    password: 'Univalle.',
    database: 'reciclajebd'     
}); // Configura la conexión a la base de datos

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
}); // Conecta a la base de datos y maneja errores  


// Ruta para obtener todos los usuarios
app.get ('/users', (req, res) => { 
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).send({
                error: 'Error al obtener usuarios'
            })
        }else{
            res.json(results)
        }
    })
})

// Ruta para agregar un nuevo usuario
app.post('/users/add', (req, res) => {
    const { name, email } = req.body;
    const query='INSERT INTO users (username, email) VALUES (?, ?)'
    db.query(query, [name, email], (err, results) => {
        if (err) {
            res.status(500).send({
                error: 'Error al agregar usuario'
            });
        } else {
            res.status(201).json({
                id: results.insertId,
                name,
                email
            });
        }
    })
})


// Ruta para actualizar un usuario existente
app.put('/users/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
    db.query(query, [name, email, id], (err, results) => {
        if (err) {
            res.status(500).send({
                error: 'Error al actualizar usuario'
            });
        } else {
            res.json({
                id,
                name,
                email
            });
        }
    })
});



// Ruta para eliminar un usuario
app.delete('/users/delete/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send({

                error: 'Error al eliminar usuario'
            });
        } else {
            res.status(204).send(); // No content
        }
    })
});

const PORT = process.env.PORT || 3000; // Define el puerto
app.listen(PORT, () =>console.log(`Server listening on port ${PORT}`)); // Inicia el servidor en el puerto definido

