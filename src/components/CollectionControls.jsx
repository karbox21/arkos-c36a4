
import React from 'react';
import { Button } from './ui/button';

const CollectionControls = ({ storesConfig, onStartNewCollectionPeriod }) => {
  return (
    <div className="my-6 p-4 bg-secondary/30 rounded-lg">
      <h2 className="text-lg font-semibold text-center mb-3 arkos-gradient-text">Iniciar Nova Coleta (Manhã/Tarde)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {storesConfig.map(store => (
          <div key={store.id} className="space-y-2">
            <h3 className="text-sm font-medium text-center text-muted-foreground">{store.name}</h3>
            <Button onClick={() => onStartNewCollectionPeriod(store.name, 'Manha')} className="w-full arkos-button-secondary text-xs">Manhã</Button>
            <Button onClick={() => onStartNewCollectionPeriod(store.name, 'Tarde')} className="w-full arkos-button-secondary text-xs">Tarde</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionControls;
