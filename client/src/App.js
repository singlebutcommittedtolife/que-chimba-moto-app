import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';


const App = () => {



  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
};

export default App;