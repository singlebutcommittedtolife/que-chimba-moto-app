import Footer from '../../components/footer/Footer'
import Header from '../../components/header/Header'
import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { createClient } from '../../services/clientService';  
import { generateTicket } from '../../services/ticketPurchaseService';  
import { getActiveRaffle } from '../../services/raffleService';  
import { createTransaction } from '../../services/transactionService';  
import { updateTransaction } from '../../services/transactionService';  
import {createRaffleNumber} from "../../services/raffleNumberService";


import { sendMail } from '../../services/emailService';  


const Purchase = () => {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const initialQuantity = parseInt(queryParams.get('quantity')) || 1;
  const [raffleNumber,setRaffleNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const publicKey = process.env.REACT_APP_WOMPI_API_KEY_PUB;

  const [selectedRaffles, setSelectedRaffles] = useState([]); // Inicializa como un arreglo

  const navigate = useNavigate();
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    tipoDocumento: '',
    documento: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    correo: ''
  });


   // Nuevo useEffect para cargar la rifa al entrar en la aplicación
   useEffect(() => {
    console.log("useEffect 1")
    console.log("wompy key "+publicKey);
    console.log("initialQuantity"+initialQuantity)
    const fetchRaffle = async () => {
      try {
        const data = await getActiveRaffle(); // Llama al servicio
        setSelectedRaffles([
          {
            id: data.id,
            name: data.nameRaffle,
            price: data.price,
            quantity: initialQuantity
          }
        ]);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos de la rifa');
        setLoading(false);
      }
    };

    fetchRaffle(); // Llamada al servicio al montar el componente
  }, []); // El array vacío asegura que esto se ejecuta solo una vez

  
  useEffect(() => {
    console.log("useEffect 2")

    calculateTotal();
  }, [selectedRaffles]);

  useEffect(() => {
    console.log("🎯 raffleNumber actualizado:", raffleNumber);
}, [raffleNumber]);

  const calculateTotal = () => {

    const total = selectedRaffles.reduce((sum, raffle) => {
      console.log(raffle)
      const price = parseFloat(raffle.price['$numberDecimal']); // Convertir `$numberDecimal` a número
      const quantity = raffle.quantity || 0; // Usar 0 como valor predeterminado para quantity
      return sum + (price * quantity);
    }, 0);
    console.log("selectedRaffles[0] "+selectedRaffles[0])

    setTotalAmount(total);
    const quantity=selectedRaffles[0]?.quantity || 0;
    console.log("quantity[0] "+quantity)

    setRaffleNumber(quantity); // Usar `setRaffleNumber` para actualizar la variable de estado

    console.log('raffleNumer calculateTotal '+raffleNumber)
  };

  const handleQuantityChange = (id, newQuantity) => {
    setSelectedRaffles(prevRaffles =>
      prevRaffles.map(raffle =>
        raffle.id === id ? { ...raffle, quantity: Math.max(2, newQuantity) } : raffle
      )
    );
  };



  const handleRemoveRaffle = (id) => {
    setSelectedRaffles(prevRaffles => prevRaffles.filter(raffle => raffle.id !== id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Verificar si el campo es 'nombre' o algún campo que deba permitir solo letras
    if (name === "nombre" || name === "apellidos"||name === "ciudad") {
      // Usar expresión regular para permitir solo letras, acentos y espacios
      const onlyLetters = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      
      setFormData(prevState => ({
        ...prevState,
        [name]: onlyLetters  // Actualizar el valor con solo letras
      }));
    } else {
      // Si no es un campo restringido, actualizar normalmente
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
    
  const createNewClient = async () => {
    const clientData = {
      user: {
        id: formData.documento,
        name: formData.nombre,
        lastName: formData.apellidos,
        documentType: formData.tipoDocumento,
        documentNumber: formData.documento,
        address: {
          country: "Colombia",
          street: formData.direccion,
          city: formData.ciudad,
        },
        cellphone: formData.telefono,
        email: formData.correo,
        registryDate: new Date(),
        registryUser: "chimbaMoto",
      },
    };
  
    try {
      const newClient = await createClient(clientData);
      console.log("Cliente creado:", newClient);
      return newClient;
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      throw new Error("Error al crear el cliente");
    }
  };
  
  const generateTicketsForClient = async (clientId, raffleId) => {
    try {
      console.log("🔹 Generando un ticket para el cliente:", clientId);
      console.log("🎟️ Cantidad de números de rifa a generar:", raffleNumber);
  
      let remainingTickets = raffleNumber;
  
      // 1️⃣ Crear el ticket solo una vez antes del while
      const ticketPurchaseData = {
        raffleId,
        clientId,
        registryDate: new Date(),
      };
  
      const newTicketPurchase = await generateTicket(ticketPurchaseData);
      console.log("Ticket creado:", newTicketPurchase);
  
      const assignedNumbers = []; // Guardará los números asignados
      console.log(` Número de rifa asignado: ${remainingTickets}`);

      // 🔄 2️⃣ Generar múltiples números de rifa para este ticket
      while (remainingTickets > 0) {
        try {
          console.log(` Número de rifa asignado 2: ${remainingTickets}`);

          // 3️⃣ Llamar al servicio del backend para asignar un número de rifa aleatorio

          const raffleNumberVal = {
            raffleId,
            ticketId: newTicketPurchase.ticketId,
            clientId,
          };
          const assignedRaffleNumber = await createRaffleNumber(raffleNumberVal);
  
          console.log(` Número de rifa asignado: ${assignedRaffleNumber.number}`);
          assignedNumbers.push(assignedRaffleNumber);
          console.log("assignedNumbers ",assignedNumbers)
          console.log("assignedNumbers ",assignedNumbers.assignedRaffleNumber)

        } catch (error) {
          console.error(" Error al asignar un número de rifa purchase: ", error);
        }
        remainingTickets--;
      }
  
      // 🔥 4️⃣ Retornar el ticket con todos los números asignados
      return { newTicketPurchase, assignedNumbers };
  
    } catch (error) {
      console.error("Error al generar los tickets:", error);
      throw new Error("Error al generar los tickets");
    }
  };


  const processPaymentWithWompi = (clientId, ticketId) => {
    setLoading(true);
  
    return new Promise(async (resolve, reject) => {
      if (!window.WidgetCheckout) {
        console.error("Wompi WidgetCheckout no está cargado en la página.");
        return reject(new Error("Wompi no está disponible."));
      }
  
      const transactionReference = `transaction-${Date.now()}`;
      const amountInCents = totalAmount * 100;
  
      console.log("Inicializando el checkout de Wompi...");
  
      // 1️ Crear la transacción inmediatamente al abrir el modal
      const initialTransaction = {
        reference: transactionReference,
        amount: amountInCents,
        currency: "COP",
        status: "CREATED",
        createdAt: new Date(),
        createdFromFrontend: true,
      };
  
      try {
        await createTransactionRecord(initialTransaction);
        console.log(" Transacción creada con estado 'CREATED'");
      } catch (error) {
        console.error(" Error al crear la transacción inicial:", error);
        return reject(error);
      }
  
      // 2️ Inicializar Wompi Checkout
      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: amountInCents,
        reference: transactionReference,
        publicKey: publicKey,
      });
  
      console.log(" Checkout inicializado. Mostrando modal de pago...");
  
      // 3️ Abrir el modal y esperar resultado
      checkout.open(async (result) => {
        const transaction = result.transaction;
  
        if (!transaction) {
          console.error(" No se recibió información de la transacción");
          return reject(new Error("No se recibió información de la transacción"));
        }
  
        if (transaction.status === "APPROVED") {
          try {
            // 4️⃣ Actualizar transacción con datos finales
            await updateTransactionRecord(transactionReference, {
              status: "APPROVED",
              wompiTransactionId: transaction.id,
              clientId,
              ticketId,
              updatedAt: new Date(),
              updatedFromFrontend: true,
            });
  
            console.log(" Transacción actualizada como 'APPROVED'");
            resolve(transaction);
          } catch (error) {
            console.error(" Error al actualizar la transacción aprobada:", error);
            reject(error);
          }
        } else {
          console.warn(` Transacción con estado: ${transaction.status}`);
          reject(new Error(`Transacción rechazada: ${transaction.status}`));
        }
      });
    });
  };
  
  const createTransactionRecord = async (transaction) => {
    try {
      await createTransaction(transaction);
      console.log("Transacción registrada:", transaction);
    } catch (error) {
      console.error("Error al registrar la transacción:", error);
      throw new Error("Error al registrar la transacción");
    }
  };


  const updateTransactionRecord = async (transactionReference, updateData) => {
    try {
      await updateTransaction(transactionReference,updateData);
      console.log("Transacción actualizada:", transactionReference);
    } catch (error) {
      console.error("Error al actualizar la transacción:", error);
      throw new Error("Error al actualizar la transacción");
    }
  };

  

  const handleSubmit = async (e) => {
    setLoading(true);

    e.preventDefault();
  
    try {
      console.log("Iniciando proceso de compra...");
  
      // Paso 1: Crear cliente
      const newClient = await createNewClient();
      const raffleId = selectedRaffles[0]?.id; // Tomar la primera rifa seleccionada
      console.log("📌 Raffle ID seleccionado:", raffleId);
     
      // Paso 2: Generar tickets
      const { newTicketPurchase, assignedNumbers } =await generateTicketsForClient(newClient.user.id,raffleId);
      console.log("response ticket  "+newTicketPurchase)
      // Paso 3: Procesar pago con Wompi
      const transaction = await processPaymentWithWompi(newClient.user.id,newTicketPurchase.ticketId);
      console.log("transaction despues "+transaction)

      await sendTransactionEmail(transaction,assignedNumbers);
  
      // Redireccionar a la página de confirmación

      navigate("/confirmation", { state: { transaction,assignedNumbers } });
    } catch (error) {
      console.error("Error en el proceso de compra:", error.message);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const sendTransactionEmail = async (transaction,assignedNumbers) => {

    const emailInfo=({
      to:transaction.customerEmail,
      subject: "Confirmación de pago - Que Chimba Moto 🏍️",
      text: `Hola ${transaction.customerData.fullName}, tu pago ha sido procesado correctamente.`,
      html: `
      <h1>¡Hola ${transaction.customerData.fullName}!</h1>

      <strong><p>Detalles de la transacción en Que Chimba de Moto:</p></strong>
      <ul>
        <li><strong>👤 Nombre:</strong> ${transaction?.customerData?.fullName}</li>
        <li><strong>📧 Email:</strong> ${transaction.customerEmail}</li>
        <li><strong>🧾 Nº de Referencia:</strong> ${transaction?.reference}</li>
        <li><strong>💳 Método de pago:</strong> ${transaction?.paymentMethod?.extra?.name}</li>
        <li><strong>💰 Monto Total:</strong> ${(transaction.amountInCents / 100).toLocaleString("es-CO", { style: "currency", currency: "COP" })} COP</li>
        <li><strong>🕒 Fecha:</strong> ${new Date(transaction.createdAt).toLocaleString("es-CO")}</li>
        <li><strong>🎟️ Tus boletas:</strong>
          <ul>
            ${assignedNumbers.map((r) => `<li>🎫 ${r.number}</li>`).join("")}
          </ul>
        </li>
        </ul>
      <p>Gracias por tu compra en <strong>Que Chimba de Moto</strong> 🏍️</p>
    `,
    });
     await sendMail(emailInfo);

  }

  
  return (
    <div>
            {loading && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="loader">

        <p className="text-white text-lg font-semibold">Cargando...</p>

        </div>
      </div>
    )}
      <Header/>

      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Compra de Tickets</h1>
      <div className="flex flex-col lg:flex-row lg:space-x-6">
      {/* Formulario de Datos Personales */}
      <form onSubmit={handleSubmit} className="order-2 lg:order-1 lg:w-1/2 bg-white shadow-md rounded px-8 pt-6 pb-8">  
      <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
            Nombre
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="nombre"
            type="text"
            name="nombre"
            pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+" 
            maxLength={40}
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apellidos">
            Apellidos
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="apellidos"
            type="text"
            maxLength={40}
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipoDocumento">
            Tipo de Documento
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="tipoDocumento"
            name="tipoDocumento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione...</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="PP">Pasaporte</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="documento">
            Número de Documento
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="documento"
            type="text"
            maxLength={15}
            name="documento"
            value={formData.documento}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="direccion">
            Dirección
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="direccion"
            type="text"
            name="direccion"
            value={formData.direccion}
            maxLength={50}

            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ciudad">
            Ciudad
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="ciudad"
            type="text"
            maxLength={20}
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="telefono">
            Teléfono
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="telefono"
            type="tel"
            name="telefono"
            maxLength={16}
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="correo">
            Correo Electrónico
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="correo"
            type="email"
            name="correo"
            maxLength={60}
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Comprar Tickets
          </button>
        </div>
      </form>
      {/* Lista de Rifas Seleccionadas */}
      <div className="order-1 lg:order-2 lg:w-1/2 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
      <h2 className="text-xl font-bold mb-4">Tus Fondos Seleccionados</h2>
      {selectedRaffles.map((raffle) => (
          <div key={raffle.id} className="flex items-center justify-between mb-4">
            <span>{raffle.name}</span>
            <div>
            <button 
                onClick={() => handleQuantityChange(raffle.id, raffle.quantity - 1)} 
                className={`bg-gray-200 px-2 py-1 rounded ${raffle.quantity === 2 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={raffle.quantity === 2} >
                -
              </button>
              <span className="mx-2">{raffle.quantity}</span>
              <button onClick={() => handleQuantityChange(raffle.id, raffle.quantity + 1)} className="bg-gray-200 px-2 py-1 rounded">+</button>
              <button onClick={() => handleRemoveRaffle(raffle.id)} className="ml-4 text-red-500">Eliminar</button>
            </div>
          </div>
        ))}

        <p className="text-lg font-bold mt-4">Total a pagar: ${totalAmount.toLocaleString()}</p>
      </div>

      
    </div>
    </div>

          <Footer/>  

    </div>
  );
};

export default Purchase;