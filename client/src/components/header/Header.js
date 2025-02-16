import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-teal-800 text-white shadow-lg">
    <div className="container mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/img/logomoto.png" alt="Rifas de Motos Logo" className="h-[70px] mr-3"  />
          </div>
          
          {/* Navigation for larger screens */}
          
          <nav className="hidden md:flex space-x-8 justify-center flex-grow">
          <Link to="/" className="hover:bg-blue-600 font-semibold py-2 px-4 rounded transition duration-300">Inicio</Link>
          </nav>
          
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
              </svg>
            </button>
          </div>
        </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <Link to="/" className="bg-yellow-500 text-black px-4 py-2 transition duration-300 ">Inicio</Link>
          <Link to="/como-funciona" className="block py-2 hover:text-blue-200 transition duration-300">Cómo Funciona</Link>
          <Link to="/ganadores" className="block py-2 hover:text-blue-200 transition duration-300">Ganadores</Link>
        </div>
      )}
    </div>
  </header>
  );
};

export default Header;