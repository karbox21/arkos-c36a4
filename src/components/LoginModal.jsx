import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, Lock, LogIn, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginModal = ({ isOpen, onClose, onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const usernameRef = useRef(null);
  
  // Credenciais de administrador (ocultas - acesso via Ctrl+Shift+A)
  const ADMIN_USERNAME = 'gerente2025';
  const ADMIN_PASSWORD = 'quito123';
  
  // Flag para controlar a exibição do botão de acesso ao painel de administrador
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Credenciais de usuário padrão - único login permitido para operadores
  const DEFAULT_USERNAME = 'karbox2025';
  const DEFAULT_PASSWORD = 'karstoq';
  
  // Verificar se o usuário é administrador para controlar acesso ao painel
  useEffect(() => {
    // Atualizar o estado showAdminPanel com base no status de administrador
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setShowAdminPanel(true);
    } else {
      setShowAdminPanel(false);
    }
  }, [username, password]);
  
  // Função para verificar e salvar o status de login
  useEffect(() => {
    if (isAdmin) {
      // Salvar status de login do administrador
      // saveData('adminStatus', { loggedIn: true, timestamp: new Date().toISOString() });
      
      // Escutar mudanças nos dados do sistema
      // const unsubscribe = listenToData('systemData', (data) => {
      //   console.log('Dados do sistema atualizados:', data);
      //   // Implementar lógica adicional para administrador aqui
      // });
      
      // return () => unsubscribe();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError('');
      setTimeout(() => usernameRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Verificar se é login de administrador (secreto)
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Login de administrador bem-sucedido
      const adminUser = {
        id: 'admin-special',
        username: ADMIN_USERNAME,
        email: 'admin@sistema.com',
        name: 'Administrador do Sistema',
        isAdmin: true
      };
      onLogin(adminUser);
      return;
    }
    
    // Verificar se é o login padrão (único login permitido)
    if (username.trim() === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      const defaultUser = {
        id: 'user-default',
        username: DEFAULT_USERNAME,
        email: 'user@sistema.com',
        name: 'Usuário do Sistema',
        isAdmin: false
      };
      onLogin(defaultUser);
      return;
    }
    

    
    // Se chegou aqui, as credenciais estão incorretas
    setError('Nome de usuário ou senha incorretos. Tente novamente.');
    setPassword('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!username) {
        usernameRef.current?.focus();
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="arkos-modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="arkos-modal-content p-6 sm:p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 flex items-center justify-center mb-5">
            <img src="/images/arkos_logo.svg" alt="ARKOS Logo" className="w-full h-full" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">
            Login do Sistema
          </h2>
          {/* Removido botão de acesso administrativo para simplificar a interface */}
          <p className="text-muted-foreground mb-6 text-center text-sm sm:text-base">
            Entre com suas credenciais para acessar o sistema.
          </p>
          
          <div className="w-full space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nome de usuário"
                className="arkos-input pl-12 w-full text-base sm:text-lg p-3"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Senha"
                className="arkos-input pl-12 w-full text-base sm:text-lg p-3"
              />
            </div>
          </div>
          
          {error && (
            <p className="text-destructive text-sm mt-4 mb-2 bg-destructive/10 p-2 rounded-md w-full text-center">
              {error}
            </p>
          )}
          
          <Button 
            onClick={handleSubmit} 
            className="w-full arkos-button-primary text-base sm:text-lg py-3 mt-6"
          >
            <LogIn className="mr-2 h-5 w-5" /> Entrar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;