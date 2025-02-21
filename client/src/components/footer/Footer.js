import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import TermsModal from "./termsModal/TermsModal";

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <footer className="bg-teal-800 text-white">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div>
            <h4 className="text-lg font-semibold mb-2">Enlaces Rápidos</h4>
            <ul className="text-sm">
              <button onClick={() => setIsModalOpen(true)} className="terms-btn text-sm">
                Términos y Condiciones
              </button>
                <TermsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </ul>

            
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Contacto</h4>
            <ul className="text-sm">
              <li>Email: quechimbademoto@gmail.com</li>
              <li>Teléfono: (123) 456-7890</li>
              <li>Bogotá Colombia</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">
                <i className="fab fa-facebook-f">@quechimbademoto</i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-teal-700 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2024 QueChimbaDeMoto. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
      )
}

export default Footer