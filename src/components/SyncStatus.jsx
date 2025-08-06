import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

const SyncStatus = () => {
  const { onlineUsers } = useSupabase();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  
  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Atualizar o horário de sincronização a cada minuto
    const interval = setInterval(() => {
      if (isOnline) {
        setLastSyncTime(new Date());
      }
    }, 60000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);
  
  // Formatar o horário da última sincronização
  const formatLastSync = () => {
    return lastSyncTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Contar usuários online
  const onlineUsersCount = onlineUsers ? Object.keys(onlineUsers).length : 0;
  
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-muted/30 rounded-md">
      <div className="flex items-center gap-1">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3 text-green-500" />
            <span>Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-red-500" />
            <span>Desconectado</span>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <RefreshCw className="h-3 w-3" />
        <span>Última sincronização: {formatLastSync()}</span>
      </div>
      
      <div>
        <span>{onlineUsersCount} {onlineUsersCount === 1 ? 'usuário online' : 'usuários online'}</span>
      </div>
    </div>
  );
};

export default SyncStatus;