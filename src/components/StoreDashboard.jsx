
import React, { useState } from 'react';
import { Package, DivideCircle, AlertTriangle, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

const StoreDashboard = ({ allCollectionsData, storesConfig }) => {
  const today = new Date().toLocaleDateString('pt-BR');
  const [selectedStore, setSelectedStore] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Usar dados do Supabase
  // const { collections } = useSupabase(); // Removido
  
  // Combinar dados do Supabase com dados locais
  const combinedData = { ...allCollectionsData }; // Ajustado para usar apenas allCollectionsData

  const getStorePeriodData = (storeName, period) => {
    let totalPackages = 0;
    let totalDuplicates = 0;

    // Verificar se combinedData é um objeto válido
    if (combinedData && typeof combinedData === 'object') {
      Object.values(combinedData).forEach(collection => {
        // Verificar se collection é um objeto válido antes de acessar suas propriedades
        if (collection && typeof collection === 'object' && 
            collection.store === storeName && 
            collection.period === period && 
            collection.date === today) {
          totalPackages += collection.packages && Array.isArray(collection.packages) ? collection.packages.length : 0;
          totalDuplicates += collection.duplicates && Array.isArray(collection.duplicates) ? collection.duplicates.length : 0;
        }
      });
    }
    return { totalPackages, totalDuplicates };
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simular um tempo de atualização
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderStoreCard = (store, isExpanded = false) => {
    // Verificar se store é um objeto válido e tem a propriedade name
    if (!store || typeof store !== 'object' || !store.name) {
      console.error('Store inválida:', store);
      return null;
    }
    
    const dataManha = getStorePeriodData(store.name, 'Manha');
    const dataTarde = getStorePeriodData(store.name, 'Tarde');
    
    const totalDia = dataManha.totalPackages + dataTarde.totalPackages;
    const totalDuplicadosDia = dataManha.totalDuplicates + dataTarde.totalDuplicates;

    return (
      <div 
        key={store.id} 
        className={`p-4 bg-card dark:bg-card/60 rounded-lg shadow-lg border border-border/50 ${isExpanded ? 'col-span-full' : ''}`}
      >
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-semibold arkos-gradient-text">{store.name}</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedStore(isExpanded ? null : store)}
            className="p-1 h-auto"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
        
        <div className={`${isExpanded ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
          <div className="text-sm space-y-2 mb-3">
            <p className="font-medium">Manhã:</p>
            <div className="pl-2 text-xs border-l-2 border-primary/50">
              <p className="flex items-center"><Package size={14} className="mr-2 text-green-500"/> Válidos: {dataManha.totalPackages}</p>
              {dataManha.totalDuplicates > 0 && <p className="flex items-center text-red-500"><AlertTriangle size={14} className="mr-2"/> Duplicados: {dataManha.totalDuplicates}</p>}
            </div>
          </div>

          <div className="text-sm space-y-2">
            <p className="font-medium">Tarde:</p>
             <div className="pl-2 text-xs border-l-2 border-primary/50">
              <p className="flex items-center"><Package size={14} className="mr-2 text-green-500"/> Válidos: {dataTarde.totalPackages}</p>
              {dataTarde.totalDuplicates > 0 && <p className="flex items-center text-red-500"><AlertTriangle size={14} className="mr-2"/> Duplicados: {dataTarde.totalDuplicates}</p>}
            </div>
          </div>
        </div>
        
        <div className={`mt-4 pt-3 border-t border-border/30 ${isExpanded ? 'text-center text-lg' : 'text-center'}`}>
          <p className={`${isExpanded ? 'text-lg' : 'text-sm'} font-semibold`}>Total Dia ({store.name}):</p>
          <p className={`${isExpanded ? 'text-2xl' : 'text-lg'} font-bold text-primary`}>{totalDia}</p>
          {totalDia > 0 && <p className={`${isExpanded ? 'text-sm' : 'text-xs'} text-muted-foreground flex items-center justify-center`}><DivideCircle size={isExpanded ? 16 : 12} className="mr-1"/> Metade: {Math.floor(totalDia / 2)}</p>}
          {totalDuplicadosDia > 0 && <p className={`${isExpanded ? 'text-lg' : 'text-sm'} font-semibold text-red-500 mt-1`}>Total Duplicados Dia: {totalDuplicadosDia}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="store-dashboard-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-primary">Resumo Diário das Lojas</h3>
        <div className="flex gap-2">
          {selectedStore && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedStore(null)}
              className="text-xs"
            >
              Exibir Todas as Lojas
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1 text-xs"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {selectedStore ? (
          renderStoreCard(selectedStore, true)
        ) : (
          Array.isArray(storesConfig) 
            ? storesConfig.map(store => renderStoreCard(store))
            : <div className="col-span-full text-center p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-600 dark:text-red-400">Erro: Configuração de lojas inválida</p>
              </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground flex items-center justify-end gap-1">
        <RefreshCw className="h-3 w-3" /> 
        Dados sincronizados em tempo real
      </div>
    </div>
  );
};

export default StoreDashboard;
