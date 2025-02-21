import React from "react";
import "./styles.css";

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2><center><strong>TÉRMINOS Y CONDICIONES – RIFA KTM DUKE 250</strong></center></h2>
        <p><strong>Compra mínima:</strong> Para participar en la rifa, es obligatorio adquirir un mínimo de dos (2) boletas.</p>
        <p><strong>Valor de la boleta:</strong> Cada boleta tiene un costo de cuatro mil pesos ($4.000) colombianos.</p>
        <p><strong>Fecha y mecanismo del sorteo:</strong></p>
        <ul>
          <li>La rifa se realizará una vez se haya vendido la totalidad de las boletas.</li>
          <li>La fecha, hora y lotería con la que se realizará el sorteo serán anunciadas previamente a través de nuestra página de Instagram y otros medios oficiales.</li>
        </ul>
        <p><strong>Condición de la moto:</strong></p>
        <ul>
          <li>La KTM DUKE 250 será entregada en excelente estado, con todos los mantenimientos al día realizados en KTM Torque.</li>
          <li>El kilometraje al momento de la entrega será inferior a 16.800 km.</li>
        </ul>
        <p><strong>Medios de información:</strong> Toda la información relevante sobre la rifa será publicada exclusivamente en nuestra página de Instagram y otros canales de comunicación designados.</p>
        <button onClick={onClose} className="close-btn">x</button>
      </div>
    </div>
  );
};

export default TermsModal;
