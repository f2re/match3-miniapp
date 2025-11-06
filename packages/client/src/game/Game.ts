import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

/**
 * Main Game class that manages the Phaser game instance
 * Handles game lifecycle, responsive scaling, and cross-scene communication
 */
export class Game {
  private phaserGame: Phaser.Game | null = null;
  private gameContainer: HTMLElement | null = null;
  private isInitialized = false;
  private isPaused = false;

  constructor(container: HTMLElement) {
    this.gameContainer = container;
    this.initGame();
  }

  private initGame(): void {
    try {
      // Get container dimensions for responsive design
      const containerRect = this.gameContainer!.getBoundingClientRect();
      const width = Math.max(320, containerRect.width || 400);
      const height = Math.max(480, containerRect.height || 600);

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width,
        height,
        parent: this.gameContainer!,
        backgroundColor: '#2c3e50',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: [
          BootScene,
          MainMenuScene,
          GameScene,
          UIScene
        ],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width,
          height,
          min: {
            width: 320,
            height: 480
          },
          max: {
            width: 800,
            height: 1200
          }
        },
        render: {
          pixelArt: false,
          antialias: true,
          clearBeforeRender: true
        },
        audio: {
          // Disable WebAudio to prevent AudioContext errors
          disableWebAudio: true,
          noAudio: false
        },
        input: {
          // Better touch handling for mobile
          activePointers: 1,
          smoothFactor: 0.2
        },
        dom: {
          createContainer: false
        }
      };

      this.phaserGame = new Phaser.Game(config);
      
      // Set up game event listeners
      this.setupGameEventListeners();
      
      this.isInitialized = true;
      
      console.log('🎮 Game initialized successfully', {
        width,
        height,
        container: this.gameContainer
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize game:', error);
      this.handleInitializationError(error);
    }
  }

  private setupGameEventListeners(): void {
    if (!this.phaserGame) return;

    // Handle game ready event
    this.phaserGame.events.on('ready', () => {
      console.log('🎯 Game is ready');
      this.onGameReady();
    });

    // Handle visibility change
    this.phaserGame.events.on('hidden', () => {
      console.log('👀 Game hidden - auto pausing');
      this.pause();
    });

    this.phaserGame.events.on('visible', () => {
      console.log('👀 Game visible - auto resuming');
      this.resume();
    });

    // Handle focus changes
    this.phaserGame.events.on('blur', () => {
      this.pause();
    });

    this.phaserGame.events.on('focus', () => {
      this.resume();
    });
  }

  private onGameReady(): void {
    // Game is fully loaded and ready to play
    // You can emit custom events here if needed
    if (this.gameContainer) {
      this.gameContainer.classList.add('game-ready');
    }
  }

  private handleInitializationError(error: any): void {
    console.error('Game initialization failed:', error);
    
    // Create error display
    if (this.gameContainer) {
      this.gameContainer.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">🚫</div>
          <h2 style="margin: 0 0 10px 0;">Game Loading Failed</h2>
          <p style="margin: 0 0 20px 0; opacity: 0.8;">Unable to initialize the game engine</p>
          <button onclick="window.location.reload()" style="
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
          " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
            🔄 Retry
          </button>
        </div>
      `;
    }
  }

  public destroy(): void {
    try {
      console.log('🗑️ Destroying game instance');
      
      if (this.phaserGame) {
        // Remove event listeners
        this.phaserGame.events.removeAllListeners();
        
        // Destroy the game
        this.phaserGame.destroy(true, false);
        this.phaserGame = null;
      }
      
      this.isInitialized = false;
      this.isPaused = false;
      
      // Clean up container
      if (this.gameContainer) {
        this.gameContainer.classList.remove('game-ready');
      }
      
    } catch (error) {
      console.warn('⚠️ Error during game destruction:', error);
    }
  }

  public resize(width: number, height: number): void {
    try {
      if (this.phaserGame && this.isInitialized) {
        // Ensure minimum dimensions
        const finalWidth = Math.max(320, width);
        const finalHeight = Math.max(480, height);
        
        this.phaserGame.scale.resize(finalWidth, finalHeight);
        
        console.log('📏 Game resized:', { width: finalWidth, height: finalHeight });
      }
    } catch (error) {
      console.warn('⚠️ Error during resize:', error);
    }
  }

  public pause(): void {
    try {
      if (this.phaserGame && this.isInitialized && !this.isPaused) {
        // Get all active scenes and pause them
        const sceneManager = this.phaserGame.scene;
        const activeScenes = sceneManager.getScenes(true);
        
        activeScenes.forEach(scene => {
          if (scene.scene.isActive()) {
            try {
              scene.scene.pause();
            } catch (error) {
              console.warn(`⚠️ Could not pause scene ${scene.scene.key}:`, error);
            }
          }
        });
        
        this.isPaused = true;
        console.log('⏸️ Game paused');
      }
    } catch (error) {
      console.warn('⚠️ Error during pause:', error);
    }
  }

  public resume(): void {
    try {
      if (this.phaserGame && this.isInitialized && this.isPaused) {
        // Get all paused scenes and resume them
        const sceneManager = this.phaserGame.scene;
        const pausedScenes = sceneManager.getScenes(false).filter(scene => scene.scene.isPaused());
        
        pausedScenes.forEach(scene => {
          try {
            scene.scene.resume();
          } catch (error) {
            console.warn(`⚠️ Could not resume scene ${scene.scene.key}:`, error);
          }
        });
        
        this.isPaused = false;
        console.log('▶️ Game resumed');
      }
    } catch (error) {
      console.warn('⚠️ Error during resume:', error);
    }
  }

  public activateAudio(): void {
    try {
      // Activate audio in the GameScene if it exists
      if (this.phaserGame && this.isInitialized) {
        const gameScene = this.phaserGame.scene.getScene('GameScene') as GameScene;
        if (gameScene && typeof gameScene.activateAudio === 'function') {
          gameScene.activateAudio();
          console.log('🔊 Audio activated');
        }
      }
    } catch (error) {
      console.warn('⚠️ Error activating audio:', error);
    }
  }

  public getPhaserGame(): Phaser.Game | null {
    return this.phaserGame;
  }

  public getGameContainer(): HTMLElement | null {
    return this.gameContainer;
  }

  public isGameInitialized(): boolean {
    return this.isInitialized && this.phaserGame !== null;
  }

  public isGamePaused(): boolean {
    return this.isPaused;
  }

  /**
   * Switch to a specific scene
   */
  public switchToScene(sceneKey: string, data?: any): void {
    try {
      if (this.phaserGame && this.isInitialized) {
        this.phaserGame.scene.start(sceneKey, data);
        console.log(`🎬 Switched to scene: ${sceneKey}`);
      }
    } catch (error) {
      console.warn(`⚠️ Error switching to scene ${sceneKey}:`, error);
    }
  }

  /**
   * Get current active scene
   */
  public getCurrentScene(): Phaser.Scene | null {
    try {
      if (this.phaserGame && this.isInitialized) {
        const activeScenes = this.phaserGame.scene.getScenes(true);
        return activeScenes.length > 0 ? activeScenes[0] : null;
      }
    } catch (error) {
      console.warn('⚠️ Error getting current scene:', error);
    }
    return null;
  }

  /**
   * Restart the current scene
   */
  public restartCurrentScene(data?: any): void {
    try {
      const currentScene = this.getCurrentScene();
      if (currentScene) {
        currentScene.scene.restart(data);
        console.log(`🔄 Restarted scene: ${currentScene.scene.key}`);
      }
    } catch (error) {
      console.warn('⚠️ Error restarting scene:', error);
    }
  }
}

export default Game;