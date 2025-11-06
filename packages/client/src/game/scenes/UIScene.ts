import Phaser from 'phaser';

/**
 * UI Scene for Match-3 Telegram Mini App
 * Handles persistent UI elements like score display, moves counter,
 * and other overlay elements that aren't part of the main game grid
 */
export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Sprite;
  private pauseMenu!: Phaser.GameObjects.Container;
  private gamePaused = false;

  constructor() {
    super({ key: 'UIScene', active: true }); // Active scenes run in parallel with other scenes
  }

  create(): void {
    // Create score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    // Create moves display
    this.movesText = this.add.text(20, 60, 'Moves: 0', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    // Create target score display
    this.targetText = this.add.text(20, 100, 'Target: 0', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    // Create pause button
    this.pauseButton = this.add.sprite(
      this.cameras.main.width - 40,
      40,
      'pause-icon' // This will be added in preload
    ).setScrollFactor(0).setInteractive().setScale(0.8);

    // Generate pause icon texture
    this.generatePauseIcon();

    // Set up pause button event
    this.pauseButton.on('pointerdown', () => {
      this.togglePause();
    });

    // Create pause menu (initially hidden)
    this.createPauseMenu();

    // Listen for game events to update UI
    this.events.on('updateScore', (score: number) => {
      this.scoreText.setText(`Score: ${score}`);
    });

    this.events.on('updateMoves', (moves: number) => {
      this.movesText.setText(`Moves: ${moves}`);
    });

    this.events.on('updateTarget', (target: number) => {
      this.targetText.setText(`Target: ${target}`);
    });
  }

  private generatePauseIcon(): void {
    // Create a pause icon texture
    const graphics = this.add.graphics({ x: 0, y: 0 });
    
    // Draw a pause symbol (two vertical bars)
    graphics.fillStyle(0xffffff);
    graphics.fillRect(-5, -10, 4, 20);  // First bar
    graphics.fillRect(5, -10, 4, 20);   // Second bar
    
    graphics.generateTexture('pause-icon', 20, 20);
    graphics.destroy();
  }

  private createPauseMenu(): void {
    // Create background for pause menu
    const background = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width * 0.8,
      this.cameras.main.height * 0.6
    ).setFillStyle(0x2c3e50, 0.9).setScrollFactor(0);

    // Create title
    const title = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 80,
      'PAUSED',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Create resume button
    const resumeButton = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 20,
      200,
      50,
      0x3498db
    ).setInteractive().setScrollFactor(0);

    const resumeText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 20,
      'Resume',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Create main menu button
    const menuButton = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 40,
      200,
      50,
      0xe74c3c
    ).setInteractive().setScrollFactor(0);

    const menuText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 40,
      'Main Menu',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }
    ).setOrigin(0.5).setScrollFactor(0);

    // Create container for the pause menu
    this.pauseMenu = this.add.container(0, 0, [
      background, title, resumeButton, resumeText, menuButton, menuText
    ]).setVisible(false).setScrollFactor(0);

    // Add event listeners
    resumeButton.on('pointerdown', () => {
      this.togglePause();
    });

    menuButton.on('pointerdown', () => {
      this.scene.pause('GameScene');
      this.scene.start('MainMenuScene');
      this.pauseMenu.setVisible(false);
      this.gamePaused = false;
    });
  }

  private togglePause(): void {
    if (this.gamePaused) {
      // Resume game
      this.scene.resume('GameScene');
      this.pauseMenu.setVisible(false);
      this.gamePaused = false;
      
      // Update button texture to pause
      this.generatePauseIcon();
    } else {
      // Pause game
      this.scene.pause('GameScene');
      this.pauseMenu.setVisible(true);
      this.gamePaused = true;
      
      // Update button texture (would change to play icon in a full implementation)
    }
  }

  // Method to update UI elements from outside the scene
  public updateScore(score: number): void {
    this.events.emit('updateScore', score);
  }

  public updateMoves(moves: number): void {
    this.events.emit('updateMoves', moves);
  }

  public updateTarget(target: number): void {
    this.events.emit('updateTarget', target);
  }
}