import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupabase } from '../contexts/SupabaseContext';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarData, setCalendarData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();

  // Gerar dados do calendário para o mês atual
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Carregar dados do calendário do Supabase
  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setIsLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0]);
      
      if (error) {
        console.error('Erro ao carregar dados do calendário:', error);
        return;
      }
      
      const eventsMap = {};
      data?.forEach(event => {
        const key = event.date;
        eventsMap[key] = event;
      });
      
      setCalendarData(eventsMap);
    } catch (error) {
      console.error('Erro ao carregar dados do calendário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar evento no calendário
  const saveCalendarEvent = async (date, type) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const key = dateStr;
      
      const eventData = {
        date: dateStr,
        type: type === 'success' ? 'romaneio_ok' : 'dispatch_failure',
        user_id: 'system',
        user_name: 'Sistema ARKOS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Verificar se já existe um evento para esta data
      const existingEvent = calendarData[key];
      
      if (existingEvent) {
        // Atualizar evento existente
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', existingEvent.id);
        
        if (error) throw error;
      } else {
        // Criar novo evento
        const { error } = await supabase
          .from('calendar_events')
          .insert(eventData);
        
        if (error) throw error;
      }
      
      // Atualizar estado local
      setCalendarData(prev => ({
        ...prev,
        [key]: eventData
      }));
      
    } catch (error) {
      console.error('Erro ao salvar evento do calendário:', error);
    }
  };

  // Remover evento do calendário
  const removeCalendarEvent = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const key = dateStr;
      
      const existingEvent = calendarData[key];
      
      if (existingEvent?.id) {
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', existingEvent.id);
        
        if (error) throw error;
      }
      
      // Atualizar estado local
      setCalendarData(prev => {
        const newData = { ...prev };
        delete newData[key];
        return newData;
      });
      
    } catch (error) {
      console.error('Erro ao remover evento do calendário:', error);
    }
  };

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navegar para o mês seguinte
  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Obter o status de um dia
  const getDayStatus = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const key = dateStr;
    
    return calendarData[key]?.type || null;
  };

  // Verificar se é hoje
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Verificar se é do mês atual
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  // Formatar nome do mês
  const getMonthName = (date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Nomes dos dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendário de Romaneio
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Controles de navegação */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold capitalize">
            {getMonthName(currentDate)}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            disabled={isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Romaneio OK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Falha no Despacho</span>
          </div>
        </div>

        {/* Calendário */}
        <div className="grid grid-cols-7 gap-1">
          {/* Cabeçalho dos dias da semana */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Dias do calendário */}
          {calendarDays.map((date, index) => {
            const status = getDayStatus(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <motion.div
                key={index}
                className={`
                  p-2 text-center text-sm cursor-pointer rounded-lg border transition-all duration-200
                  ${isCurrentMonthDay ? 'hover:bg-accent hover:text-accent-foreground' : 'text-muted-foreground/50'}
                  ${isTodayDate ? 'ring-2 ring-primary' : ''}
                  ${status === 'success' ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' : ''}
                  ${status === 'failure' ? 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300' : ''}
                `}
                onClick={() => setSelectedDate(date)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{date.getDate()}</span>
                  {status === 'success' && <CheckCircle className="h-3 w-3" />}
                  {status === 'failure' && <XCircle className="h-3 w-3" />}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal de seleção de status */}
        {selectedDate && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              className="bg-card p-6 rounded-lg shadow-lg border max-w-sm w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {selectedDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    saveCalendarEvent(selectedDate, 'success');
                    setSelectedDate(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Romaneio OK
                </Button>
                
                <Button
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => {
                    saveCalendarEvent(selectedDate, 'failure');
                    setSelectedDate(null);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Falha no Despacho
                </Button>
                
                {getDayStatus(selectedDate) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      removeCalendarEvent(selectedDate);
                      setSelectedDate(null);
                    }}
                  >
                    Remover Marcação
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setSelectedDate(null)}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Estatísticas do mês */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Dias OK</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Object.values(calendarData).filter(event => event.type === 'success').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Dias com Falha</p>
                  <p className="text-2xl font-bold text-red-600">
                    {Object.values(calendarData).filter(event => event.type === 'failure').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calendar; 