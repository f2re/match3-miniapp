import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';

export class Game {
  private phaserGame: Phaser.Game | null = null;
  private gameContainer: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.gameContainer = container;
    this.initGame();
  }

  private initGame(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 400,
      height: 600,
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
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600
      },
      render: {
        pixelArt: false,
        antialias: true
      }
    };

    this.phaserGame = new Phaser.Game(config);
  }

  public destroy(): void {
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
      this.phaserGame = null;
    }
  }

  public resize(width: number, height: number): void {
    if (this.phaserGame) {
      this.phaserGame.scale.resize(width, height);
    }
  }

  public getPhaserGame(): Phaser.Game | null {
    return this.phaserGame;
  }
}

export default Game;