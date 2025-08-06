import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';
import { Button } from './components/ui/button';
import PasswordModal from './components/PasswordModal';
import LoginModal from './components/LoginModal';
import PackageInput from './components/PackageInput';
import PackageList from './components/PackageList';
import StatsDisplay from './components/StatsDisplay';
import ActionButtons from './components/ActionButtons';
import OperatorManager from './components/OperatorManager';
import ObservationModal from './components/ObservationModal';
import StoreDashboard from './components/StoreDashboard';
import AppHeader from './components/AppHeader';
import CollectionControls from './components/CollectionControls';
import TrelloActions from './components/TrelloActions';
import SoundControls from './components/SoundControls';
import LoadingSpinner from './components/LoadingSpinner'; 
import ErrorDisplay from './components/ErrorDisplay';
import LastScannedPackage from './components/LastScannedPackage';
import RealtimeActivity from './components/RealtimeActivity';
import SyncStatus from './components/SyncStatus';
import AdminPanel from './components/AdminPanel';
import OnlineUsersMonitor from './components/OnlineUsersMonitor';

import { useFirebase } from './contexts/SupabaseContext';

import useLocalStorage from './hooks/useLocalStorage';
import { createTrelloCardWithAttachments } from './lib/trello'; 
import { generateReportContent, handleExportFile, handlePrintReport } from './lib/reportUtils';
import jsPDF from 'jspdf';

import { motion, AnimatePresence } from 'framer-motion';

const ARKOS_DUPLICATE_PASSWORD = 'karstoq2025';
const INITIAL_OPERATOR = 'Não Definido';

// Usuários do sistema
const DEFAULT_USERS = [
  { id: 1, username: 'admin', password: 'admin', name: 'Administrador' }
];

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true); // Iniciar com o modal de login aberto
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [observationType, setObservationType] = useState('general'); 
  const [observationForDuplicate, setObservationForDuplicate] = useState('');
  const [isSoundEnabled, setIsSoundEnabled] = useLocalStorage('arkosSoundEnabled', true);
  
  const [observations, setObservations] = useLocalStorage('arkosObservations', '');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('arkosTheme', true);
  
  const [allCollectionsData, setAllCollectionsData] = useLocalStorage('arkosAllCollectionsData', {});
  
  const [currentOperator, setCurrentOperator] = useLocalStorage('arkosCurrentOperator', INITIAL_OPERATOR);
  const [operators, setOperators] = useLocalStorage('arkosOperators', [INITIAL_OPERATOR]);
  const [users, setUsers] = useLocalStorage('arkosUsers', DEFAULT_USERS);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('arkosLoggedIn', false);
  const [currentUser, setCurrentUser] = useLocalStorage('arkosCurrentUser', null);

  const [currentStore, setCurrentStore] = useState('Shopfaz');
  const [currentPeriod, setCurrentPeriod] = useState('Manha');

  const { toast } = useToast();
  const packageInputRef = useRef(null);
  // Não precisamos mais do fileInputRef pois o PDF é gerado diretamente 
  const [currentTrelloContext, setCurrentTrelloContext] = useState('');
  const [isLoadingTrello, setIsLoadingTrello] = useState(false);
  const [pendingDuplicateCodeForObservation, setPendingDuplicateCodeForObservation] = useState(null);
  const [trelloError, setTrelloError] = useState(null);

  const audioRefs = {
    bip: useRef(null),
    siren: useRef(null),
  };

  const getCollectionKey = useCallback((store, period, operator, dateStr) => {
    const dateToUse = dateStr || new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    return `${store}_${period}_${operator}_${dateToUse}`;
  }, []);
  
  const [currentCollectionName, setCurrentCollectionName] = useState(
    () => getCollectionKey(currentStore, currentPeriod, currentOperator)
  );
  
  const [scannedPackages, setScannedPackages] = useState([]);
  const [duplicatePackages, setDuplicatePackages] = useState([]);
  const [lastScannedPackage, setLastScannedPackage] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    const anyModalOpen = isPasswordModalOpen || isObservationModalOpen || isLoadingTrello || isLoginModalOpen || isAdminPanelOpen;
    document.body.style.overflow = anyModalOpen ? 'hidden' : 'auto';
    
    // Verificar se o usuário está logado
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    } else if (currentUser?.isAdmin) {
      // Se o usuário logado for admin, mostrar o botão de admin no header
      document.documentElement.classList.add('admin-user');
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDarkMode, isPasswordModalOpen, isObservationModalOpen, isLoadingTrello, isLoginModalOpen, isLoggedIn, currentUser]);

  // Listener para combinação de teclas Ctrl+Shift+A para acessar painel administrativo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (currentUser?.isAdmin) {
          setIsAdminPanelOpen(true);
          toast({
            title: 'Painel Administrativo',
            description: 'Painel administrativo aberto via atalho de teclado.',
            className: 'arkos-toast-info'
          });
        } else {
          toast({
            title: 'Acesso Negado',
            description: 'Apenas administradores podem acessar o painel administrativo.',
            className: 'arkos-toast-error'
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentUser]);

  useEffect(() => {
    const newKey = getCollectionKey(currentStore, currentPeriod, currentOperator);
    if (newKey !== currentCollectionName) {
      setCurrentCollectionName(newKey);
    }
  }, [currentStore, currentPeriod, currentOperator, getCollectionKey, currentCollectionName]);

  // Usar o Supabase para sincronizar coleções
  const { collections, saveCollection, updateCollection, logActivity } = useFirebase();
  
  useEffect(() => {
    // Carregar dados do Supabase se disponíveis, senão usar localStorage
    if (collections && collections[currentCollectionName]) {
      const currentCollection = collections[currentCollectionName];
      setScannedPackages(currentCollection.packages || []);
      setDuplicatePackages(currentCollection.duplicates || []);
    }
    const supabaseData = collections[currentCollectionName];
    const localData = allCollectionsData[currentCollectionName] || { packages: [], duplicates: [] };
    
    // Priorizar dados do Supabase se existirem
    const collectionData = supabaseData || localData;
    
    // Garantir que packages e duplicates sejam sempre arrays
    const packagesArray = Array.isArray(collectionData.packages) ? collectionData.packages : [];
    const duplicatesArray = Array.isArray(collectionData.duplicates) ? collectionData.duplicates : [];
    
    setScannedPackages(packagesArray);
    setDuplicatePackages(duplicatesArray);
    
    // Se temos dados locais mas não no Supabase, sincronizar para o Supabase
    if (localData && localData.packages && localData.packages.length > 0 && !supabaseData) {
      saveCollection(currentCollectionName, localData);
    }
  }, [currentCollectionName, allCollectionsData, collections, saveCollection]);

  useEffect(() => {
    if(scannedPackages.length > 0 || duplicatePackages.length > 0 || (allCollectionsData[currentCollectionName] && (allCollectionsData[currentCollectionName].packages.length > 0 || allCollectionsData[currentCollectionName].duplicates.length > 0))) {
      // Criar objeto de coleção atualizado
      const updatedCollection = {
        packages: scannedPackages,
        duplicates: duplicatePackages,
        store: currentStore,
        period: currentPeriod,
        operator: currentOperator,
        date: new Date().toLocaleDateString('pt-BR'),
        lastUpdated: new Date().toISOString()
      };
      
      // Atualizar no localStorage
      setAllCollectionsData(prev => {
        if(updatedCollection.packages.length === 0 && updatedCollection.duplicates.length === 0 && !(prev[currentCollectionName] && (prev[currentCollectionName].packages.length > 0 || prev[currentCollectionName].duplicates.length > 0))) {
           const { [currentCollectionName]: _, ...rest } = prev;
           return rest;
        }

        return {
          ...prev,
          [currentCollectionName]: updatedCollection
        };
      });
      
      // Atualizar no Supabase
      if (updatedCollection.packages.length > 0 || updatedCollection.duplicates.length > 0) {
        updateCollection(currentCollectionName, updatedCollection);
        
        // Registrar atividade de atualização
        logActivity({
          type: 'update',
          message: `atualizou a coleção ${currentStore} - ${currentPeriod}`,
          collectionName: currentCollectionName,
          packageCount: updatedCollection.packages.length,
          duplicateCount: updatedCollection.duplicates.length
        });
      }
    }
  }, [scannedPackages, duplicatePackages, currentCollectionName, currentStore, currentPeriod, currentOperator, setAllCollectionsData, allCollectionsData, updateCollection, logActivity]);


  const playSound = async (type) => {
    if (!isSoundEnabled) return;
    
    // Verificar se o tipo de som é válido
    if (!type || (type !== 'bip' && type !== 'siren')) {
      console.error(`Tipo de som inválido: ${type}`);
      return;
    }
    
    // Função para tocar som com múltiplas estratégias otimizadas
    const playSoundWithFallbacks = async () => {
      // Estratégia 1: AudioContext API com ganho máximo (mais alto e nítido)
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioContext = new AudioContext();
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 8.0; // Ganho muito alto para som mais nítido
          const cacheBuster = `?t=${new Date().getTime()}`;
          const response = await fetch(`./sounds/${type}.mp3${cacheBuster}`);
          
          if (!response.ok) {
            throw new Error(`Falha ao carregar arquivo de som: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
          source.start(0);
          return true;
        }
      } catch (error) {
        console.warn(`Estratégia 1 falhou para som ${type}:`, error);
      }
      
      // Estratégia 2: Múltiplas instâncias simultâneas para volume máximo
      try {
        const promises = [];
        // Criar 5 instâncias do mesmo som para volume máximo
        for (let i = 0; i < 5; i++) {
          const audio = new Audio(`./sounds/${type}.mp3?t=${new Date().getTime() + i}`);
          audio.volume = 1.0;
          audio.crossOrigin = 'anonymous';
          promises.push(audio.play());
        }
        await Promise.all(promises);
        return true;
      } catch (error) {
        console.warn(`Estratégia 2 falhou para som ${type}:`, error);
      }
      
      // Estratégia 3: Usar referência de áudio existente com volume máximo
      if (audioRefs[type] && audioRefs[type].current) {
        try {
          audioRefs[type].current.pause();
          audioRefs[type].current.currentTime = 0;
          audioRefs[type].current.volume = 1.0;
          
          const currentSrc = audioRefs[type].current.src;
          audioRefs[type].current.src = '';
          audioRefs[type].current.src = currentSrc + '?t=' + new Date().getTime();
          
          const playPromise = audioRefs[type].current.play();
          if (playPromise !== undefined) {
            await playPromise;
          }
          return true;
        } catch (error) {
          console.warn(`Estratégia 3 falhou para som ${type}:`, error);
        }
      }
      
      // Estratégia 4: Criar novo elemento de áudio com volume máximo
      try {
        const cacheBuster = `?t=${new Date().getTime()}`;
        const newAudio = new Audio(`./sounds/${type}.mp3${cacheBuster}`);
        newAudio.volume = 1.0;
        newAudio.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          newAudio.oncanplaythrough = resolve;
          newAudio.onerror = reject;
          newAudio.load();
          setTimeout(resolve, 500);
        });
        
        await newAudio.play();
        return true;
      } catch (error) {
        console.warn(`Estratégia 4 falhou para som ${type}:`, error);
      }
      
      return false;
    };
    
    // Tentar reproduzir o som com até 2 tentativas rápidas
    let attempts = 0;
    const maxAttempts = 2;
    
    const attemptWithRetry = async () => {
      attempts++;
      
      try {
        const success = await playSoundWithFallbacks();
        
        if (success) {
          console.log(`Som ${type} reproduzido com sucesso na tentativa ${attempts}`);
          return;
        }
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          return attemptWithRetry();
        } else {
          console.error(`Todas as ${maxAttempts} tentativas de reproduzir o som ${type} falharam`);
        }
      } catch (error) {
        console.error(`Erro na tentativa ${attempts} de reproduzir som ${type}:`, error);
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          return attemptWithRetry();
        }
      }
    };
    
    // Iniciar o processo de reprodução imediatamente
    attemptWithRetry().catch(error => {
      console.error(`Erro fatal ao tentar reproduzir som ${type}:`, error);
    });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value.replace(/\s/g, ''));
  };

  const isCodeDuplicateInAnyCollection = (code) => {
    if (!allCollectionsData || typeof allCollectionsData !== 'object') {
      return false;
    }
    
    for (const key in allCollectionsData) {
      const collection = allCollectionsData[key];
      if (!collection) continue;
      
      if (collection.packages && Array.isArray(collection.packages) && 
          collection.packages.some(item => typeof item === 'object' ? item.code === code : item === code)) {
        return true;
      }
      
      if (collection.duplicates && Array.isArray(collection.duplicates) && 
          collection.duplicates.some(item => typeof item === 'object' ? item.code === code : item === code)) {
        return true;
      }
    }
    return false;
  };

  const { addScannedPackage, addDuplicatePackage } = useFirebase();

  const handleScanPackage = async () => {
    const code = inputValue.trim();
    if (!code) {
      toast({ variant: 'destructive', title: 'Entrada Inválida', description: 'Por favor, insira o código do pacote.' });
      return;
    }

    // Adicionar timestamp ao código
    const now = new Date();
    const timestamp = now.toLocaleTimeString('pt-BR');
    const codeWithTimestamp = { code, timestamp };

    try {
      // Verificar se o código já existe em alguma coleção
      const isDuplicate = isCodeDuplicateInAnyCollection(code);
      
      // Primeiro atualizar a UI para evitar congelamento
      if (isDuplicate) {
        // Atualizar a UI primeiro
        setDuplicatePackages(prev => {
          const newArray = Array.isArray(prev) ? [...prev, codeWithTimestamp] : [codeWithTimestamp];
          return newArray;
        });
        
        // Mostrar toast de alerta
        toast({
          variant: 'destructive',
          title: 'Pacote Duplicado!',
          description: `O pacote ${code} já foi registrado anteriormente.`
        });
        
        // Depois fazer a operação assíncrona
        setTimeout(() => {
          playSound('siren');
          addDuplicatePackage(currentCollectionName, codeWithTimestamp)
            .catch(err => console.error('Erro ao adicionar pacote duplicado:', err));
        }, 0);
      } else {
        // Atualizar a UI primeiro
        setScannedPackages(prev => {
          const newArray = Array.isArray(prev) ? [...prev, codeWithTimestamp] : [codeWithTimestamp];
          return newArray;
        });
        
        // Depois fazer a operação assíncrona
        setTimeout(() => {
        playSound('bip');
        addScannedPackage(currentCollectionName, codeWithTimestamp)
          .catch(err => console.error('Erro ao adicionar pacote escaneado:', err));
      }, 0);
    }

    // Atualizar último pacote escaneado
      setLastScannedPackage(codeWithTimestamp);
      setInputValue('');
    } catch (error) {
      console.error('Erro ao processar pacote:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Processar',
        description: 'Ocorreu um erro ao processar o pacote. Tente novamente.'
      });
    }

    // Limpar o input e focar após o processamento bem-sucedido
    setInputValue('');
    setTimeout(() => packageInputRef.current?.focus(), 100);
  }

  const handleUnlockModal = () => {
    setIsPasswordModalOpen(false);
    if (pendingDuplicateCodeForObservation) {
      setObservationForDuplicate(''); 
      setObservationType('duplicate');
      setIsObservationModalOpen(true); 
    } else {
      setTimeout(() => packageInputRef.current?.focus(), 100);
    }
    toast({ title: 'Desbloqueado', description: 'Sistema desbloqueado.', className: 'arkos-toast-info' });
  };
  
  // Função para lidar com o login - otimizada para melhor desempenho
  const handleLogin = async (user) => {
    try {
      // Usar setTimeout para evitar bloqueio da UI e travamentos
      setTimeout(async () => {
        try {
          // Verificar se a lista de usuários existe e é um array
          if (!users || !Array.isArray(users)) {
            // Se não for um array, inicializar como array vazio
            setUsers([user]);
          } else {
            // Verificar se o usuário já existe na lista de usuários
            const existingUserIndex = users.findIndex(u => u.id === user.id);
            
            // Se o usuário não existir na lista (novo cadastro), adicionar à lista
            if (existingUserIndex === -1) {
              const updatedUsers = [...users, user];
              setUsers(updatedUsers);
            }
          }
          
          // Atualizar estado do usuário e login
          setCurrentUser(user);
          setIsLoggedIn(true);
          setIsLoginModalOpen(false); // Fechar o modal de login
          
          // Registrar usuário online e atividade
          try {
            // Implementar lógica de registro de usuário online e atividade
            // Exemplo:
            // await registerOnlineUser(user);
            // await registerActivity('login', `${user.name} fez login no sistema`, user);
          } catch (error) {
            console.error('Erro ao registrar login:', error);
          }
          
          // Verificar se é um usuário administrador
          if (user.isAdmin) {
            // Não abrir o painel automaticamente, apenas mostrar toast com instruções
            toast({ 
              title: 'Login de Administrador', 
              description: `Bem-vindo ao painel administrativo! Pressione Ctrl+Shift+A para acessar.`, 
              className: 'arkos-toast-admin',
              duration: 5000
            });
          } else {
            toast({ 
              title: 'Login Realizado', 
              description: `Bem-vindo, ${user.name}!`, 
              className: 'arkos-toast-success' 
            });
          }
        } catch (innerError) {
          console.error('Erro durante o processamento do login:', innerError);
          toast({ 
            className: 'arkos-toast-error', 
            title: 'Erro no Login', 
            description: 'Ocorreu um erro ao processar o login. Tente novamente.' 
          });
        }
      }, 100); // Pequeno atraso para evitar travamentos
    } catch (error) {
      console.error('Erro durante o login:', error);
      toast({ 
        className: 'arkos-toast-error', 
        title: 'Erro no Login', 
        description: 'Ocorreu um erro ao processar o login. Tente novamente.' 
      });
    }
  };
  
  // Função para fazer logout
  const handleLogout = () => {
    // Registrar atividade de logout
    if (currentUser) {
      logActivity({
        type: 'logout',
        message: 'saiu do sistema',
        userId: currentUser.id,
        userName: currentUser.name
      });
    }
    
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsLoginModalOpen(true);
    setIsAdminPanelOpen(false);
    toast({ title: 'Logout', description: 'Você saiu do sistema.', className: 'arkos-toast-info' });
  };
  
  // Estado para controlar o modal de senha do painel administrativo
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  
  // Senha para acesso ao painel administrativo
  const ADMIN_PANEL_PASSWORD = 'quito123';
  
  const toggleAdminPanel = () => {
    // Verificar se o painel já está aberto
    if (isAdminPanelOpen) {
      // Fechar o painel
      setIsAdminPanelOpen(false);
    } else {
      // Abrir o modal de senha para verificação
      setIsAdminPasswordModalOpen(true);
    }
  };
  
  // Função para lidar com o desbloqueio do painel administrativo
  const handleUnlockAdminPanel = (password) => {
    // Verificar se o usuário é administrador
    if (!currentUser?.isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem acessar este painel.",
        className: "arkos-toast-error"
      });
      setIsAdminPasswordModalOpen(false);
      return;
    }
    
    // Verificar se a senha está correta
    if (password === ADMIN_PANEL_PASSWORD) {
      // Fechar o modal de senha
      setIsAdminPasswordModalOpen(false);
      
      // Abrir o painel com otimização para evitar travamentos
      setTimeout(() => {
        setIsAdminPanelOpen(true);
        
        // Notificar o usuário que o painel está sendo carregado
        toast({
          title: "Painel Administrativo",
          description: "Carregando painel administrativo...",
          className: "arkos-toast-info"
        });
      }, 100); // Pequeno atraso para evitar travamentos
    } else {
      toast({
        title: "Acesso Negado",
        description: "Senha incorreta. Tente novamente.",
        className: "arkos-toast-error"
      });
    }
  };
  
  // Função para limpar atividades com segurança (evitando erro WRITE_TOO_BIG)
  const handleClearActivities = async () => {
    try {
      // Usar Supabase em vez de Firebase
      // const { error } = await supabase
      //   .from('activities')
      //   .delete()
      //   .neq('id', '0'); // Excluir todos os registros
      
      // if (error) throw error;
      
      toast({
        title: "Atividades Limpas",
        description: "Todas as atividades foram removidas com sucesso.",
        className: "arkos-toast-success"
      });
    } catch (error) {
      console.error('Erro ao limpar atividades:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao limpar as atividades. Tente novamente.",
        className: "arkos-toast-error"
      });
    }
  };

  const handleSaveObservation = (obsText) => {
    if (observationType === 'duplicate' && pendingDuplicateCodeForObservation) {
      const newObservationEntry = `Pacote Duplicado (${pendingDuplicateCodeForObservation}): ${obsText} - Operador: ${currentOperator} - Data: ${new Date().toLocaleString('pt-BR')}\n`;
      setObservations(prevObs => prevObs + newObservationEntry);
      toast({ title: 'Observação de Duplicado Salva', className: 'arkos-toast-success' });
    } else if (observationType === 'general') {
      setObservations(obsText); // Overwrite general observations
      toast({ title: 'Observações Gerais Salvas', className: 'arkos-toast-success' });
    }
    setIsObservationModalOpen(false);
    setPendingDuplicateCodeForObservation(null);
    setTimeout(() => packageInputRef.current?.focus(), 100);
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanPackage();
    }
  };

  const handleClearCurrentVisualCollection = () => {
    if (scannedPackages.length === 0 && duplicatePackages.length === 0) {
      toast({ className: 'arkos-toast-error', title: 'Coleta Visual Vazia', description: `A coleta visual para ${currentStore} (${currentPeriod}) já está vazia.` });
      return;
    }
    setScannedPackages([]);
    setDuplicatePackages([]);
    toast({ title: 'Contadores Visuais Limpos', description: `Contadores para ${currentStore} (${currentPeriod}) foram zerados. Histórico mantido.`, className: 'arkos-toast-info' });
  };
  
  const handleStartNewCollectionPeriod = (store, period) => {
    setCurrentStore(store);
    setCurrentPeriod(period);
    const newKey = getCollectionKey(store, period, currentOperator);
    setCurrentCollectionName(newKey);
    toast({ title: `Nova Coleta Iniciada`, description: `Coleta para ${store} (${period}) iniciada. Operador: ${currentOperator}.`, className: 'arkos-toast-info' });
  };

  const handleExport = (type) => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const collectionsToReport = {};
    Object.entries(allCollectionsData)
      .filter(([key, value]) => value.date === todayStr)
      .forEach(([key, value]) => {
        collectionsToReport[key] = value;
      });

    if (Object.keys(collectionsToReport).length === 0) {
        toast({className: 'arkos-toast-error', title: 'Nenhuma coleta hoje', description: 'Não há dados de coleta para exportar para a data de hoje.'});
        return;
    }
    const reportData = { 
      collections: collectionsToReport, 
      observations,
      operator: currentOperator,
      currentCollectionNameForTitle: `Relatório Diário - ${todayStr}`
    };
    const content = generateReportContent(type, reportData);
    const dateSuffix = todayStr.replace(/\//g, '-');
    const fileName = `arkos_relatorio_diario_${dateSuffix}.${type === 'excel' ? 'csv' : 'txt'}`;
    handleExportFile(content, fileName, type === 'excel' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;');
    toast({ title: `Exportação ${type.toUpperCase()}`, description: `Relatório "${fileName}" gerado.` });
  };

  const handlePrint = () => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const collectionsToReport = {};
    Object.entries(allCollectionsData)
      .filter(([key, value]) => value.date === todayStr)
      .forEach(([key, value]) => {
        collectionsToReport[key] = value;
      });
    
    if (Object.keys(collectionsToReport).length === 0) {
        toast({className: 'arkos-toast-error', title: 'Nenhuma coleta hoje', description: 'Não há dados de coleta para imprimir para a data de hoje.'});
        return;
    }
    const reportData = { 
      collections: collectionsToReport, 
      observations,
      operator: currentOperator,
    };
    handlePrintReport(reportData);
    toast({ title: 'Impressão Iniciada', description: 'Verifique a janela de impressão.' });
  };
  
  // Função para gerar e enviar o PDF diretamente para o Trello sem solicitar imagem
  const handleSendToTrello = async (trelloContext) => {
    try {
      // Atualizar o contexto atual do Trello
      setCurrentTrelloContext(trelloContext);
      
      if (!trelloContext) {
        toast({ className: 'arkos-toast-error', title: 'Erro', description: 'Contexto da loja não definido.' });
        setIsLoadingTrello(false);
        return;
      }
      
      setTrelloError(null);
      toast({ title: 'Enviando para o Trello...', description: 'Aguarde...', className: 'arkos-toast-info' });

      // Etapa 1: Preparar dados básicos
      const now = new Date();
      const dateForCard = now.toLocaleDateString('pt-BR');
      const timeForFile = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/:/g, '');
      const dateForFile = dateForCard.replace(/\//g, '');
      const reportFileName = `${dateForFile}_${timeForFile}_${trelloContext.replace(/\s+/g, '_')}.pdf`;
      
      // Usar requestAnimationFrame para garantir que a UI seja atualizada
      requestAnimationFrame(async () => {
        try {
          // Processar dados de coleções de forma assíncrona
          const processCollectionsPromise = new Promise((resolve) => {
            // Usar web worker ou processamento em segundo plano se disponível
            // Caso contrário, usar Promise para não bloquear a UI
            const collectionsForTrelloReport = {};
            let description = `ROMANEIO ARKOS - ${trelloContext}\n`;
            description += `Data: ${dateForCard}\n`;
            description += `Operador: ${currentOperator}\n\n`;
            let totalPackagesForStore = 0;
            let totalDuplicatesForStore = 0;
            let hasDuplicatesForStore = false;

            // Verificar se allCollectionsData existe e é um objeto
            if (allCollectionsData && typeof allCollectionsData === 'object') {
              // Processar períodos
              for (const period of ['Manha', 'Tarde']) {
                // Usar Object.values apenas se allCollectionsData for um objeto
                const allCollectionsArray = Object.values(allCollectionsData);
                // Verificar se o resultado é um array antes de chamar filter
                if (Array.isArray(allCollectionsArray)) {
                  const collectionsForPeriodAndStore = allCollectionsArray.filter(
                    col => col && col.store === trelloContext && col.period === period && col.date === dateForCard
                  );
                  if (collectionsForPeriodAndStore.length > 0) {
                    description += `--- ${period.toUpperCase()} ---\n`;
                    let packagesInPeriod = 0;
                    let duplicatesInPeriod = 0;
                    collectionsForPeriodAndStore.forEach(colData => {
                      if (colData) {
                        collectionsForTrelloReport[getCollectionKey(colData.store, colData.period, colData.operator, colData.date.replace(/\//g, '-'))] = colData;
                        packagesInPeriod += colData.packages?.length || 0;
                        duplicatesInPeriod += colData.duplicates?.length || 0;
                      }
                    });
                    description += `Total de Pacotes Válidos: ${packagesInPeriod}\n`;
                    if (duplicatesInPeriod > 0) {
                      description += `Pacotes Duplicados: ${duplicatesInPeriod} (CONTACTAR GERÊNCIA)\n`;
                      hasDuplicatesForStore = true;
                    }
                    totalPackagesForStore += packagesInPeriod;
                    totalDuplicatesForStore += duplicatesInPeriod;
                    description += "\n";
                  }
                }
              }
            }
            
            // Etapa 3: Finalizar descrição
            description += `--- RESUMO ${trelloContext} ---\n`;
            description += `Total Geral de Pacotes Válidos (Manhã + Tarde): ${totalPackagesForStore}\n`;
            
            if (hasDuplicatesForStore) {
              description += `Total Geral de Duplicados (Manhã + Tarde): ${totalDuplicatesForStore}\n`;
              description += "Status: Houve duplicação de pacotes.\n";
            } else {
              description += `Status: Nenhum pacote duplicado em ${trelloContext} hoje.\n`;
            }
            if (observations) {
              description += `\n--- Observações Gerais Registradas ---\n${observations}\n`;
            }
            const cardTitle = `ARKOS Romaneio: ${trelloContext} - ${currentOperator} - ${dateForCard}`;
            
            // Resolver a Promise com os dados processados
            resolve({ collectionsForTrelloReport, description, cardTitle });
          });

          // Aguardar o processamento dos dados
          const { collectionsForTrelloReport, description, cardTitle } = await processCollectionsPromise;
          
          // Usar requestAnimationFrame para garantir que a UI seja atualizada
          requestAnimationFrame(async () => {
            try {
              // Gerar conteúdo detalhado do relatório como PDF
              const reportContentForAttachment = await new Promise((resolve) => {
                // Usar web worker ou processamento em segundo plano se disponível
                // Caso contrário, usar Promise para não bloquear a UI
                const content = generateReportContent('pdf', { 
                  collections: collectionsForTrelloReport,
                  observations, 
                  operator: currentOperator,
                  currentCollectionNameForTitle: trelloContext
                });
                resolve(content);
              });
              
              // Criar um arquivo PDF com o conteúdo do relatório usando jsPDF
              // Configurar o documento PDF
              const doc = new jsPDF();
              
              // Definir fonte e tamanho
              doc.setFont('helvetica');
              doc.setFontSize(12);
              
              // Adicionar título
              doc.setFontSize(16);
              doc.text('Relatório ARKOS', 105, 15, { align: 'center' });
              
              // Voltar ao tamanho normal
              doc.setFontSize(12);
              
              // Adicionar informações básicas
              let yPos = 25;
              const lineHeight = 7;
              
              // Função para adicionar texto com quebra de linha automática
              const addWrappedText = (text, y, maxWidth = 180) => {
                const lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, 15, y);
                return y + (lines.length * lineHeight);
              };
              
              // Adicionar cabeçalho
              yPos = addWrappedText(`Coleta: ${trelloContext}`, yPos);
              yPos = addWrappedText(`Operador: ${currentOperator}`, yPos);
              yPos = addWrappedText(`Data: ${new Date().toLocaleString('pt-BR')}`, yPos);
              yPos += 5;
              
              // Adicionar pacotes válidos
              const validPackages = [];
              const duplicatedPackages = [];
              
              // Extrair pacotes das coleções
              Object.values(collectionsForTrelloReport).forEach(collection => {
                if (collection && collection.packages) {
                  validPackages.push(...collection.packages);
                }
                if (collection && collection.duplicates) {
                  duplicatedPackages.push(...collection.duplicates);
                }
              });
              
              // Adicionar pacotes válidos
              yPos = addWrappedText(`Pacotes Válidos (${validPackages.length}):`, yPos);
              if (validPackages.length > 0) {
                // Limitar a quantidade de pacotes mostrados para evitar PDFs muito grandes
                const packagesToShow = validPackages.length > 100 ? 
                  [...validPackages.slice(0, 50), '...', ...validPackages.slice(-50)] : 
                  validPackages;
                  
                yPos = addWrappedText(packagesToShow.join(', '), yPos);
              } else {
                yPos = addWrappedText('Nenhum', yPos);
              }
              yPos += 5;
              
              // Adicionar pacotes duplicados
              doc.setTextColor(255, 0, 0); // Vermelho para duplicados
              yPos = addWrappedText(`Pacotes Duplicados (${duplicatedPackages.length}):`, yPos);
              if (duplicatedPackages.length > 0) {
                yPos = addWrappedText(duplicatedPackages.join(', '), yPos);
              } else {
                yPos = addWrappedText('Nenhum', yPos);
              }
              doc.setTextColor(0, 0, 0); // Voltar para preto
              yPos += 5;
              
              // Adicionar total
              yPos = addWrappedText(`Total Geral Lido: ${validPackages.length + duplicatedPackages.length}`, yPos);
              
              // Adicionar observações se existirem
              if (observations && observations.trim()) {
                yPos += 5;
                yPos = addWrappedText('Observações:', yPos);
                yPos = addWrappedText(observations, yPos);
              }
              
              // Gerar o PDF como blob
              const pdfBlob = doc.output('blob');
              const reportFileForTrello = new File([pdfBlob], reportFileName, { type: 'application/pdf' });

              // Usar requestAnimationFrame para garantir que a UI seja atualizada
              requestAnimationFrame(async () => {
                try {
                  // Enviar para o Trello com o arquivo PDF
                  const trelloResponse = await createTrelloCardWithAttachments({
                    title: cardTitle,
                    description: description,
                    attachments: [
                      { file: reportFileForTrello, fileName: reportFileName, mimeType: 'application/pdf' }
                    ]
                  });
                  
                  if (trelloResponse && trelloResponse.id) {
                    let successMessage = `Card "${cardTitle}" criado com sucesso.`;
                    if(trelloResponse.attachmentErrors && trelloResponse.attachmentErrors.length > 0) {
                      const attachmentErrorMsg = trelloResponse.attachmentErrors.join('; ');
                      successMessage = `Card criado, mas alguns anexos falharam: ${attachmentErrorMsg}`;
                      setTrelloError(`Falha em anexos: ${attachmentErrorMsg}`);
                      toast({ className: 'arkos-toast-error', title: 'Erro em Anexos Trello', description: successMessage, duration: 10000 });
                    } else {
                      toast({ title: 'Sucesso no Trello!', description: successMessage, className: 'arkos-toast-success', duration: 7000 });
                    }
                  } else {
                    throw new Error(trelloResponse?.message || "Resposta inesperada do Trello ao criar card. Verifique se o card foi criado no Trello.");
                  }
                } catch (error) {
                  console.error('Erro ao interagir com Trello:', error);
                  const errorMessage = error.message || "Erro desconhecido ao enviar para o Trello.";
                  setTrelloError(errorMessage);
                  toast({ className: 'arkos-toast-error', title: 'Erro no Trello', description: `Falha: ${errorMessage}`, duration: 10000 });
                } finally {
                  setIsLoadingTrello(false);
                  setCurrentTrelloContext('');
                }
              });
            } catch (pdfError) {
              console.error('Erro ao gerar relatório:', pdfError);
              setTrelloError('Erro ao gerar relatório: ' + pdfError.message);
              setIsLoadingTrello(false);
              toast({ className: 'arkos-toast-error', title: 'Erro ao Gerar Relatório', description: pdfError.message, duration: 10000 });
            }
          });
        } catch (dataError) {
          console.error('Erro ao processar dados:', dataError);
          setTrelloError('Erro ao processar dados: ' + dataError.message);
          setIsLoadingTrello(false);
          toast({ className: 'arkos-toast-error', title: 'Erro ao Processar Dados', description: dataError.message, duration: 10000 });
        }
      });
    } catch (error) {
      console.error('Erro geral no processo do Trello:', error);
      setTrelloError('Erro geral: ' + error.message);
      setIsLoadingTrello(false);
      toast({ className: 'arkos-toast-error', title: 'Erro', description: error.message, duration: 10000 });
    }
  };

  const handleTrelloButtonClick = useCallback(async (trelloForStore) => {
    try {
      setTrelloError(null);
      setCurrentTrelloContext(trelloForStore);
      setIsLoadingTrello(true);
      
      // Usar requestAnimationFrame para garantir que a UI seja atualizada antes de continuar
      requestAnimationFrame(() => {
        // Usar Promise para melhor controle de fluxo assíncrono
        Promise.resolve().then(() => {
          try {
            handleSendToTrello(trelloForStore);
          } catch (error) {
            console.error('Erro ao enviar para Trello:', error);
            setTrelloError('Erro ao processar: ' + error.message);
            setIsLoadingTrello(false);
            toast({ variant: 'destructive', title: 'Erro', description: error.message, duration: 10000 });
          }
        });
      });
    } catch (error) {
      console.error('Erro ao iniciar processo do Trello:', error);
      setTrelloError('Erro ao iniciar processo: ' + error.message);
      setIsLoadingTrello(false);
      toast({ variant: 'destructive', title: 'Erro', description: error.message, duration: 10000 });
    }
  }, [handleSendToTrello, toast]);

  const totalScannedCurrent = scannedPackages.length;
  const halfScannedCurrent = totalScannedCurrent > 0 ? Math.floor(totalScannedCurrent / 2) : '';
  const duplicateCountCurrent = duplicatePackages.length;

  const storesConfig = [
    { id: 'shopfaz', name: 'Shopfaz', trelloContext: 'Shopfaz' },
    { id: 'karbox', name: 'Karbox', trelloContext: 'Karbox' },
    { id: 'shopfazml', name: 'Shopfaz ML', trelloContext: 'Shopfaz Mercado Livre' },
    { id: 'amazon', name: 'Amazon', trelloContext: 'Amazon' },
  ];

  const openGeneralObservationModal = () => {
    setObservationType('general');
    setIsObservationModalOpen(true);
  };

  const appContainerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "circOut" } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: "circIn" } }
  };
  

  return (
    <div className={`min-h-screen bg-background p-3 sm:p-6 md:p-8 flex flex-col items-center text-foreground transition-colors duration-300 font-sans ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Elementos de áudio com controles para depuração e melhor compatibilidade */}
      <audio 
        ref={audioRefs.bip} 
        src="./sounds/bip.mp3" 
        preload="auto" 
        crossOrigin="anonymous" 
        controls={false}
        onError={(e) => {
          console.error('Erro ao carregar áudio bip:', e);
          toast({ className: 'arkos-toast-error', title: 'Erro de Áudio', description: 'Não foi possível carregar o som de confirmação.' });
        }}
      ></audio>
      <audio 
        ref={audioRefs.siren} 
        src="./sounds/siren.mp3" 
        preload="auto" 
        crossOrigin="anonymous" 
        controls={false}
        onError={(e) => {
          console.error('Erro ao carregar áudio siren:', e);
          toast({ className: 'arkos-toast-error', title: 'Erro de Áudio', description: 'Não foi possível carregar o som de alerta.' });
        }}
      ></audio>
      <Toaster />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        users={users}
      />
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => { 
            setIsPasswordModalOpen(false); 
            setPendingDuplicateCodeForObservation(null); 
            setTimeout(() => packageInputRef.current?.focus(), 100);
        }}
        onUnlock={handleUnlockModal}
        expectedPassword={ARKOS_DUPLICATE_PASSWORD}
        title="PACOTE DUPLICADO - CONTACTAR GERÊNCIA"
        message="Este pacote já foi lido. Insira a senha para registrar uma observação."
      />
      <PasswordModal 
        isOpen={isAdminPasswordModalOpen} 
        onClose={() => { 
            setIsAdminPasswordModalOpen(false); 
        }}
        onUnlock={handleUnlockAdminPanel}
        expectedPassword={ADMIN_PANEL_PASSWORD}
        title="ACESSO AO PAINEL ADMINISTRATIVO"
        message="Insira a senha para acessar o painel administrativo."
      />
      <ObservationModal
        isOpen={isObservationModalOpen}
        onClose={() => {
            setIsObservationModalOpen(false);
            setPendingDuplicateCodeForObservation(null); 
            setTimeout(() => packageInputRef.current?.focus(), 100);
        }}
        initialObservation={observationType === 'duplicate' ? observationForDuplicate : observations} 
        onSubmit={handleSaveObservation} 
        title={observationType === 'duplicate' ? `Observação para Pacote Duplicado: ${pendingDuplicateCodeForObservation || ''}` : "Observações Gerais da Coleta"}
        message={observationType === 'duplicate' ? "Descreva o motivo ou ação para este pacote." : "Adicione ou edite observações gerais para o relatório."}
      />
      
      {/* O input de arquivo foi removido pois agora o PDF é gerado diretamente */}
      
      <AnimatePresence mode="wait">
        {isLoggedIn ? (
        <motion.div
          key="arkos_app_container" 
          variants={appContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-4xl arkos-card"
        >
          <AppHeader 
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode} 
            onLogout={handleLogout}
            onAdminPanel={toggleAdminPanel}
            isAdmin={currentUser?.isAdmin}
          />
          <SoundControls isSoundEnabled={isSoundEnabled} onToggleSound={() => setIsSoundEnabled(prev => !prev)} />

          <OperatorManager
            currentOperator={currentOperator}
            operators={operators}
            onSetCurrentOperator={setCurrentOperator}
            onSetOperators={setOperators}
            initialOperatorName={INITIAL_OPERATOR}
          />
          
          <CollectionControls
              storesConfig={storesConfig}
              onStartNewCollectionPeriod={handleStartNewCollectionPeriod}
          />

          <div className="my-6 p-4 bg-primary/5 rounded-lg">
              <h2 className="text-xl font-bold text-center mb-4">
                  Coleta Atual: <span className="arkos-gradient-text">{currentStore} - {currentPeriod}</span>
              </h2>
              <PackageInput 
                  inputValue={inputValue}
                  onInputChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onScanPackage={handleScanPackage}
                  inputRef={packageInputRef}
                  isPasswordModalOpen={isPasswordModalOpen || isLoadingTrello || isObservationModalOpen}
                  onClearCurrentCollection={handleClearCurrentVisualCollection}
              />
              
              {lastScannedPackage && (
                <LastScannedPackage lastPackage={lastScannedPackage} />
              )}
          </div>
          
          {/* Componente de atividades em tempo real */}
          <div className="mb-4 p-4 bg-primary/5 rounded-lg">
            <h2 className="text-lg font-bold mb-2">Atividades em Tempo Real</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <RealtimeActivity />
                <div className="mt-3">
                  <SyncStatus />
                </div>
              </div>
              <div>
                <OnlineUsersMonitor />
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {isLoadingTrello && <LoadingSpinner message="Processando com Trello..." />}
            {trelloError && <ErrorDisplay message={trelloError} />}
          </AnimatePresence>


          <StatsDisplay 
              totalScanned={totalScannedCurrent}
              halfScanned={halfScannedCurrent}
              duplicateCount={duplicateCountCurrent}
              storeName={`${currentStore} - ${currentPeriod}`}
          />
          
          <PackageList 
              scannedPackages={scannedPackages}
              duplicatePackages={duplicatePackages}
              currentCollectionName={`${currentStore} - ${currentPeriod}`}
          />

          <TrelloActions
              storesConfig={storesConfig}
              onTrelloButtonClick={handleTrelloButtonClick}
              isLoadingTrello={isLoadingTrello}
              isPasswordModalOpen={isPasswordModalOpen || isObservationModalOpen}
              onOpenObservationModal={openGeneralObservationModal}
          />

          <ActionButtons 
              onExport={handleExport}
              onPrint={handlePrint}
              showResetAllButton={false} 
          />
          
          <StoreDashboard allCollectionsData={allCollectionsData} storesConfig={storesConfig} />

        </motion.div>
        ) : (
          <motion.div 
            key="login_message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mt-10"
          >
            <h2 className="text-2xl font-bold mb-4">Sistema ARKOS</h2>
            <p className="text-muted-foreground">Faça login para acessar o sistema.</p>
            <Button 
              onClick={() => setIsLoginModalOpen(true)}
              className="mt-4 arkos-button-primary"
            >
              Fazer Login
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-10 sm:mt-16 text-center text-muted-foreground text-xs sm:text-sm">
        <p>&copy; {new Date().getFullYear()} ARKOS. Todos os direitos reservados.</p>
        <p>Otimizando sua logística com precisão.</p>
      </footer>
    </div>
  );
};

export default App;