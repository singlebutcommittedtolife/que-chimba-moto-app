import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import Purchase from './pages/purchase/Purchase';
import Confirmation from './pages/confirmation/Confirmation';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/confirmation" element={<Confirmation />} />
    </Routes>
  );
};

export default AppRoutes;