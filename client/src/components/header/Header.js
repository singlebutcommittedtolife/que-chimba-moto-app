import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-teal-800 text-white shadow-lg">
  <div className="container mx-auto px-4 py-3 relative"> {/* 🔹 relative aquí */}
    <div className="flex items-center justify-between">
      <div className="flex items-center z-10">
        <img src="/img/logomoto.png" alt="Rifas de Motos Logo" className="h-[70px] mr-3" />
      </div>

      {/* 🔹 NAV centrado absolutamente */}
      <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-8">
        <Link to="/" className="hover:bg-blue-600 font-semibold py-2 px-4 rounded transition duration-300">Inicio</Link>
      </nav>

      <div className="md:hidden z-10">
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
        <Link to="/" className="bg-yellow-500 text-black px-4 py-2 transition duration-300">Inicio</Link>
      </div>
    )}
  </div>
</header>
  );
};

export default Header;