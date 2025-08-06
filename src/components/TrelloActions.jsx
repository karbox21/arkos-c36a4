
import React from 'react';
import { Button } from './ui/button';
import { FileText, Edit3 } from 'lucide-react';

const TrelloActions = ({ storesConfig, onTrelloButtonClick, isLoadingTrello, isPasswordModalOpen, onOpenObservationModal }) => {
  return (
    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50">
      <h3 className="text-md font-semibold text-muted-foreground mb-3 text-center">Ações da Coleta Atual e Trello</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {storesConfig.map(store => (
          <Button
            key={store.id}
            onClick={() => onTrelloButtonClick(store.trelloContext)}
            className="arkos-button-trello w-full"
            disabled={isLoadingTrello || isPasswordModalOpen}
          >
            <FileText className="mr-2 h-5 w-5" /> Trello {store.name}
          </Button>
        ))}
      </div>
      <Button 
          onClick={onOpenObservationModal} 
          variant="outline" 
          className="w-full mt-3 arkos-button-secondary"
        >
          <Edit3 className="mr-2 h-4 w-4" /> Adicionar/Ver Observações
        </Button>
    </div>
  );
};

export default TrelloActions;
