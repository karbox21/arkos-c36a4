
import React, { useState } from 'react';
import { PackageCheck, PackageX, ScanLine, Info, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PackageList = ({
  scannedPackages,
  duplicatePackages,
  currentCollectionName,
}) => {
  if (scannedPackages.length === 0 && duplicatePackages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-center py-10 px-6 bg-secondary/20 rounded-lg mt-8 shadow-inner"
      >
        <ScanLine size={48} className="mx-auto text-muted-foreground/70 mb-4" />
        <p className="text-muted-foreground text-lg">Nenhum pacote lido nesta visualização.</p>
        <p className="text-muted-foreground/80 text-sm">Use o campo acima para adicionar pacotes à coleta <span className="font-semibold text-foreground">{currentCollectionName}</span>.</p>
      </motion.div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-primary text-center sm:text-left">
        Registros Visuais: <span className="arkos-gradient-text">{currentCollectionName}</span>
      </h2>
      <div className="space-y-3 max-h-[300px] sm:max-h-[350px] overflow-y-auto p-4 rounded-lg bg-secondary/20 shadow-inner custom-scrollbar">
        <AnimatePresence mode="wait">
          {scannedPackages.map((pkg) => {
            const isObject = typeof pkg === 'object';
            const code = isObject ? pkg.code : pkg;
            const timestamp = isObject ? pkg.timestamp : null;
            
            return (
              <motion.li
                key={`valid-${code}-${currentCollectionName}`}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, transition: { duration: 0.1 } }}
                transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                className="arkos-list-item"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center truncate">
                    <PackageCheck size={20} className="mr-3 text-green-400 flex-shrink-0" />
                    <span className="text-foreground font-medium text-sm sm:text-base truncate" title={code}>{code}</span>
                  </div>
                  {timestamp && (
                    <div className="flex items-center text-muted-foreground ml-2">
                      <Clock size={14} className="mr-1" />
                      <span className="text-xs">{timestamp}</span>
                    </div>
                  )}
                </div>
              </motion.li>
            );
          })}
          {duplicatePackages.map((pkg) => {
            const isObject = typeof pkg === 'object';
            const code = isObject ? pkg.code : pkg;
            const timestamp = isObject ? pkg.timestamp : null;
            
            return (
              <motion.li
                key={`duplicate-${code}-${currentCollectionName}`}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, transition: { duration: 0.1 } }}
                transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                className="arkos-list-item-duplicate"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center truncate">
                    <PackageX size={20} className="mr-3 text-red-400 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base truncate" title={code}>{code}</span>
                  </div>
                  {timestamp && (
                    <div className="flex items-center text-red-300 ml-2">
                      <Clock size={14} className="mr-1" />
                      <span className="text-xs">{timestamp}</span>
                    </div>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
         {scannedPackages.length === 0 && duplicatePackages.length > 0 && (
            <div className="text-center py-4">
                <Info size={24} className="mx-auto text-amber-500 mb-2" />
                <p className="text-amber-500 text-sm">Apenas pacotes duplicados nesta visualização.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PackageList;
