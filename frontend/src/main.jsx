import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { TeamProvider } from './context/TeamContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TeamProvider>
        <AdminProvider>
          <App />
        </AdminProvider>
      </TeamProvider>
    </BrowserRouter>
  </React.StrictMode>
);
