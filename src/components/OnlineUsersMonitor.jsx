import React, { useEffect, useState, useRef } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, User, Users, RefreshCw, Globe, Wifi, WifiOff } from 'lucide-react';
import { useToast } from './ui/use-toast.jsx';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { firestore } from '../lib/supabase';

const OnlineUsersMonitor = () => {
  const { onlineUsers, lastActivities, supabase } = useSupabase();
  const [localTime, setLocalTime] = useState(new Date());
  const [presenceState, setPresenceState] = useState({});
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const { toast } = useToast();
  const presenceChannelRef = useRef(null);

  // Update local time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Set up presence channel to monitor online users in real-time
  useEffect(() => {
    // Check internet connection
    const handleOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setIsConnected(isOnline);
      
      if (isOnline) {
        toast({
          title: "Connection restored",
          description: "You are connected again. Data will be synchronized automatically.",
          variant: "default"
        });
        setLastSync(new Date());
      } else {
        toast({
          title: "No connection",
          description: "You are offline. Some features may not be available.",
          variant: "destructive"
        });
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Set up presence channel
    const setupPresenceChannel = async () => {
      try {
        // Check if supabase is available
        if (!supabase || !supabase.channel) {
          console.error('Supabase is not available or not properly initialized');
          return;
        }
        
        if (!presenceChannelRef.current) {
          const channel = supabase.channel('online-users-presence', {
            config: {
              presence: {
                key: (() => {
                  try {
                    const currentUserData = localStorage.getItem('arkosCurrentUser');
                    if (currentUserData) {
                      const parsedUser = JSON.parse(currentUserData);
                      return parsedUser && parsedUser.id ? parsedUser.id : 'anonymous-' + Math.random().toString(36).substring(2, 9);
                    }
                    return 'anonymous-' + Math.random().toString(36).substring(2, 9);
                  } catch (error) {
                    console.error('Error processing user ID:', error);
                    return 'anonymous-' + Math.random().toString(36).substring(2, 9);
                  }
                })()
              },
            },
          });
          
          // Monitor presence changes
          channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            setPresenceState(state);
            setLastSync(new Date());
            console.log('Presence synchronized:', state);
          });
          
          channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('User joined:', newPresences);
            toast({
              title: "New user online",
              description: `${newPresences[0]?.user_name || 'Someone'} just entered the system.`,
              variant: "default"
            });
          });
          
          channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('User left:', leftPresences);
          });
          
          try {
            await channel.subscribe(async (status) => {
              if (status === 'SUBSCRIBED') {
                let user;
                try {
                  const currentUserData = localStorage.getItem('arkosCurrentUser');
                  if (currentUserData) {
                    user = JSON.parse(currentUserData);
                    if (!user || !user.id) {
                      user = { name: 'Anonymous User', id: 'anonymous-' + Math.random().toString(36).substring(2, 9) };
                    }
                  } else {
                    user = { name: 'Anonymous User', id: 'anonymous-' + Math.random().toString(36).substring(2, 9) };
                  }
                } catch (error) {
                  console.error('Error processing user data:', error);
                  user = { name: 'Anonymous User', id: 'anonymous-' + Math.random().toString(36).substring(2, 9) };
                }
                
                // Update online status
                try {
                  if (channel && channel.track) {
                    await channel.track({
                      user_id: user.id,
                      user_name: user.name,
                      online_at: new Date().toISOString(),
                      user_agent: navigator.userAgent,
                      // Remove the attempt to get IP which might fail
                      ip_address: 'local'
                    });
                  } else {
                    console.error('Channel does not have track method');
                  }
                } catch (error) {
                  console.error('Error tracking presence:', error);
                }
              }
            });
          } catch (error) {
            console.error('Error subscribing to channel:', error);
          }
          
          presenceChannelRef.current = channel;
        }
      } catch (error) {
        console.error('Error setting up presence channel:', error);
      }
    };
    
    setupPresenceChannel();
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      
      // Clean up presence channel
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe();
        presenceChannelRef.current = null;
      }
    };
  }, [toast, supabase]);

  // Format relative time (how long ago)
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = localTime;
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Filter online users (active in the last 5 minutes)
  const getOnlineUsers = () => {
    // Combine database users with presence channel users
    const dbUsers = Object.values(onlineUsers || {}).filter(user => user.online);
    
    // Add presence channel users that are not in the database
    const presenceUsers = [];
    Object.entries(presenceState).forEach(([key, presences]) => {
      presences.forEach(presence => {
        // Check if the user is already in the database users list
        const existingUser = dbUsers.find(u => u.id === presence.user_id);
        if (!existingUser) {
          presenceUsers.push({
            id: presence.user_id,
            displayName: presence.user_name || 'Anonymous User',
            lastActive: presence.online_at || new Date().toISOString(),
            isPresenceOnly: true,
            user_agent: presence.user_agent,
            ip_address: presence.ip_address,
            online: true
          });
        }
      });
    });
    
    // Combine and sort by activity time
    return [...dbUsers, ...presenceUsers].sort((a, b) => {
      return new Date(b.lastActive) - new Date(a.lastActive);
    });
  };
  
  // Function to force manual synchronization
  const forceSync = async () => {
    setLastSync(new Date());
    toast({
      title: "Synchronizing",
      description: "Updating online user information...",
    });
    
    // Resubscribe to presence channel
    if (presenceChannelRef.current) {
      await presenceChannelRef.current.unsubscribe();
      presenceChannelRef.current = null;
      
      // Configure channel again
      const channel = supabase.channel('online-users-presence', {
        config: {
          presence: {
            key: (() => {
              try {
                const currentUserData = localStorage.getItem('arkosCurrentUser');
                if (currentUserData) {
                  const parsedUser = JSON.parse(currentUserData);
                  return parsedUser && parsedUser.id ? parsedUser.id : 'anonymous-' + Math.random().toString(36).substring(2, 9);
                }
                return 'anonymous-' + Math.random().toString(36).substring(2, 9);
              } catch (error) {
                console.error('Error processing user ID:', error);
                return 'anonymous-' + Math.random().toString(36).substring(2, 9);
              }
            })()
          },
        },
      });
      
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresenceState(state);
        setLastSync(new Date());
      });
      
      await channel.subscribe();
      presenceChannelRef.current = channel;
      
      // Update online status
      let user;
      try {
        const currentUserData = localStorage.getItem('arkosCurrentUser');
        if (currentUserData) {
          user = JSON.parse(currentUserData);
          if (!user || !user.id) {
            user = { name: 'Anonymous User', id: 'anonymous-' + Math.random().toString(36).substring(2, 9) };
          }
        } else {
          user = { name: 'Anonymous User', id: 'anonymous-' + Math.random().toString(36).substring(2, 9) };
        }
      } catch (error) {
        console.error('Error processing user data:', error);
        user = { name: 'Anonymous User', id: 'anonymous-' + Math.random().toString(36).substring(2, 9) };
      }
      
      try {
                await channel.track({
                  user_id: user.id,
                  user_name: user.name,
                  online_at: new Date().toISOString(),
                  user_agent: navigator.userAgent,
                  ip_address: 'local'
                });
              } catch (error) {
                console.error('Error tracking presence:', error);
              }
      
      toast({
        title: "Synchronized",
        description: "Online user information updated successfully!",
        variant: "success"
      });
    }
  };

  // Get list of online users
  const onlineUsersList = getOnlineUsers();

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Real-Time Monitoring
            <Badge variant={isConnected ? "success" : "destructive"} className="ml-2">
              {isConnected ? (
                <span className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" /> Disconnected
                </span>
              )}
            </Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={forceSync} 
            title="Synchronize now"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          <div className="flex items-center justify-between">
            <span>{onlineUsersList.length} users online now</span>
            <span className="text-xs text-muted-foreground">
              <Clock className="mr-1 inline h-3 w-3" />
              Last sync: {getRelativeTime(lastSync)}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Online Users */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              Online Users
            </h3>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {onlineUsersList.length > 0 ? (
                  onlineUsersList.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={`${user.isPresenceOnly ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-primary/5 border-primary/20'}`}>
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                              {user.displayName || user.email || 'User'}
                              {user.isPresenceOnly && (
                                <Globe className="ml-1 h-2 w-2" />
                              )}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Active since: {new Date(user.lastActive).toLocaleTimeString()}</span>
                            {user.user_agent && (
                              <span className="text-xs block">Device: {user.user_agent.split(' ').slice(0, 3).join(' ')}...</span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No users online</span>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Recent Activities
            </h3>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <AnimatePresence>
                {lastActivities && lastActivities.length > 0 ? (
                  lastActivities.slice(0, 10).map((activity, index) => (
                    <motion.div
                      key={activity.id || index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-2 p-2 rounded-md ${index === 0 ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-sm">{activity.userEmail?.split('@')[0] || 'User'}</span>
                          <span className="text-sm"> {activity.message}</span>
                          {activity.packageCode && (
                            <span className="text-xs block text-muted-foreground">
                              Package: {activity.packageCode}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(activity.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No recent activity</span>
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <span className="text-xs text-muted-foreground w-full text-center">
          Real-time sharing active. Other users can see your online presence.
        </span>
      </CardFooter>
    </Card>
  );
};

export default OnlineUsersMonitor;