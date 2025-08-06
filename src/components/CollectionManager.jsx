
import React from 'react';
import { Button } from './ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';

const CollectionManager = ({
  collections, // This might be deprecated or used differently with new structure
  currentCollectionName, // This is now more dynamic (store_period_operator_date)
  onSelectCollection, // May need rethink if direct selection is kept
  onNewCollection, // May need rethink
  onDeleteCollection, // May need rethink
  stores, // e.g., ['Shopfaz', 'Karbox']
  periods, // e.g., ['Manha', 'Tarde']
  currentStore,
  currentPeriod,
  onSetCurrentStore,
  onSetCurrentPeriod,
  onStartNewCollectionPeriod, // New handler
}) => {
  
  // This component might need significant rework or simplification
  // given the new "Start New Collection (Morning/Afternoon)" buttons per store.
  // For now, let's keep it minimal or focus on displaying current context.

  return (
    <div className="mb-6 p-4 bg-secondary/30 rounded-lg shadow">
      <h3 className="text-md font-semibold text-center mb-3 text-primary">Contexto da Coleta Atual</h3>
      <div className="grid grid-cols-2 gap-4 items-center">
        <div>
          <label htmlFor="storeSelect" className="text-xs text-muted-foreground block mb-1">Loja:</label>
          <select
            id="storeSelect"
            value={currentStore}
            onChange={(e) => onSetCurrentStore(e.target.value)}
            className="arkos-input w-full p-2 rounded-md text-sm"
          >
            {stores.map(store => (
              <option key={store.id} value={store.name}>{store.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="periodSelect" className="text-xs text-muted-foreground block mb-1">Período:</label>
          <select
            id="periodSelect"
            value={currentPeriod}
            onChange={(e) => onSetCurrentPeriod(e.target.value)}
            className="arkos-input w-full p-2 rounded-md text-sm"
          >
            {periods.map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
      </div>
       <p className="text-xs text-muted-foreground mt-3 text-center">
        Coleta ativa: <span className="font-semibold text-foreground">{currentCollectionName}</span>
      </p>
      {/* Old buttons might be removed or re-purposed if new workflow covers them */}
      {/* 
      <div className="flex gap-2 mt-4 flex-wrap justify-center">
        <Button onClick={onNewCollection} className="arkos-button-secondary text-xs px-3 py-1.5 h-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Coleta Genérica (Old)
        </Button>
        {Object.keys(collections).length > 0 && currentCollectionName !== 'Coleta Padrão' && (
           <Button
              onClick={() => onDeleteCollection(currentCollectionName)}
              variant="destructive"
              size="sm"
              className="text-xs px-3 py-1.5 h-auto arkos-button-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Apagar Genérica (Old)
            </Button>
        )}
      </div> 
      */}
    </div>
  );
};

export default CollectionManager;
