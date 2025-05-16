import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ import BrowserRouter
import App from './App';
import "./index.css"
import { SocketProvider } from "./context/SocketContext";
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <SocketProvider>
    <App />
  </SocketProvider>
</BrowserRouter>

);
