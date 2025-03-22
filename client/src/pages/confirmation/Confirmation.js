import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useLocation } from "react-router-dom";

const Confirmation = () => {
  const location = useLocation();
  const transaction = location.state?.transaction;
  const raffleNumbers = location.state?.assignedNumbers;


  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
      <Header />

      <main className="container mx-auto px-4 py-10 flex-1">
        <section className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-green-600 mb-6">
            🎉 ¡Pago realizado con éxito!
          </h1>

          <p className="text-center text-gray-700 mb-10">
            Aquí están los detalles de tu compra. También recibirás una copia por correo.
          </p>

          <div className="space-y-4 text-gray-800 text-lg">
            <div><strong>👤 Nombre:</strong> {transaction?.customerData?.fullName}</div>
            <div><strong>📧 Email:</strong> {transaction?.customerEmail}</div>
            <div><strong>🧾 Nº de Referencia:</strong> {transaction?.reference}</div>
            <div><strong>💳 Método de pago:</strong> {transaction?.paymentMethod?.extra?.name}</div>
            <div><strong>💰 Monto Total:</strong> {(transaction.amountInCents / 100).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</div>
            <div><strong>🕒 Fecha:</strong> {new Date(transaction.createdAt).toLocaleString("es-CO")}</div>
          </div>

          <div className="mt-10">
            <p className="text-xl font-semibold mb-4">🎟️ Tus boletas:</p>
            <div className="flex flex-wrap gap-3">
              {raffleNumbers.map((raffleNumber, index) => (
                <div
                  key={index}
                  className="bg-yellow-100 border border-yellow-400 text-yellow-900 px-5 py-2 rounded-md font-mono shadow-sm"
                >
                  🎫 {raffleNumber.number}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-green-700 mt-10 font-medium">
            ¡Gracias por tu compra y mucha suerte en el sorteo! 🍀
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Confirmation;
