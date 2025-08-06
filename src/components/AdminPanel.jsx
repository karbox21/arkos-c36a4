import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Shield, Trash2, Users, Database, Calendar as CalendarIcon, BarChart, UserX, RefreshCw, AlertTriangle, 
  Settings, Download, Upload, FileText, Bell, Clock, HardDrive, Zap, Activity, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupabase } from '../contexts/SupabaseContext';
import { supabase } from '../lib/supabase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import Calendar from './Calendar';
import SoundTest from './SoundTest';
import RealtimeMonitor from './RealtimeMonitor';

const AdminPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState({});
  const [activities, setActivities] = useState([]);
  const [packageStats, setPackageStats] = useState({});
  const [duplicatePackages, setDuplicatePackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [systemStatus, setSystemStatus] = useState({
    dbSize: 0,
    lastBackup: null,
    uptime: 0,
    performance: 85,
    errors: [],
    warnings: [],
  });
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState({});
  const { currentUser } = useSupabase();

  // Carregar dados quando o painel for aberto
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Filtrar usuários e coleções com base no termo de pesquisa
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      
      // Filtrar usuários
      const matchedUsers = users.filter(user => 
        user.email.toLowerCase().includes(term) || 
        user.displayName?.toLowerCase().includes(term) ||
        user.uid.toLowerCase().includes(term)
      );
      setFilteredUsers(matchedUsers);
      
      // Filtrar coleções
      const matchedCollections = {};
      Object.entries(collections).forEach(([key, items]) => {
        const filteredItems = items.filter(item => 
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.id?.toLowerCase().includes(term)
        );
        if (filteredItems.length > 0) {
          matchedCollections[key] = filteredItems;
        }
      });
      setFilteredCollections(matchedCollections);
    } else {
      setFilteredUsers(users);
      setFilteredCollections(collections);
    }
  }, [searchTerm, users, collections]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    // Declarar collectionsData no escopo externo para que esteja disponível em todos os blocos try/catch
    let collectionsData = {};
    
    try {
      // Carregar usuários com tratamento de erro melhorado
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');
          
        if (!usersError && usersData) {
          const usersArray = usersData.map(data => ({
            uid: data.id,
            ...data,
            lastLogin: data.lastLogin ? new Date(data.lastLogin) : null,
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
          }));
          setUsers(usersArray);
          setFilteredUsers(usersArray);
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (userError) {
        console.error('Erro ao carregar usuários:', userError);
        setError(prev => prev + '\nErro ao carregar usuários: ' + userError.message);
        setUsers([]);
        setFilteredUsers([]);
      }

      // Carregar coleções com tratamento de erro melhorado
      try {
        const collectionsToLoad = ['packages', 'categories', 'tags', 'comments'];
        
        // Usar Promise.all para carregar coleções em paralelo
        await Promise.all(collectionsToLoad.map(async (collection) => {
          try {
            const { data, error } = await supabase
            .from(collection)
            .select('*');
            
            if (!error && data) {
              collectionsData[collection] = data.map(item => ({
                ...item,
                createdAt: item.createdAt ? new Date(item.createdAt) : null,
                updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
              }));
            } else {
              collectionsData[collection] = [];
            }
          } catch (collectionError) {
            console.error(`Erro ao carregar coleção ${collection}:`, collectionError);
            collectionsData[collection] = [];
          }
        }));
        
        setCollections(collectionsData);
        setFilteredCollections(collectionsData);
      } catch (collectionsError) {
        console.error('Erro ao processar coleções:', collectionsError);
        setError(prev => prev + '\nErro ao carregar coleções: ' + collectionsError.message);
        setCollections({});
        setFilteredCollections({});
      }

      // Carregar atividades recentes com tratamento de erro melhorado
      try {
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('activities')
          .select('*');
          
        if (!activitiesError && activitiesData) {
          // Formatar os dados das atividades
          const activitiesArray = activitiesData
            .map(data => ({
              id: data.id,
              ...data,
              timestamp: data.timestamp ? new Date(data.timestamp) : null,
            }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) // Tratamento para evitar erros com timestamps nulos
            .slice(0, 50); // Limitar a 50 atividades mais recentes
          setActivities(activitiesArray);
        } else {
          setActivities([]);
        }
      } catch (activitiesError) {
        console.error('Erro ao carregar atividades:', activitiesError);
        setError(prev => prev + '\nErro ao carregar atividades: ' + activitiesError.message);
        setActivities([]);
      }

      // Calcular estatísticas de pacotes com tratamento de erro melhorado
      try {
        if (collectionsData?.packages && collectionsData.packages.length > 0) {
          const packages = collectionsData.packages;
          
          // Estatísticas básicas com verificações de segurança
          const stats = {
            total: packages.length,
            published: packages.filter(pkg => pkg?.status === 'published').length,
            draft: packages.filter(pkg => pkg?.status === 'draft').length,
            archived: packages.filter(pkg => pkg?.status === 'archived').length,
            avgDownloads: packages.length > 0 ? 
              Math.round(packages.reduce((sum, pkg) => sum + (pkg?.downloads || 0), 0) / packages.length) : 0,
            avgRating: packages.length > 0 ? 
              (packages.reduce((sum, pkg) => sum + (pkg?.rating || 0), 0) / packages.length).toFixed(1) : '0.0',
            categories: {},
            topDownloaded: [...packages]
              .filter(pkg => pkg) // Filtrar itens nulos
              .sort((a, b) => (b?.downloads || 0) - (a?.downloads || 0))
              .slice(0, 5),
            topRated: [...packages]
              .filter(pkg => pkg && pkg.rating) // Filtrar itens nulos ou sem rating
              .sort((a, b) => (b?.rating || 0) - (a?.rating || 0))
              .slice(0, 5),
            recentlyAdded: [...packages]
              .filter(pkg => pkg && pkg.createdAt) // Filtrar itens nulos ou sem data
              .sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0))
              .slice(0, 5),
          };
          
          // Contagem por categoria com verificação de segurança
          packages.forEach(pkg => {
            if (pkg?.category) {
              stats.categories[pkg.category] = (stats.categories[pkg.category] || 0) + 1;
            }
          });
          
          // Verificar pacotes duplicados com tratamento de erro
          try {
            const titles = {};
            const duplicates = [];
            packages.forEach(pkg => {
              if (pkg?.title) {
                const normalizedTitle = pkg.title.toLowerCase().trim();
                if (titles[normalizedTitle]) {
                  duplicates.push({
                    original: titles[normalizedTitle],
                    duplicate: pkg,
                  });
                } else {
                  titles[normalizedTitle] = pkg;
                }
              }
            });
            
            setDuplicatePackages(duplicates);
          } catch (duplicateError) {
            console.error('Erro ao processar duplicados:', duplicateError);
            setDuplicatePackages([]);
          }
          
          setPackageStats(stats);
        } else {
          setPackageStats({
            total: 0,
            published: 0,
            draft: 0,
            archived: 0,
            avgDownloads: 0,
            avgRating: '0.0',
            categories: {},
            topDownloaded: [],
            topRated: [],
            recentlyAdded: [],
          });
          setDuplicatePackages([]);
        }
      } catch (statsError) {
        console.error('Erro ao calcular estatísticas:', statsError);
        setError(prev => prev + '\nErro ao calcular estatísticas: ' + statsError.message);
        setPackageStats({
          total: 0,
          published: 0,
          draft: 0,
          archived: 0,
          avgDownloads: 0,
          avgRating: '0.0',
          categories: {},
          topDownloaded: [],
          topRated: [],
          recentlyAdded: [],
        });
        setDuplicatePackages([]);
      }

      // Carregar status do sistema com tratamento de erro melhorado
      try {
        // Substituir o uso de Firebase pelo Supabase
        const { data: statusData, error } = await supabase
          .from('system')
          .select('*')
          .eq('id', 'status')
          .single();
          
        if (error) {
          throw error;
        }
        
        if (statusData) {
          setSystemStatus({
            ...systemStatus,
            ...statusData,
            lastBackup: statusData.lastBackup ? new Date(statusData.lastBackup) : null,
          });
        } else {
          console.log('Documento de status do sistema não existe');
        }
      } catch (error) {
        console.error('Erro ao carregar status do sistema:', error);
        setError(`Erro ao carregar status do sistema: ${error.message}`);
      }

      setMessage('Dados carregados com sucesso!');
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeUser = async (uid) => {
    if (!confirm(`Tem certeza que deseja remover o usuário ${uid}?`)) return;
    
    setIsLoading(true);
    try {
      await removeData(`users/${uid}`);
      setUsers(users.filter(user => user.uid !== uid));
      setMessage(`Usuário ${uid} removido com sucesso!`);
      
      // Registrar atividade
      await supabase.from('activities').insert({
        type: 'user_removed',
        userId: currentUser.uid,
        targetId: uid,
        timestamp: Date.now(),
      });
    } catch (err) {
      setError(`Erro ao remover usuário: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCollection = async (collection, id) => {
    if (!confirm(`Tem certeza que deseja remover ${id} da coleção ${collection}?`)) return;
    
    setIsLoading(true);
    try {
      await removeData(`${collection}/${id}`);
      
      setCollections({
        ...collections,
        [collection]: collections[collection].filter(item => item.id !== id)
      });
      
      setMessage(`Item ${id} removido da coleção ${collection} com sucesso!`);
      
      // Registrar atividade
      await supabase.from('activities').insert({
        type: 'item_removed',
        userId: currentUser.uid,
        collection,
        itemId: id,
        timestamp: Date.now(),
      });
    } catch (err) {
      setError(`Erro ao remover item: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    setBackupInProgress(true);
    try {
      // Obter todos os dados do banco
      const tables = ['collections', 'operators', 'users', 'onlineUsers', 'activities', 'system'];
      const data = {};
      
      // Buscar dados de cada tabela
      for (const table of tables) {
        const { data: tableData, error } = await supabase
          .from(table)
          .select('*');
          
        if (error) {
          console.error(`Erro ao buscar dados da tabela ${table}:`, error);
        } else {
          data[table] = tableData;
        }
      }
      
      if (Object.keys(data).length === 0) {
        throw new Error('Não há dados para backup');
      }
      
      const backupData = JSON.stringify(data, null, 2);
      
      // Criar arquivo de download
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Atualizar status do sistema
      const { error } = await supabase
        .from('system')
        .upsert({
          id: 'status',
          ...systemStatus,
          lastBackup: Date.now(),
        });
      
      setSystemStatus({
        ...systemStatus,
        lastBackup: new Date(),
      });
      
      // Registrar atividade
      await supabase.from('activities').insert({
        type: 'backup_created',
        userId: currentUser.uid,
        timestamp: Date.now(),
      });
      
      setMessage('Backup criado com sucesso!');
    } catch (err) {
      setError(`Erro ao criar backup: ${err.message}`);
    } finally {
      setBackupInProgress(false);
    }
  };

  const restoreBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!confirm('ATENÇÃO: Restaurar um backup substituirá TODOS os dados atuais. Esta ação não pode ser desfeita. Deseja continuar?')) {
      e.target.value = null;
      return;
    }
    
    setRestoreInProgress(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Restaurar dados no banco
          // Restaurar dados no banco
          // Para cada tabela no backup, inserir os dados
          for (const [table, tableData] of Object.entries(data)) {
            if (tableData && typeof tableData === 'object') {
              // Limpar a tabela primeiro
              await supabase.from(table).delete().neq('id', '0');
              
              // Inserir os novos dados
              if (Array.isArray(tableData)) {
                await supabase.from(table).insert(tableData);
              } else {
                // Converter objeto em array de objetos com id
                const dataArray = Object.entries(tableData).map(([id, value]) => ({
                  id,
                  ...value
                }));
                await supabase.from(table).insert(dataArray);
              }
            }
          }
          
          // Registrar atividade
          await supabase.from('activities').insert({
            type: 'backup_restored',
            userId: currentUser.uid,
            timestamp: Date.now(),
          });
          
          setMessage('Backup restaurado com sucesso! Recarregando dados...');
          loadData();
        } catch (err) {
          setError(`Erro ao processar arquivo de backup: ${err.message}`);
        } finally {
          setRestoreInProgress(false);
        }
      };
      
      reader.onerror = () => {
        setError('Erro ao ler arquivo de backup');
        setRestoreInProgress(false);
      };
      
      reader.readAsText(file);
    } catch (err) {
      setError(`Erro ao restaurar backup: ${err.message}`);
      setRestoreInProgress(false);
    }
    
    e.target.value = null;
  };

  const clearData = async (collection) => {
    if (!confirm(`ATENÇÃO: Isso removerá TODOS os dados da coleção ${collection}. Esta ação não pode ser desfeita. Deseja continuar?`)) return;
    
    setIsLoading(true);
    try {
      // Se for limpar tudo, limpar todas as tabelas
      if (collection === '/') {
        const tables = ['collections', 'operators', 'users', 'onlineUsers', 'activities'];
        for (const table of tables) {
          const { error } = await supabase
            .from(table)
            .delete()
            .neq('id', '0'); // Deleta todos os registros exceto o com id '0' (se existir)
          
          if (error) {
            console.error(`Erro ao limpar tabela ${table}:`, error);
          }
        }
      } else {
        // Limpar apenas a coleção específica
        const { error } = await supabase
          .from(collection)
          .delete()
          .neq('id', '0');
          
        if (error) {
          console.error(`Erro ao limpar coleção ${collection}:`, error);
        }
      }
      
      // Atualizar estado local
      if (collection === '/') {
        setCollections({});
      } else {
        setCollections({
          ...collections,
          [collection]: []
        });
      }
      
      // Registrar atividade
      await supabase.from('activities').insert({
        type: 'collection_cleared',
        userId: currentUser.uid,
        collection,
        timestamp: Date.now(),
      });
      
      setMessage(`Coleção ${collection} limpa com sucesso!`);
    } catch (err) {
      setError(`Erro ao limpar coleção: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_login': return <Users className="h-4 w-4" />;
      case 'user_register': return <UserX className="h-4 w-4" />;
      case 'package_created': return <Database className="h-4 w-4" />;
      case 'package_updated': return <RefreshCw className="h-4 w-4" />;
      case 'package_deleted': return <Trash2 className="h-4 w-4" />;
      case 'backup_created': return <Download className="h-4 w-4" />;
      case 'backup_restored': return <Upload className="h-4 w-4" />;
      case 'user_removed': return <UserX className="h-4 w-4" />;
      case 'item_removed': return <Trash2 className="h-4 w-4" />;
      case 'collection_cleared': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'user_login':
        return `Usuário ${activity.userId} fez login`;
      case 'user_register':
        return `Novo usuário ${activity.userId} registrado`;
      case 'package_created':
        return `Pacote ${activity.packageId} criado por ${activity.userId}`;
      case 'package_updated':
        return `Pacote ${activity.packageId} atualizado por ${activity.userId}`;
      case 'package_deleted':
        return `Pacote ${activity.packageId} removido por ${activity.userId}`;
      case 'backup_created':
        return `Backup criado por ${activity.userId}`;
      case 'backup_restored':
        return `Backup restaurado por ${activity.userId}`;
      case 'user_removed':
        return `Usuário ${activity.targetId} removido por ${activity.userId}`;
      case 'item_removed':
        return `Item ${activity.itemId} removido da coleção ${activity.collection} por ${activity.userId}`;
      case 'collection_cleared':
        return `Coleção ${activity.collection} limpa por ${activity.userId}`;
      default:
        return `Atividade desconhecida: ${activity.type}`;
    }
  };

  if (!isOpen) return null;
  
  // Check if user is manager to restrict certain operations
  const isManager = currentUser?.isManager;
  const isAdmin = currentUser?.isAdmin;

  return (
    <TooltipProvider>
      <motion.div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="fixed inset-4 bg-card border rounded-lg shadow-lg overflow-auto z-50"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-primary" />
                <h2 className="text-2xl font-bold">Painel de Administração</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>

            {message && (
              <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-md mb-4 flex items-center">
                <div className="mr-2">✓</div>
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-md mb-4 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

                        {isManager && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Você está conectado como Supervisor. Você tem acesso para visualizar os dados, mas algumas ações administrativas estão restritas.
                </p>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                          <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="dashboard">
                <BarChart className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="data">
                <Database className="h-4 w-4 mr-2" />
                Dados
              </TabsTrigger>
              <TabsTrigger value="system">
                <Settings className="h-4 w-4 mr-2" />
                Sistema
              </TabsTrigger>
            </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                {isManager && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="text-md font-semibold text-blue-700 mb-2">Painel do Supervisor</h3>
                    <p className="text-sm text-blue-600">
                      Bem-vindo ao painel de supervisão. Aqui você pode monitorar as atividades do sistema, 
                      visualizar estatísticas e acompanhar o desempenho da equipe. Algumas ações administrativas 
                      estão disponíveis apenas para administradores completos do sistema.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} ativos nos últimos 7 dias
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total de Pacotes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{packageStats.total || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {packageStats.published || 0} publicados, {packageStats.draft || 0} rascunhos
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Downloads Médios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{packageStats.avgDownloads || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avaliação média: {packageStats.avgRating || '0.0'}/5.0
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Tamanho do Banco</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(systemStatus.dbSize / 1024 / 1024).toFixed(2)} MB</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Último backup: {systemStatus.lastBackup ? formatDate(systemStatus.lastBackup) : 'Nunca'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Atividades Recentes</CardTitle>
                      <CardDescription>Últimas 50 atividades do sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-auto">
                      <div className="space-y-4">
                        {activities.length > 0 ? activities.map(activity => (
                          <div key={activity.id} className="flex items-start space-x-4">
                            <div className="bg-muted p-2 rounded-full">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-muted-foreground text-sm">Nenhuma atividade registrada</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Status do Sistema</CardTitle>
                        <CardDescription>Desempenho e alertas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Desempenho</span>
                              <span className="text-sm font-medium">{systemStatus.performance}%</span>
                            </div>
                            <Progress value={systemStatus.performance} />
                          </div>
                          
                          <div className="space-y-2">
                            <span className="text-sm">Tempo de atividade</span>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{Math.floor(systemStatus.uptime / 86400)} dias, {Math.floor((systemStatus.uptime % 86400) / 3600)} horas</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="text-sm">Alertas</span>
                            {systemStatus.errors.length > 0 || systemStatus.warnings.length > 0 ? (
                              <div className="space-y-2">
                                {systemStatus.errors.map((error, i) => (
                                  <div key={i} className="flex items-center space-x-2 text-red-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">{error}</span>
                                  </div>
                                ))}
                                {systemStatus.warnings.map((warning, i) => (
                                  <div key={i} className="flex items-center space-x-2 text-amber-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">{warning}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-green-600">
                                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                <span className="text-sm">Todos os sistemas operacionais</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Pacotes Duplicados</CardTitle>
                        <CardDescription>Possíveis duplicações no sistema</CardDescription>
                      </CardHeader>
                      <CardContent className="max-h-40 overflow-auto">
                        {duplicatePackages.length > 0 ? (
                          <div className="space-y-2">
                            {duplicatePackages.map((item, i) => (
                              <div key={i} className="text-sm border rounded-md p-2">
                                <div className="font-medium">{item.original.title}</div>
                                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                                  <span>Original: {item.original.id}</span>
                                  <span>Duplicado: {item.duplicate.id}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Nenhum pacote duplicado encontrado</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Calendar />
                  <SoundTest isSoundEnabled={true} onToggleSound={() => {}} />
                </div>
                <RealtimeMonitor />
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Gerenciar Usuários</CardTitle>
                    <CardDescription>
                      {filteredUsers.length} usuários encontrados
                      {searchTerm && ` para "${searchTerm}"`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-2 px-4 text-left font-medium">ID</th>
                            <th className="py-2 px-4 text-left font-medium">Nome</th>
                            <th className="py-2 px-4 text-left font-medium">Email</th>
                            <th className="py-2 px-4 text-left font-medium">Criado em</th>
                            <th className="py-2 px-4 text-left font-medium">Último login</th>
                            <th className="py-2 px-4 text-left font-medium">Status</th>
                            <th className="py-2 px-4 text-left font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.uid} className="border-b">
                              <td className="py-2 px-4 font-mono text-xs">{user.uid.substring(0, 8)}...</td>
                              <td className="py-2 px-4">{user.displayName || 'N/A'}</td>
                              <td className="py-2 px-4">{user.email}</td>
                              <td className="py-2 px-4">{formatDate(user.createdAt)}</td>
                              <td className="py-2 px-4">{formatDate(user.lastLogin)}</td>
                              <td className="py-2 px-4">
                                {user.isAdmin ? (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
                                ) : user.isBlocked ? (
                                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Bloqueado</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => removeUser(user.uid)}
                                  disabled={user.isAdmin || isLoading || isManager}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={7} className="py-4 px-4 text-center text-muted-foreground">
                                Nenhum usuário encontrado
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(collections).map(([collectionName, items]) => {
                    const filteredItems = filteredCollections[collectionName] || [];
                    return (
                      <Card key={collectionName}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="capitalize">{collectionName}</CardTitle>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => clearData(collectionName)}
                              disabled={isLoading || isManager}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Limpar
                            </Button>
                          </div>
                          <CardDescription>
                            {filteredItems.length} itens encontrados
                            {searchTerm && ` para "${searchTerm}"`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md border max-h-80 overflow-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="py-2 px-4 text-left font-medium">ID</th>
                                  <th className="py-2 px-4 text-left font-medium">Título</th>
                                  <th className="py-2 px-4 text-left font-medium">Criado em</th>
                                  <th className="py-2 px-4 text-left font-medium">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredItems.length > 0 ? filteredItems.map(item => (
                                  <tr key={item.id} className="border-b">
                                    <td className="py-2 px-4 font-mono text-xs">{item.id.substring(0, 8)}...</td>
                                    <td className="py-2 px-4">{item.title || item.name || item.id}</td>
                                    <td className="py-2 px-4">{formatDate(item.createdAt)}</td>
                                    <td className="py-2 px-4">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeCollection(collectionName, item.id)}
                                        disabled={isLoading || isManager}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={4} className="py-4 px-4 text-center text-muted-foreground">
                                      Nenhum item encontrado
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="system">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Sistema</CardTitle>
                      <CardDescription>Estatísticas e métricas</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Armazenamento</h4>
                          <div className="flex items-center">
                            <HardDrive className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{(systemStatus.dbSize / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Tempo de Atividade</h4>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{Math.floor(systemStatus.uptime / 86400)} dias</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Desempenho</h4>
                          <div className="flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{systemStatus.performance}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Alertas</h4>
                          <div className="flex items-center">
                            <Bell className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{systemStatus.errors.length + systemStatus.warnings.length}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Logs do Sistema</h4>
                        <div className="bg-muted p-2 rounded-md h-32 overflow-auto font-mono text-xs">
                          {systemStatus.errors.map((error, i) => (
                            <div key={`error-${i}`} className="text-red-500">[ERRO] {error}</div>
                          ))}
                          {systemStatus.warnings.map((warning, i) => (
                            <div key={`warning-${i}`} className="text-amber-500">[AVISO] {warning}</div>
                          ))}
                          {systemStatus.errors.length === 0 && systemStatus.warnings.length === 0 && (
                            <div className="text-green-500">[INFO] Sistema operando normalmente</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Manutenção do Sistema</CardTitle>
                      <CardDescription>Backup e restauração</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Backup de Dados</h4>
                            <p className="text-sm text-muted-foreground">
                              Último backup: {systemStatus.lastBackup ? formatDate(systemStatus.lastBackup) : 'Nunca'}
                            </p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={createBackup}
                                disabled={isLoading || backupInProgress || isManager}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {backupInProgress ? 'Processando...' : 'Criar Backup'}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cria um arquivo JSON com todos os dados do sistema</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <h4 className="font-medium">Restaurar Backup</h4>
                            <p className="text-sm text-muted-foreground">
                              Restaure o sistema a partir de um arquivo de backup
                            </p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Input 
                                  type="file" 
                                  accept=".json" 
                                  onChange={restoreBackup}
                                  disabled={isLoading || restoreInProgress || isManager}
                                  className="w-40"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Selecione um arquivo de backup JSON para restaurar</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <h4 className="font-medium">Limpar Todos os Dados</h4>
                            <p className="text-sm text-muted-foreground">
                              Remover todos os dados do sistema
                            </p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => clearData('/')}
                            disabled={isLoading || isManager}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Limpar Tudo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <p className="text-xs text-muted-foreground">
                        Atenção: Todas as operações de limpeza são irreversíveis. Recomendamos criar um backup antes de prosseguir.
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

export default AdminPanel;