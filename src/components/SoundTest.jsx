import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Volume2, Play, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SoundTest = ({ isSoundEnabled, onToggleSound }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState({});
  const audioRefs = {
    bip: useRef(null),
    siren: useRef(null),
  };

  const testSound = async (type) => {
    if (!isSoundEnabled) {
      alert('Ative o som primeiro para testar!');
      return;
    }

    setIsTesting(true);
    setTestResults(prev => ({ ...prev, [type]: 'testing' }));

    try {
      // Estratégia 1: Usar referência de áudio existente
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
          
          setTestResults(prev => ({ ...prev, [type]: 'success' }));
          return;
        } catch (error) {
          console.warn(`Estratégia 1 falhou para som ${type}:`, error);
        }
      }
      
      // Estratégia 2: Criar novo elemento de áudio
      try {
        const cacheBuster = `?t=${new Date().getTime()}`;
        const newAudio = new Audio(`./sounds/${type}.mp3${cacheBuster}`);
        newAudio.volume = 1.0;
        newAudio.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          newAudio.oncanplaythrough = resolve;
          newAudio.onerror = reject;
          newAudio.load();
          setTimeout(resolve, 1000);
        });
        
        await newAudio.play();
        setTestResults(prev => ({ ...prev, [type]: 'success' }));
        return;
      } catch (error) {
        console.warn(`Estratégia 2 falhou para som ${type}:`, error);
      }
      
      // Estratégia 3: AudioContext API
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioContext = new AudioContext();
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 5.0;
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
          
          setTestResults(prev => ({ ...prev, [type]: 'success' }));
          return;
        }
      } catch (error) {
        console.warn(`Estratégia 3 falhou para som ${type}:`, error);
      }
      
      setTestResults(prev => ({ ...prev, [type]: 'error' }));
    } catch (error) {
      console.error(`Erro ao testar som ${type}:`, error);
      setTestResults(prev => ({ ...prev, [type]: 'error' }));
    } finally {
      setIsTesting(false);
    }
  };

  const getTestResultIcon = (type) => {
    const result = testResults[type];
    if (result === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (result === 'error') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTestResultText = (type) => {
    const result = testResults[type];
    if (result === 'success') {
      return 'Funcionando';
    } else if (result === 'error') {
      return 'Falhou';
    } else if (result === 'testing') {
      return 'Testando...';
    }
    return 'Não testado';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Teste de Som
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controle de som */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <span className="text-sm font-medium">Status do Som</span>
            <Button
              variant={isSoundEnabled ? "default" : "outline"}
              size="sm"
              onClick={onToggleSound}
              className={isSoundEnabled ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {isSoundEnabled ? "Ativado" : "Desativado"}
            </Button>
          </div>

          {/* Testes de som */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Som de Confirmação (Bip)</h4>
                {getTestResultIcon('bip')}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Som reproduzido quando um pacote é escaneado com sucesso
              </p>
              <Button
                onClick={() => testSound('bip')}
                disabled={!isSoundEnabled || isTesting}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Testar Bip
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {getTestResultText('bip')}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Som de Alerta (Sirene)</h4>
                {getTestResultIcon('siren')}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Som reproduzido quando um pacote duplicado é detectado
              </p>
              <Button
                onClick={() => testSound('siren')}
                disabled={!isSoundEnabled || isTesting}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                <Play className="h-4 w-4 mr-2" />
                Testar Sirene
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {getTestResultText('siren')}
              </p>
            </div>
          </div>

          {/* Informações de troubleshooting */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Dicas para Resolver Problemas de Som
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Verifique se o som do navegador está ativado</li>
              <li>• Certifique-se de que o sistema não está em modo silencioso</li>
              <li>• Tente atualizar a página se os sons não funcionarem</li>
              <li>• Verifique se há bloqueadores de pop-up ativos</li>
            </ul>
          </div>
        </div>

        {/* Elementos de áudio ocultos */}
        <audio 
          ref={audioRefs.bip} 
          src="./sounds/bip.mp3" 
          preload="auto" 
          crossOrigin="anonymous" 
          controls={false}
        />
        <audio 
          ref={audioRefs.siren} 
          src="./sounds/siren.mp3" 
          preload="auto" 
          crossOrigin="anonymous" 
          controls={false}
        />
      </CardContent>
    </Card>
  );
};

export default SoundTest; 