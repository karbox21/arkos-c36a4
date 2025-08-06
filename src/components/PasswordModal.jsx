
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';
import { motion } from 'framer-motion';

const PasswordModal = ({ isOpen, onClose, onUnlock, expectedPassword, title, message }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (password === expectedPassword) {
      onUnlock();
      onClose();
    } else {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="arkos-modal-overlay"
      onClick={onClose} // Permitir fechar clicando fora, se necessário, ou remover esta linha
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="arkos-modal-content p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 text-destructive mb-5" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center text-destructive-foreground bg-destructive px-4 py-2 rounded-md">
            {title || "Acesso Restrito"}
          </h2>
          <p className="text-muted-foreground mb-6 text-center text-sm sm:text-base">
            {message || "Insira a senha para continuar."}
          </p>
          <Input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Senha de desbloqueio"
            className="arkos-input mb-4 w-full text-base sm:text-lg p-3"
          />
          {error && <p className="text-destructive text-sm mb-4 bg-destructive/10 p-2 rounded-md w-full text-center">{error}</p>}
          <div className="flex gap-3 w-full mt-2">
            {/* <Button onClick={onClose} variant="outline" className="w-full arkos-button-secondary">
              <ShieldOff className="mr-2 h-4 w-4" /> Cancelar
            </Button> */}
            <Button onClick={handleSubmit} className="w-full arkos-button-primary text-base sm:text-lg py-3">
              <ShieldCheck className="mr-2 h-5 w-5" /> Desbloquear
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PasswordModal;
