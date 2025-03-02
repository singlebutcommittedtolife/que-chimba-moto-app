import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';


const Confirmation = ({ transactionDetails }) => {
  const { reference, amount, createdAt } = transactionDetails || {};

    return (
        <div>
              <Header/>
              <div className="container mx-auto px-4 py-8">
                <section className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">¡Compra Exitosa!</h1>
                    <p className="text-lg">Gracias por realizar su compra.</p>
                    <p className="text-lg my-4">Detalles de la transacción:</p>
                    <div className="bg-gray-100 rounded-lg shadow-md p-6 inline-block text-left">
                        <p><strong>Número de Referencia:</strong> {reference}</p>
                        <p><strong>Monto Total:</strong> ${amount?.toLocaleString()}</p>
                        <p><strong>Fecha:</strong> {new Date(createdAt).toLocaleString()}</p>
                    </div>
                </section>
            </div>
                      
              <Footer/>

        </div>
      );
    };
export default Confirmation;
