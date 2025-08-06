import React from 'react';
import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Carregando..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="my-4 p-3 text-center text-primary flex items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ display: 'inline-block' }}
      >
        <UploadCloud size={28} />
      </motion.div>
      <p className="ml-3 text-lg font-semibold">{message}</p>
    </motion.div>
  );
};

export default LoadingSpinner;