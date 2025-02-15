// Colección de Usuarios (Compradores)
{
  _id: ObjectId,
  nombre: String,
  apellido: String,
  email: String,
  telefono: String,
  direccion: {
    calle: String,
    ciudad: String,
    estado: String,
    codigoPostal: String,
    pais: String
  },
  fechaRegistro: Date
}

// Colección de Rifas
{
  _id: ObjectId,
  nombre: String,
  descripcion: String,
  precio: Number,
  fechaInicio: Date,
  fechaFin: Date,
  fechaSorteo: Date,
  premios: [{
    nombre: String,
    descripcion: String,
    valor: Number
  }],
  numeroTotalTickets: Number,
  ticketsVendidos: Number,
  estado: String // 'activa', 'finalizada', 'cancelada'
}

// Colección de Tickets
{
  _id: ObjectId,
  numeroTicket: Number,
  rifaId: ObjectId,
  compradorId: ObjectId,
  fechaCompra: Date,
  estado: String // 'valido', 'ganador', 'perdedor'
}

// Colección de Transacciones
{
  _id: ObjectId,
  compradorId: ObjectId,
  rifaId: ObjectId,
  ticketId: ObjectId,
  monto: Number,
  fechaTransaccion: Date,
  metodoPago: String,
  estadoPago: String, // 'completado', 'pendiente', 'fallido'
  referenciaWompi: String
}