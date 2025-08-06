import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Importação do CSS principal
import { FirebaseProvider } from './contexts/SupabaseContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </React.StrictMode>
);