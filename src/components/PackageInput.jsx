
import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScanLine, Trash2 } from 'lucide-react';

const PackageInput = ({
  inputValue,
  onInputChange,
  onKeyPress,
  onScanPackage,
  inputRef,
  isPasswordModalOpen,
  onClearCurrentCollection,
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          placeholder="Ler código do pacote aqui..."
          className="sm:w-3/5 arkos-input text-lg p-3 shadow-inner focus:shadow-lg"
          disabled={isPasswordModalOpen}
          autoFocus={false} // Removido o autofocus para evitar que o cursor seja puxado
        />
        <Button
          onClick={onScanPackage}
          className="arkos-button-primary text-lg p-3 min-w-[120px]"
          disabled={isPasswordModalOpen}
        >
          <ScanLine className="mr-2 h-5 w-5" /> Adicionar
        </Button>
      </div>
      <div className="flex justify-end">
         <Button
          onClick={onClearCurrentCollection}
          variant="outline"
          className="arkos-button-secondary text-xs"
          disabled={isPasswordModalOpen}
        >
          <Trash2 className="mr-1 sm:mr-2 h-4 w-4" /> Limpar Contagem Atual
        </Button>
      </div>
    </div>
  );
};

export default PackageInput;
