
import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, colorClass, icon }) => (
  <motion.div 
    className={`p-4 rounded-lg shadow-lg flex flex-col items-center justify-center ${colorClass} bg-opacity-20 backdrop-blur-sm`}
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    {icon && <div className="mb-2">{icon}</div>}
    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</p>
    <p className={`text-2xl sm:text-3xl font-bold ${value === '' ? 'text-muted-foreground' : ''}`}>
      {value === '' ? '-' : value}
    </p>
  </motion.div>
);


const StatsDisplay = ({ totalScanned, halfScanned, duplicateCount, storeName }) => {
  return (
    <div className="my-6 sm:my-8 p-4 bg-card rounded-xl shadow-xl">
      <h3 className="text-lg font-semibold text-center mb-4 text-primary">
        Contadores Visuais: <span className="arkos-gradient-text">{storeName}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Pacotes Válidos" value={totalScanned} colorClass="text-green-400" />
        <StatCard label="Metade (Válidos)" value={halfScanned} colorClass="text-sky-400" />
        <StatCard label="Duplicados (Visual)" value={duplicateCount} colorClass="text-red-400" />
      </div>
    </div>
  );
};

export default StatsDisplay;
