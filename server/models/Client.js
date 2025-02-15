// server/models/Client.js
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  user: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    cellphone: { type: String, required: true },
    documentType: { type: String, required: true },
    documentNumber: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true }
    },
    registryDate: { type: Date, required: true },
    registryUser: { type: String, required: true }
  }
});

module.exports = mongoose.model('Client', ClientSchema);
