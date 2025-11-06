import React, { useEffect, useRef, useState } from 'react';
import { retrieveLaunchParams, initMiniApp, initThemeParams, initViewport } from '@telegram-apps/sdk';
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

  useEffect(() => {
    // Initialize Telegram Mini App
    const initTelegram = async () => {
      try {
        const launchParams = retrieveLaunchParams();
        
        // Initialize and mount components
        const [miniApp, themeParams, viewport] = await Promise.all([
          initMiniApp(),
          initThemeParams(),
          initViewport()
        ]);
        
        // Expand viewport to fullscreen
        if (viewport.mount.isAvailable()) {
          viewport.mount();
          viewport.expand();
        }

        // Set up theme
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

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing Telegram Mini App:', error);
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  useEffect(() => {
    if (!isLoading && gameContainerRef.current && !gameInstanceRef.current) {
      // Initialize Phaser game
      gameInstanceRef.current = new Game(gameContainerRef.current);
      
      // Wait for game to initialize
      setTimeout(() => {
        setIsGameReady(true);
      }, 1000);
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
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
          gameInstanceRef.current.resize(rect.width, rect.height);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GameStateProvider user={telegramUser}>
      <div className="app">
        <div 
          ref={gameContainerRef} 
          className="game-container"
          style={{
            width: '100%',
            height: '100vh',
            backgroundColor: 'var(--tg-theme-bg-color, #2c3e50)',
            overflow: 'hidden'
          }}
        />
        {!isGameReady && (
          <div className="game-loading">
            <div className="loading-spinner"></div>
            <p>Loading game...</p>
          </div>
        )}
      </div>
    </GameStateProvider>
  );
}

export default App;