import React from 'react';
import { PackageCheck, PackageX, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LastScannedPackage = ({ lastPackage }) => {
  if (!lastPackage) {
    return null;
  }

  const { code, timestamp, isDuplicate } = lastPackage;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`last-scanned-${code}-${isDuplicate}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
        className={`p-4 rounded-lg shadow-lg border ${isDuplicate ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-green-400 bg-green-50 dark:bg-green-900/20'} mb-4`}
      >
        <h3 className="text-lg font-semibold mb-2 text-center">Último Pacote Bipado</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center truncate">
            {isDuplicate ? (
              <PackageX size={24} className="mr-3 text-red-500 flex-shrink-0" />
            ) : (
              <PackageCheck size={24} className="mr-3 text-green-500 flex-shrink-0" />
            )}
            <div className="truncate">
              <p 
                className={`font-bold text-base sm:text-lg truncate ${isDuplicate ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                title={code}
              >
                {code}
              </p>
              <div className="flex items-center text-muted-foreground">
                <Clock size={14} className="mr-1" />
                <span className="text-xs">{timestamp}</span>
              </div>
            </div>
          </div>
          <div 
            className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${isDuplicate ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'}`}
          >
            {isDuplicate ? 'Duplicado' : 'Válido'}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LastScannedPackage;