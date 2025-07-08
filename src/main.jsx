import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider> 
        <SocketProvider>
          <App />
        </SocketProvider>
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

