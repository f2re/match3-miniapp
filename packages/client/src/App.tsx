import React, { useEffect, useRef, useState } from 'react';
import { retrieveLaunchParams, miniApp, themeParams, viewport } from '@telegram-apps/sdk';
import { Game } from './game/Game';
import { GameStateProvider } from './components/GameStateProvider';
import { LoadingScreen } from './components/LoadingScreen';
import './App.css';

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameReady, setIsGameReady] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  useEffect(() => {
    // Initialize Telegram Mini App with fallback for standalone usage
    const initTelegram = async () => {
      try {
        // Check if we're running inside Telegram
        const isTg = window.Telegram?.WebApp?.initData;
        setIsTelegramApp(!!isTg);
        
        if (isTg) {
          // We're inside Telegram - initialize SDK
          const launchParams = retrieveLaunchParams();
          
          // Expand viewport to fullscreen
          if (viewport.mount.isAvailable()) {
            viewport.mount();
            viewport.expand();
          }

          // Set up theme using Telegram colors
          if (themeParams.mount.isAvailable()) {
            themeParams.mount();
            document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.backgroundColor());
            document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.textColor());
            document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hintColor());
            document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.linkColor());
            document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.buttonColor());
            document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.buttonTextColor());
          }

          // Initialize Mini App
          if (miniApp.mount.isAvailable()) {
            miniApp.mount();
            miniApp.ready();
          }

          // Get user data
          if (launchParams.initData?.user) {
            setTelegramUser(launchParams.initData.user);
          }
        } else {
          // Standalone mode - set up default theme
          console.info('Running in standalone mode (outside Telegram)');
          document.documentElement.style.setProperty('--tg-theme-bg-color', '#2c3e50');
          document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
          document.documentElement.style.setProperty('--tg-theme-hint-color', 'rgba(255, 255, 255, 0.7)');
          document.documentElement.style.setProperty('--tg-theme-link-color', '#4fc3f7');
          document.documentElement.style.setProperty('--tg-theme-button-color', '#9c27b0');
          document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
          document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#34495e');
          
          // Set mock user for standalone testing
          setTelegramUser({
            id: 12345,
            username: 'demo_user',
            first_name: 'Demo',
            last_name: 'User'
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.warn('Telegram SDK initialization failed, running in standalone mode:', error);
        
        // Fallback to standalone mode
        setIsTelegramApp(false);
        document.documentElement.style.setProperty('--tg-theme-bg-color', '#2c3e50');
        document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-hint-color', 'rgba(255, 255, 255, 0.7)');
        document.documentElement.style.setProperty('--tg-theme-link-color', '#4fc3f7');
        document.documentElement.style.setProperty('--tg-theme-button-color', '#9c27b0');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#34495e');
        
        setTelegramUser({
          id: 12345,
          username: 'demo_user',
          first_name: 'Demo',
          last_name: 'User'
        });
        
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  useEffect(() => {
    if (!isLoading && gameContainerRef.current && !gameInstanceRef.current) {
      // Initialize Phaser game with user interaction requirement for audio
      try {
        gameInstanceRef.current = new Game(gameContainerRef.current);
        
        // Wait for game to initialize
        setTimeout(() => {
          setIsGameReady(true);
        }, 1000);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        // Still set game as ready to show error state
        setIsGameReady(true);
      }
    }

    return () => {
      if (gameInstanceRef.current) {
        try {
          gameInstanceRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying game:', error);
        }
        gameInstanceRef.current = null;
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const handleResize = () => {
      if (gameInstanceRef.current) {
        const container = gameContainerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          try {
            gameInstanceRef.current.resize(rect.width, rect.height);
          } catch (error) {
            console.warn('Error resizing game:', error);
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!gameInstanceRef.current) return;
      
      try {
        if (document.hidden) {
          // Pause game when tab becomes hidden
          gameInstanceRef.current.pause();
        } else {
          // Resume game when tab becomes visible
          gameInstanceRef.current.resume();
        }
      } catch (error) {
        console.warn('Error handling visibility change:', error);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GameStateProvider user={telegramUser}>
      <div className="app">
        {/* Game mode indicator for development */}
        {!isTelegramApp && (
          <div className="dev-mode-indicator">
            <span>📱 Standalone Mode</span>
          </div>
        )}
        
        <div 
          ref={gameContainerRef} 
          className="game-container"
          style={{
            width: '100%',
            height: '100vh',
            backgroundColor: 'var(--tg-theme-bg-color, #2c3e50)',
            overflow: 'hidden',
            position: 'relative'
          }}
        />
        
        {!isGameReady && (
          <div className="game-loading">
            <div className="loading-spinner"></div>
            <p>Initializing game engine...</p>
          </div>
        )}
        
        {/* Audio context activation button for mobile browsers */}
        <button 
          className="audio-init-btn"
          onClick={() => {
            // Trigger audio context activation
            if (gameInstanceRef.current) {
              try {
                gameInstanceRef.current.activateAudio();
              } catch (error) {
                console.warn('Audio activation failed:', error);
              }
            }
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 15px',
            backgroundColor: 'var(--tg-theme-button-color, #9c27b0)',
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            border: 'none',
            borderRadius: '20px',
            fontSize: '12px',
            cursor: 'pointer',
            zIndex: 1000,
            opacity: 0.7,
            transition: 'opacity 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          🔊
        </button>
      </div>
    </GameStateProvider>
  );
}

export default App;