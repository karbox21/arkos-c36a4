import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Activity, Wifi, WifiOff, Clock, User, Package, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase } from '../contexts/SupabaseContext';
import { collection, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { firestore } from '../lib/supabase';

const RealtimeMonitor = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    isOnline: true,
    lastSync: new Date(),
    totalUsers: 0,
    activeSessions: 0
  });
  const { supabase } = useFirebase();

  useEffect(() => {
    // Monitorar usuários online em tempo real
    const qOnline = query(collection(firestore, 'online_users'), where('online', '==', true), orderBy('last_active', 'desc'));
    const unsubscribeOnline = onSnapshot(qOnline, (snapshot) => {
      setOnlineUsers(snapshot.docs.map(doc => doc.data()));
    });

    // Monitorar atividades em tempo real
    const qActivities = query(collection(firestore, 'activities'), orderBy('timestamp', 'desc'));
    const unsubscribeActivities = onSnapshot(qActivities, (snapshot) => {
      setRecentActivities(snapshot.docs.map(doc => doc.data()).slice(0, 10));
    });

    // Atualizar status do sistema a cada 30 segundos
    const statusInterval = setInterval(() => {
      updateSystemStatus();
    }, 30000);

    return () => {
      unsubscribeOnline();
      unsubscribeActivities();
      clearInterval(statusInterval);
    };
  }, []);

  const updateOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('online_users')
        .select('*')
        .eq('online', true)
        .order('last_active', { ascending: false });

      if (error) throw error;
      setOnlineUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários online:', error);
    }
  };

  const updateRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentActivities(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const updateSystemStatus = async () => {
    try {
      // Contar usuários online
      const qOnline = query(collection(firestore, 'online_users'), where('online', '==', true));
      const onlineSnapshot = await getDocs(qOnline);
      // Contar atividades nas últimas 24h
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const qActivities = query(collection(firestore, 'activities'), where('timestamp', '>=', since));
      const activitiesSnapshot = await getDocs(qActivities);
      setSystemStatus({
        isOnline: navigator.onLine,
        lastSync: new Date(),
        totalUsers: onlineSnapshot.size,
        activeSessions: activitiesSnapshot.size,
      });
    } catch (error) {
      console.error('Erro ao atualizar status do sistema:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'scan': return <Package className="h-4 w-4" />;
      case 'duplicate': return <AlertTriangle className="h-4 w-4" />;
      case 'login': return <User className="h-4 w-4" />;
      case 'logout': return <User className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'scan': return 'text-green-600';
      case 'duplicate': return 'text-red-600';
      case 'login': return 'text-blue-600';
      case 'logout': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Agora';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      {/* Status do Sistema */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {systemStatus.isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Usuários Online</p>
                <p className="text-2xl font-bold text-blue-600">{onlineUsers.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Atividades Hoje</p>
                <p className="text-2xl font-bold text-green-600">{systemStatus.activeSessions}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Última sincronização:</span>
              <span className="font-mono">{systemStatus.lastSync.toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuários Online */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-500" />
            Usuários Online ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {onlineUsers.length > 0 ? (
              <div className="space-y-2">
                {onlineUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{user.display_name || user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(user.last_active)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário online</p>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Atividades Recentes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-green-500" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {recentActivities.length > 0 ? (
              <div className="space-y-2">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg"
                  >
                    <div className={`${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user_name || activity.user_id}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(activity.timestamp)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Indicadores de Status */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${systemStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {systemStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-sm font-medium">Sincronizando</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealtimeMonitor; 