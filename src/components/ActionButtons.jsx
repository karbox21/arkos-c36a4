
import React from 'react';
import { Button } from './ui/button';
import { Download, Printer, Settings } from 'lucide-react';

const ActionButtons = ({ onExport, onPrint, onResetAllData, showResetAllButton = true }) => {
  return (
    <div className="mt-8 pt-6 border-t border-border/50">
      <h3 className="text-md font-semibold text-muted-foreground mb-4 text-center">Relatórios Globais</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button onClick={() => onExport('excel')} className="arkos-button-secondary w-full text-xs sm:text-sm">
          <Download className="mr-1 sm:mr-2 h-4 w-4" /> Exportar Excel (CSV)
        </Button>
        <Button onClick={onPrint} className="arkos-button-secondary w-full text-xs sm:text-sm">
          <Printer className="mr-1 sm:mr-2 h-4 w-4" /> Imprimir Relatório Diário
        </Button>
        {showResetAllButton && (
             <Button onClick={onResetAllData} variant="destructive" className="arkos-button-destructive w-full text-xs sm:text-sm sm:col-span-2">
                <Settings className="mr-1 sm:mr-2 h-4 w-4" /> Resetar Todos os Dados
             </Button>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
