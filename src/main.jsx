import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>
);
