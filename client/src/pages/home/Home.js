import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { getActiveRaffle } from '../../services/raffleService';  

const TicketButton = ({ quantity, price }) => (
  <Link 
    to={`/purchase?quantity=${quantity}`} 
    className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition duration-300 text-sm"
  >
    Comprar {quantity} boleta{quantity > 1 ? 's' : ''} - ${(price* quantity).toLocaleString()}
  </Link>
);


const Home = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [activeRaffle, setActiveRaffle] = useState({});
  // Nuevo useEffect para cargar la rifa al entrar en la aplicación
  useEffect(() => {
    console.log("useEffect 1");
    const fetchRaffle = async () => {
      try {
        const data = await getActiveRaffle(); // Llama al servicio
        setActiveRaffle({
          id: data.id,
          name: data.nameRaffle,
          description: data.description,
          price: parseFloat(data.price['$numberDecimal']), // Convertir a número
        });
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos de la rifa');
        setLoading(false);
      }
    };
  
    fetchRaffle(); // Llamada al servicio al montar el componente
  }, []); 
  const sliderImages = [
    "/img/moto1.jpg",
    "/img/moto2.jpg",
    "/img/moto3.jpg",
  ];
  return (
    <div>
    <Header/>
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-center mb-4">QUE CHIMBA DE MOTO</h1>


      </section>

      <section className="mb-12">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <div className="md:flex">
                      {/* Slider de fotos */}
          <div className="mb-8 max-w-sm mx-4">
          <Slider {...sliderSettings}>
            {sliderImages.map((img, index) => (
              <div key={index} className="outline-none px-1">
                <div className="aspect-w-3 aspect-h-4 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                  <img 
                    src={img} 
                    alt={`Moto ${index + 1}`} 
                    className="w-full h-full object-cover object-center "
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
            <div className="p-16">
            <p className="text-xl text-center text-gray-600 mb-6">¡Compra tus boletas de moto!</p>

              <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">{activeRaffle.name}</div>
              <p className="mt-2 text-gray-500">{activeRaffle.description}</p>
              <p className="mt-2 text-gray-500">Diligencia tus datos, realiza el pago en la pasarela y recibirás tus boletas directamente en tu correo.</p>
              <p className="mt-2 text-gray-500 inline">Precio:</p>
              <p className="mt-2 text-l text-blue-600 inline ml-2">  ${activeRaffle.price ? activeRaffle.price.toLocaleString() : 'Cargando...'}
              </p>
              <p className="mt-2 text-gray-500">Importante: revisa también tu bandeja de correo no deseado. </p>
              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <TicketButton quantity={2} price={activeRaffle.price}  />
                  <TicketButton quantity={4} price={activeRaffle.price}  />
                  <TicketButton quantity={6} price={activeRaffle.price}  />
                </div>
                <Link to="/purchase" className="block text-center bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300">
                  Comprar más boletas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer/>
    </div>
  );
};

export default Home;