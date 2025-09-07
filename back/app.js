import express from 'express'; // Importa express
import cors from 'cors'; // Importa el paquete cors

const app = express(); // Crea una aplicación de express

const corsOptions = {
    origin: 'http://localhost:'
};   // Para manejar navegadores antiguos

app.use(cors(corsOptions)); // Usa el middleware cors con las opciones definidas

app.get('/', (req, res) => { 
    res.json({hola:'mundo'}); // Ruta de prueba
});  

app.listen(3000, () =>console.log('Server listening on port 3000')); // Inicia el servidor en el puerto 3000
