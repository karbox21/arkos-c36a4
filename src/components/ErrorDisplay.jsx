import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const ErrorDisplay = ({ message = "Ocorreu um erro." }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="my-4 p-3 text-center text-destructive-foreground bg-destructive/90 rounded-md flex items-center justify-center gap-2 shadow-lg"
    >
      <AlertTriangle size={24} />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

export default ErrorDisplay;