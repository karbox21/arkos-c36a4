import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MessageSquare, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ObservationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialObservation = '',
  title = "Adicionar Observação",
  message = "Registre informações adicionais."
}) => {
  const [observation, setObservation] = useState(initialObservation);

  useEffect(() => {
    if (isOpen) {
      setObservation(initialObservation); // Reset/set observation when modal opens
    }
  }, [isOpen, initialObservation]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(observation); // Pass current observation text to submit handler
    onClose(); // Close modal after submit
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="arkos-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="arkos-modal-content w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          {title.toLowerCase().includes("duplicado") ? 
            <AlertCircle className="w-12 h-12 text-destructive mb-4" /> :
            <MessageSquare className="w-12 h-12 text-primary mb-4" />
          }
          <h2 className={`text-xl font-bold mb-3 text-center ${title.toLowerCase().includes("duplicado") ? "text-destructive" : ""}`}>
            {title}
          </h2>
          <p className="text-muted-foreground mb-5 text-center text-sm">
            {message}
          </p>
          <Textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Digite suas observações aqui..."
            className="arkos-input w-full min-h-[120px] text-sm"
            rows={5}
            autoFocus
          />
          <div className="flex gap-3 w-full mt-6">
            <Button onClick={onClose} variant="outline" className="w-full arkos-button-secondary">
              <XCircle className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={handleSubmit} className="w-full arkos-button-primary">
              <CheckCircle className="mr-2 h-4 w-4" /> Salvar Observação
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ObservationModal;