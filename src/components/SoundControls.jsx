import React from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const SoundControls = ({ isSoundEnabled, onToggleSound }) => {
  return (
    <div className="flex justify-center my-4">
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          variant={isSoundEnabled ? "default" : "outline"}
          onClick={onToggleSound}
          className={`relative overflow-hidden group px-6 py-3 rounded-full transition-all duration-300 ${isSoundEnabled ? "bg-gradient-to-r from-primary to-accent" : "border-2 border-muted-foreground/30"}`}
          aria-label={isSoundEnabled ? "Desativar Som" : "Ativar Som"}
        >
          <div className="flex items-center justify-center relative z-10">
            {isSoundEnabled ? (
              <>
                <Volume2 className="mr-2 h-5 w-5" />
                <span className="font-medium">Som Ativado</span>
                <motion.div 
                  className="absolute -right-1 -top-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2
                  }}
                >
                  <Music className="h-3 w-3 text-white/70" />
                </motion.div>
              </>
            ) : (
              <>
                <VolumeX className="mr-2 h-5 w-5" />
                <span className="font-medium">Som Desativado</span>
              </>
            )}
          </div>
          {isSoundEnabled && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear"
              }}
            />
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default SoundControls;