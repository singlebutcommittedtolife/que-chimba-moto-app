// server/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const clientRoutes = require('./routes/client'); // Asegúrate de que la ruta es correcta
const ticketPurchaseRoutes= require('./routes/ticketPurchase');
const raffleRoutes= require('./routes/raffle');
const transactionRoutes= require('./routes/transaction');
const emailRoutes= require('./routes/email');
const raffleNumberRoutes = require('./routes/raffleNumber');

// Configurar CORS para permitir que el frontend se comunique con el backend
app.use(cors());



// Conectar a MongoDB (cambia la URL por la de tu base de datos)
mongoose.connect('mongodb+srv://quechimbamoto:gOAXx2JGpS4pV3rt@cluster0.00p1o.mongodb.net/queChimbaMoto?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB', err));

// Configurar el puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.use(clientRoutes);  // Esta línea monta las rutas de cliente
app.use(ticketPurchaseRoutes);  // Esta línea monta las rutas de cliente
app.use(raffleRoutes);  // Esta línea monta las rutas de rifas
app.use(transactionRoutes);  // Esta línea monta las rutas de rifas
app.use(emailRoutes);  // Esta línea monta las rutas de rifas
app.use(raffleNumberRoutes);  // Esta línea monta las rutas de rifas

// Middleware para manejar JSON
app.use(express.json());
