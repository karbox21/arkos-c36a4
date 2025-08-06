
import React from 'react';
import { Button } from './ui/button';
import { Moon, Sun, LogOut, Shield } from 'lucide-react';

const AppHeader = ({ isDarkMode, setIsDarkMode, onLogout, onAdminPanel, isAdmin }) => {
  return (
    <header className="mb-6 sm:mb-8 text-center relative">
      <div className="flex justify-between items-center">
        <div className="w-12"></div> {/* Espaçador para centralizar o título */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-2">
            <img 
              src="/images/arkos_logo.svg" 
              alt="ARKOS Logo" 
              className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20"
            />
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter arkos-title-gradient animate-pulse-slow">
              ARKOS
            </h1>
          </div>
          <div className="h-1 w-32 sm:w-48 md:w-64 bg-gradient-to-r from-primary via-accent to-primary-foreground rounded-full mt-1"></div>
        </div>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(prev => !prev)}
            className="text-muted-foreground hover:text-primary h-10 w-10 sm:h-12 sm:w-12"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} className="sm:w-6 sm:h-6"/> : <Moon size={20} className="sm:w-6 sm:h-6"/>}
          </Button>
          {onAdminPanel && isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onAdminPanel}
              className="text-muted-foreground hover:text-amber-500 h-10 w-10 sm:h-12 sm:w-12"
              aria-label="Painel Administrativo"
            >
              <Shield size={20} className="sm:w-6 sm:h-6"/>
            </Button>
          )}
          {onLogout && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive h-10 w-10 sm:h-12 sm:w-12"
              aria-label="Logout"
            >
              <LogOut size={20} className="sm:w-6 sm:h-6"/>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
