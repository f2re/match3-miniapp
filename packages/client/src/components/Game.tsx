import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../game/scenes/GameScene';
import { LevelConfig, TileType } from '../types/game';

interface GameProps {
  onScoreUpdate?: (score: number) => void;
  onLevelComplete?: (level: number, score: number) => void;
  onGameOver?: (finalScore: number) => void;
}

/**
 * React component that wraps the Phaser Match-3 game
 */
export const Game: React.FC<GameProps> = ({ 
  onScoreUpdate, 
  onLevelComplete, 
  onGameOver 
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    if (!gameRef.current) return;

    // Game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 600,
      height: 800,
      parent: gameRef.current,
      backgroundColor: '#2c3e50',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
          width: 300,
          height: 400
        },
        max: {
          width: 800,
          height: 1200
        }
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [GameScene],
      audio: {
        disableWebAudio: false
      },
      input: {
        touch: true,
        mouse: true
      }
    };

    // Create Phaser game instance
    phaserGameRef.current = new Phaser.Game(config);

    // Set up event listeners for game events
    setupGameEventListeners();

    // Start first level
    const levelConfig = getLevelConfig(currentLevel);
    phaserGameRef.current.scene.start('GameScene', { levelConfig });

    setIsLoading(false);

    // Cleanup function
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  const setupGameEventListeners = () => {
    if (!phaserGameRef.current) return;

    const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene;
    
    if (gameScene) {
      // Listen for custom game events
      gameScene.events.on('scoreUpdated', (score: number) => {
        onScoreUpdate?.(score);
      });

      gameScene.events.on('levelComplete', (data: { level: number; score: number }) => {
        setCurrentLevel(data.level + 1);
        onLevelComplete?.(data.level, data.score);
      });

      gameScene.events.on('gameOver', (data: { finalScore: number }) => {
        onGameOver?.(data.finalScore);
      });
    }
  };

  const getLevelConfig = (level: number): LevelConfig => {
    // Progressive difficulty
    const baseConfig: LevelConfig = {
      level,
      targetScore: 500 + (level - 1) * 300,
      maxMoves: Math.max(15, 25 - level),
      gridWidth: 8,
      gridHeight: 8,
      tileTypes: [TileType.RED, TileType.BLUE, TileType.GREEN, TileType.YELLOW]
    };

    // Add more tile types as levels progress
    if (level >= 3) {
      baseConfig.tileTypes.push(TileType.PURPLE);
    }
    if (level >= 5) {
      baseConfig.tileTypes.push(TileType.ORANGE);
    }

    // Special level configurations
    if (level >= 10) {
      baseConfig.gridWidth = 9;
      baseConfig.gridHeight = 9;
    }

    return baseConfig;
  };

  const restartGame = () => {
    if (phaserGameRef.current) {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        setCurrentLevel(1);
        const levelConfig = getLevelConfig(1);
        gameScene.scene.restart({ levelConfig });
      }
    }
  };

  const pauseGame = () => {
    if (phaserGameRef.current) {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        gameScene.scene.pause();
      }
    }
  };

  const resumeGame = () => {
    if (phaserGameRef.current) {
      const gameScene = phaserGameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        gameScene.scene.resume();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="game-loading">
        <div className="loading-spinner"></div>
        <p>Loading Match-3 Game...</p>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div 
        ref={gameRef} 
        className="phaser-game"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      />
      
      {/* Game controls overlay */}
      <div className="game-controls">
        <button 
          className="control-button restart-button" 
          onClick={restartGame}
          title="Restart Game"
        >
          🔄
        </button>
        <button 
          className="control-button pause-button" 
          onClick={pauseGame}
          title="Pause Game"
        >
          ⏸️
        </button>
        <button 
          className="control-button resume-button" 
          onClick={resumeGame}
          title="Resume Game"
        >
          ▶️
        </button>
      </div>
    </div>
  );
};

export default Game;
