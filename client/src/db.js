const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  try {
    // Reemplaza con tu URL de conexión de MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión: ${error.message}`);
    process.exit(1); // Detiene el proceso si falla la conexión
  }
};

module.exports = connectDB;