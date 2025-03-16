import Footer from '../../components/footer/Footer'
import Header from '../../components/header/Header'
import React, { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { createClient } from '../../services/clientService';  
import { generateTicket } from '../../services/ticketPurchaseService';  
import { getActiveRaffle } from '../../services/raffleService';  
import { createTransaction } from '../../services/transactionService';  
import { updateTransaction } from '../../services/transactionService';  


import { validateTransactionOnServer } from '../../services/transactionService';  
import { sendMail } from '../../services/emailService';  


const Purchase = () => {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const initialQuantity = parseInt(queryParams.get('quantity')) || 1;
  const [raffleNumber,setRaffleNumber] = useState(0);
  const [loading, setLoading] = useState(true);
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
        raffle.id === id ? { ...raffle, quantity: Math.max(1, newQuantity) } : raffle
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
  
  const generateTicketsForClient = async (clientId) => {
    try {
      console.log("generateTicketsForClient "+raffleNumber)
      let remainingTickets = raffleNumber;
  
      while (remainingTickets > 0) {
        const ticketPurchaseData = {
          raffleNumber: "123", // Reemplazar con lógica real si es necesario
          clientId,
          registryDate: new Date(),
          registryUser: "chimbaMoto",
        };
  
        const newTicketPurchase = await generateTicket(ticketPurchaseData);
        console.log("Ticket Purchase creado:", newTicketPurchase);
  
        remainingTickets--;
        return newTicketPurchase;
      }

    } catch (error) {
      console.error("Error al generar los tickets:", error);
      throw new Error("Error al generar los tickets");
    }
  };
  const handleWompiPayment = () => {
    const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: 5000 * 100, // Monto de prueba
        reference: `transaction-${Date.now()}`, // Referencia única
        publicKey:publicKey// Llave pública de Sandbox
    });

    // Abrir el widget para obtener el token de la tarjeta
    checkout.open(async (result) => {
      const transaction = result.transaction;
      console.log("transaction "+transaction)
      
      if (transaction.status === 'APPROVED') {
        console.log('Token generado:', transaction.payment_method);

        try {
          // Llamar al servicio para crear la transacción
          const data = await createTransaction({
            totalAmount: totalAmount, // Monto total en COP
            customerEmail: 'cliente@ejemplo.com', // Reemplaza con el correo del usuario
            paymentToken: transaction.payment_method.token, // Token generado por el widget
          });

          if (data.error) {
            alert('Error al procesar el pago en el servidor: ' + data.message);
          } else {
            alert('Pago aprobado en el servidor: ' + data.data.id);
          }
        } catch (error) {
          console.error('Error al enviar la transacción al servidor:', error);
          alert('Error en la comunicación con el servidor.');
        }
      } else {
        alert('Transacción rechazada: ' + transaction.status);
      }

      setLoading(false);
    });
};




  const processPaymentWithWompi2 = async (customerId) => {
    return new Promise(async (resolve, reject) => {
      const transactionReference = `transaction-${Date.now()}`;
  
      // 1. Inicializar Wompi Checkout
      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: totalAmount * 100,
        reference: transactionReference,
        clientId:customerId,
        publicKey: publicKey, // Llave pública de Wompi
      });
  
      console.log("Checkout inicializado, ahora guardando la transacción en la base de datos...");
  
      // 2. Guardar la transacción en la base de datos antes de abrir el checkout
      const initialTransaction = {
        reference: transactionReference,
        amount: totalAmount,
        currency: "COP",
        status: "CREATED", // Estado inicial antes de finalizar el pago
        createdAt: new Date(),
      };
      console.log("createTransactionRecord",initialTransaction)
  
      try {
        await createTransactionRecord(initialTransaction);
        console.log("Transacción guardada en la base de datos. Ahora abriendo el checkout...");
      } catch (error) {
        return reject(error); // Si falla la creación, rechazamos la promesa
      }
  
      // 3. Ahora sí abrimos el checkout para que el usuario pague
      checkout.open(async (result) => {
        console.log("Resultado del pago:", result);
  
        if (result.transaction) {
          const updatedTransaction = {
            status: result.transaction.status,
            wompiTransactionId: result.transaction.id,
            updatedAt: new Date(),
          };
  
          try {
            // 4. Actualizar la transacción en la base de datos con el estado final
            await updateTransactionRecord(transactionReference, updatedTransaction);
            resolve(result.transaction);
          } catch (error) {
            reject(error);
          }
        } else {
          reject({ error: "No se recibió información de Wompi", details: result });
        }
      });
    });
  };

  const processPaymentWithWompi = ( clientId,raffleId ) => {
    console.log("Bienvenida processPaymentWithWompi "+clientId);
  
    return new Promise(async (resolve, reject) => {
      if (!window.WidgetCheckout) {
        console.error("Wompi WidgetCheckout no está cargado en la página.");
        return reject(new Error("Error: Wompi no está disponible."));
      }
  
      const transactionReference = `transaction-${Date.now()}`;
  
      console.log("Inicializando el checkout de Wompi...");
  
      // 1️⃣ Inicializar Wompi Checkout
      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: totalAmount * 100,
        reference: transactionReference,
        publicKey: publicKey,
      });
  
      console.log("Checkout inicializado. Mostrando modal de pago...");
  
      // 2️⃣ ABRIR EL MODAL DEL CHECKOUT
      checkout.open(async (result) => {
        console.log("Resultado del pago recibido:", result);
  
        const transaction = result.transaction;
  
        if (!transaction) {
          console.error("No se recibió información de la transacción.");
          return reject(new Error("No se recibió información de la transacción"));
        }
  
        // 3️⃣ Guardar la transacción en la base de datos justo después de abrir el modal
        console.log("Guardando transacción en la base de datos...");
        const initialTransaction = {
          reference: transactionReference,
          amount: totalAmount* 100,
          currency: "COP",
          status: "creada",
          clientId: clientId,
          raffleId:raffleId,
          createdAt: new Date(),
        };
        console.log("initialTransaction..",initialTransaction);

        try {
          await createTransactionRecord(initialTransaction);
          console.log("Transacción guardada en la base de datos.");
        } catch (error) {
          console.error("Error al guardar la transacción:", error);
          return reject(error);
        }
  
        // 4️⃣ Validar y actualizar la transacción según el resultado de Wompi
        if (transaction.status === "APPROVED") {
          console.log("Transacción aprobada en Wompi:", transaction);

              // 7️⃣ Actualizar la transacción con el resultado final
              await updateTransactionRecord(transactionReference, {
                status: "completado",
                wompiTransactionId: transaction.id,
                updatedAt: new Date(),
              });

              resolve(transaction);
        } else {
          console.error("Transacción rechazada o fallida:", transaction.status);
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
    e.preventDefault();
  
    try {
      console.log("Iniciando proceso de compra...");
  
      // Paso 1: Crear cliente
      const newClient = await createNewClient();
  
      // Paso 2: Generar tickets
      const ticket=await generateTicketsForClient(newClient._id);
      console.log("response ticket  "+ticket)
      // Paso 3: Procesar pago con Wompi
      const transaction = await processPaymentWithWompi(newClient._id,ticket.ticketNumber);
      console.log("transaction despues "+transaction)
      await sendTransactionEmail(transaction);
  
      // Redireccionar a la página de confirmación
      navigate("/confirmation", { state: { transaction } });
    } catch (error) {
      console.error("Error en el proceso de compra:", error.message);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const sendTransactionEmail = async (transaction) => {
    console.log("sendEmal")

    const emailInfo=({
      to:transaction.customerEmail,
      subject: "Confirmación de pago - Que Chimba Moto 🏍️",
      text: `Hola ${transaction.customerData.fullName}, tu pago ha sido procesado correctamente.`,
      html: `
      <h1>¡Hola ${transaction.customerData.fullName}!</h1>
      <p>Tu pago ha sido procesado correctamente.</p>
      <p>Detalles de la transacción:</p>
      <ul>
        <li><strong>Email:</strong> ${transaction.customerEmail}</li>
        <li><strong>Monto:</strong> 
        ${(transaction.amountInCents/100).toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
        })} COP</li>
        <li><strong>Referencia:</strong> ${transaction.reference}</li>
        <li><strong>Estado:</strong> ${transaction.status}</li>
      </ul>
      <p>Gracias por tu compra en <strong>Que Chimba Moto</strong> 🏍️</p>
    `,
    });
     await sendMail(emailInfo);

  }

  
  return (
    <div>
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
            maxLength={50}
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
            maxLength={50}
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
            maxLength={80}
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
              <button onClick={() => handleQuantityChange(raffle.id, raffle.quantity - 1)} className="bg-gray-200 px-2 py-1 rounded">-</button>
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