import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, Clock, Package, AlertTriangle, UserCheck, Scan, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast.jsx';

const RealtimeActivity = () => {
  const [newActivity, setNewActivity] = useState(null);
  const [highlightedActivity, setHighlightedActivity] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  // Efeito para destacar novas atividades
  useEffect(() => {
    // Remover:
    // if (lastActivities && lastActivities.length > 0) {
    //   const latestActivity = lastActivities[0];
    //   if (latestActivity && latestActivity.id) {
    //     setNewActivity(latestActivity.id);
    //     setHighlightedActivity(latestActivity.id);
        
    //     // Remover o destaque após 3 segundos
    //     const timer = setTimeout(() => {
    //       setHighlightedActivity(null);
    //     }, 3000);
        
    //     return () => clearTimeout(timer);
    //   }
    // }
  }, []); // Remover lastActivities da dependência

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'scan':
        return <Scan className="h-5 w-5 text-green-500" />;
      case 'duplicate':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'login':
        return <UserCheck className="h-5 w-5 text-blue-500" />;
      case 'logout':
        return <Users className="h-5 w-5 text-gray-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const handleClearActivities = useCallback(async () => {
    // Remover:
    // if (isClearing) {
    //   toast({
    //     title: "Operação em andamento",
    //     description: "Operação de limpeza já em andamento, aguarde...",
    //     variant: "warning"
    //   });
    //   return;
    // }
    
    // Remover:
    // if (!lastActivities || lastActivities.length === 0) {
    //   toast({ 
    //     title: "Nenhuma atividade", 
    //     description: "Não há atividades para limpar.",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    // Iniciar processo de limpeza
    setIsClearing(true);
    toast({
      title: "Iniciando limpeza",
      description: "Iniciando limpeza de registros em tempo real...",
      variant: "default"
    });
    
    // Função para tentar limpar com múltiplas tentativas
    const attemptClear = async (attempt = 1, maxAttempts = 3) => {
      try {
        // Pequeno atraso para feedback visual
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Remover:
        // Chamar a função de limpeza do Supabase
        // await clearActivities();
        toast({
          title: "Atividades limpas",
          description: `Atividades em tempo real limpas com sucesso${attempt > 1 ? ` na tentativa ${attempt}` : ''}!`,
          variant: "default"
        });
        return true;
      } catch (error) {
        console.error(`Erro ao limpar atividades (tentativa ${attempt}):`, error);
        
        // Se ainda temos tentativas restantes
        if (attempt < maxAttempts) {
          toast({
            title: `Tentativa ${attempt} falhou`,
            description: "Tentando novamente...",
            variant: "warning"
          });
          // Esperar um tempo progressivamente maior entre as tentativas
          await new Promise(resolve => setTimeout(resolve, 800 * attempt));
          return attemptClear(attempt + 1, maxAttempts);
        } else {
          // Todas as tentativas falharam
          toast({ 
            title: "Erro", 
            description: "Falha ao limpar atividades após múltiplas tentativas. Tente novamente mais tarde.",
            variant: "destructive"
          });
          return false;
        }
      }
    };
    
    // Iniciar o processo de limpeza com tentativas
    await attemptClear();
    
    // Finalizar o processo de limpeza
    setTimeout(() => {
      setIsClearing(false);
    }, 500);
  }, [isClearing, toast]); // Remover lastActivities da dependência

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 border-2 border-primary">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold text-center arkos-gradient-text">SISTEMA EM TEMPO REAL</h2>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleClearActivities} 
          disabled={isClearing}
          className="flex items-center gap-1 h-8 text-xs"
        >
          {isClearing ? (
            <>
              <span className="animate-spin mr-1">⏳</span>
              Limpando...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar Atividades
            </>
          )}
        </Button>
      </div>
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividades
            <Badge variant="secondary" className="ml-1">
              {/* Remover: */}
              {/* {lastActivities ? lastActivities.length : 0} */}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Usuários Online
            <Badge variant="secondary" className="ml-1">
              {/* Remover: */}
              {/* {Object.values(onlineUsers).filter(user => user.online).length} */}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities" className="space-y-4">
          <ScrollArea className="h-[300px] rounded-md border p-2">
            {/* Remover: */}
            {/* {lastActivities && lastActivities.length > 0 ? ( */}
              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  {/* Remover: */}
                  {/* {lastActivities.map((activity, index) => ( */}
                    <motion.div
                      key={newActivity || 'no-activity'} // Use newActivity como chave
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        backgroundColor: highlightedActivity === newActivity ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 0.1,
                        backgroundColor: { duration: 0.2 },
                        layout: { duration: 0.1 }
                      }}
                      style={{
                        willChange: 'transform, opacity',
                        transform: highlightedActivity === newActivity ? 'scale(1.005)' : 'scale(1)',
                        transformOrigin: 'top'
                      }}
                      className={`flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 rounded-md ${newActivity?.type === 'duplicate' ? 'bg-red-50 dark:bg-red-900/20' : ''} ${newActivity?.type === 'scan' ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                    >
                      <div className="mt-1">{getActivityIcon(newActivity?.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium">
                            {newActivity?.userName || newActivity?.userEmail}
                          </p>
                          <Badge variant={newActivity?.type === 'duplicate' ? 'destructive' : newActivity?.type === 'scan' ? 'success' : 'secondary'} className="text-xs">
                            {newActivity?.type === 'scan' ? 'Escaneado' : newActivity?.type === 'duplicate' ? 'Duplicado' : newActivity?.type}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">
                          {newActivity?.message}
                          {newActivity?.packageCode && (
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded ml-1 font-bold">
                              {newActivity.packageCode}
                            </span>
                          )}
                          {newActivity?.collectionName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                              em {newActivity.collectionName}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(newActivity?.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  {/* ))} */}
                </AnimatePresence>
              </div>
            {/* ) : ( */}
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Activity className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma atividade registrada</p>
              </div>
            {/* )} */}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="users">
          <ScrollArea className="h-[300px] rounded-md border p-2">
            <div className="space-y-3 p-1">
              <h3 className="font-semibold text-center mb-3">Usuários Ativos no Sistema</h3>
              {/* Remover: */}
              {/* {Object.values(onlineUsers) */}
                {/* .filter(user => user.online) */}
                {/* .map((user, index) => ( */}
                  <motion.div
                    key={newActivity || 'no-user'} // Use newActivity como chave
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }} // Simplificado para newActivity
                    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm"
                  >
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    {newActivity?.displayName || newActivity?.email}
                  </motion.div>
                {/* ))} */}
              {/* {Object.values(onlineUsers).filter(user => user.online).length === 0 && ( */}
                <div className="flex flex-col items-center justify-center w-full p-8">
                  <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum usuário online no momento</p>
                </div>
              {/* )} */}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeActivity;