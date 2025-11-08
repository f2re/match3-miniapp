import Phaser from 'phaser';

/**
 * Enhanced UI Scene for Match-3 Telegram Mini App
 * Features glass-morphism design and smooth animations
 */
export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Container;
  private pauseMenu!: Phaser.GameObjects.Container;
  private gamePaused = false;
  private uiPanel!: Phaser.GameObjects.Graphics;
  private scoreIcon!: Phaser.GameObjects.Star;
  private movesIcon!: Phaser.GameObjects.Circle;
  private targetIcon!: Phaser.GameObjects.Star;

  constructor() {
    super({ key: 'UIScene', active: true });
  }

  create(): void {
    // Create beautiful glass-morphism UI panel
    this.createUIPanel();

    // Create score display with icon
    this.createScoreDisplay();

    // Create moves display with icon
    this.createMovesDisplay();

    // Create target score display with icon
    this.createTargetDisplay();

    // Create modern pause button
    this.createPauseButton();

    // Create beautiful pause menu
    this.createPauseMenu();

    // Listen for game events to update UI
    this.setupEventListeners();
  }

  private createUIPanel(): void {
    const panelWidth = 220;
    const panelHeight = 150;

    this.uiPanel = this.add.graphics();

    // Glass-morphism background
    this.uiPanel.fillStyle(0x1a1a2e, 0.75);
    this.uiPanel.fillRoundedRect(10, 10, panelWidth, panelHeight, 16);

    // Inner glow
    this.uiPanel.lineStyle(2, 0x4a90e2, 0.6);
    this.uiPanel.strokeRoundedRect(10, 10, panelWidth, panelHeight, 16);

    // Highlight border
    this.uiPanel.lineStyle(1, 0xffffff, 0.3);
    this.uiPanel.strokeRoundedRect(11, 11, panelWidth - 2, panelHeight - 2, 15);

    // Subtle inner shadow effect
    this.uiPanel.lineStyle(1, 0x000000, 0.2);
    this.uiPanel.strokeRoundedRect(12, 12, panelWidth - 4, panelHeight - 4, 14);

    this.uiPanel.setScrollFactor(0).setDepth(100);
  }

  private createScoreDisplay(): void {
    // Animated score icon
    this.scoreIcon = this.add.star(35, 35, 5, 6, 10, 0x4ecdc4);
    this.scoreIcon.setScrollFactor(0).setDepth(101);

    this.tweens.add({
      targets: this.scoreIcon,
      rotation: Math.PI * 2,
      duration: 4000,
      repeat: -1,
      ease: 'Linear'
    });

    // Score text with modern styling
    this.scoreText = this.add.text(55, 28, 'Score: 0', {
      fontSize: '22px',
      color: '#4ecdc4',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(101);
  }

  private createMovesDisplay(): void {
    // Animated moves icon
    this.movesIcon = this.add.circle(35, 70, 8, 0xff6b6b, 1);
    this.movesIcon.setScrollFactor(0).setDepth(101);

    this.tweens.add({
      targets: this.movesIcon,
      scale: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Moves text with modern styling
    this.movesText = this.add.text(55, 63, 'Moves: 0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(101);
  }

  private createTargetDisplay(): void {
    // Animated target icon
    this.targetIcon = this.add.star(35, 105, 5, 4, 8, 0xffd700);
    this.targetIcon.setScrollFactor(0).setDepth(101);

    this.tweens.add({
      targets: this.targetIcon,
      angle: 360,
      scale: 1.15,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Target text with modern styling
    this.targetText = this.add.text(55, 98, 'Target: 0', {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(101);
  }

  private createPauseButton(): void {
    const btnX = this.cameras.main.width - 50;
    const btnY = 50;

    this.pauseButton = this.add.container(btnX, btnY);

    // Button background with glass effect
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x1a1a2e, 0.8);
    btnBg.fillCircle(0, 0, 25);

    btnBg.lineStyle(2, 0x4a90e2, 0.8);
    btnBg.strokeCircle(0, 0, 25);

    btnBg.lineStyle(1, 0xffffff, 0.3);
    btnBg.strokeCircle(0, 0, 23);

    // Pause icon (two bars)
    const bar1 = this.add.rectangle(-6, 0, 4, 16, 0xffffff);
    const bar2 = this.add.rectangle(6, 0, 4, 16, 0xffffff);

    this.pauseButton.add([btnBg, bar1, bar2]);
    this.pauseButton.setSize(50, 50);
    this.pauseButton.setScrollFactor(0).setDepth(102);
    this.pauseButton.setInteractive({ useHandCursor: true });

    // Button animations
    this.pauseButton.on('pointerover', () => {
      this.tweens.add({
        targets: this.pauseButton,
        scale: 1.15,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    this.pauseButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.pauseButton,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    this.pauseButton.on('pointerdown', () => {
      this.pauseButton.setScale(0.95);
      this.togglePause();
    });

    // Idle pulse animation
    this.tweens.add({
      targets: this.pauseButton,
      alpha: 0.9,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createPauseMenu(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const menuWidth = width * 0.8;
    const menuHeight = height * 0.6;

    this.pauseMenu = this.add.container(0, 0);

    // Semi-transparent overlay
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.7
    );

    // Beautiful glass-morphism panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(
      width / 2 - menuWidth / 2,
      height / 2 - menuHeight / 2,
      menuWidth,
      menuHeight,
      25
    );

    // Glow border
    panel.lineStyle(3, 0x4a90e2, 0.8);
    panel.strokeRoundedRect(
      width / 2 - menuWidth / 2,
      height / 2 - menuHeight / 2,
      menuWidth,
      menuHeight,
      25
    );

    // Inner highlight
    panel.lineStyle(2, 0xffffff, 0.3);
    panel.strokeRoundedRect(
      width / 2 - menuWidth / 2 + 2,
      height / 2 - menuHeight / 2 + 2,
      menuWidth - 4,
      menuHeight - 4,
      23
    );

    // Title with glow effect
    const title = this.add.text(width / 2, height / 2 - menuHeight / 3, 'PAUSED', {
      fontSize: '42px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#4a90e2',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#00d4ff',
        blur: 15,
        fill: true
      }
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.createMenuButton(
      width / 2,
      height / 2 - 30,
      'RESUME',
      0x2ecc71,
      0x27ae60
    );

    resumeBtn.on('pointerdown', () => {
      this.togglePause();
    });

    // Main Menu button
    const menuBtn = this.createMenuButton(
      width / 2,
      height / 2 + 50,
      'MAIN MENU',
      0xe74c3c,
      0xc0392b
    );

    menuBtn.on('pointerdown', () => {
      this.scene.pause('GameScene');
      this.scene.start('MainMenuScene');
      this.pauseMenu.setVisible(false);
      this.gamePaused = false;
    });

    this.pauseMenu.add([overlay, panel, title, resumeBtn, menuBtn]);
    this.pauseMenu.setVisible(false).setScrollFactor(0).setDepth(200);
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    color: number,
    darkColor: number
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    const btnGraphics = this.add.graphics();

    // Shadow
    btnGraphics.fillStyle(0x000000, 0.3);
    btnGraphics.fillRoundedRect(-102, -27, 204, 54, 27);

    // Main background
    btnGraphics.fillStyle(color, 1);
    btnGraphics.fillRoundedRect(-100, -25, 200, 50, 25);

    // Gradient overlay
    btnGraphics.fillStyle(color, 0.6);
    btnGraphics.fillRoundedRect(-98, -23, 196, 20, 23);

    // Highlight
    btnGraphics.fillStyle(0xffffff, 0.3);
    btnGraphics.fillRoundedRect(-95, -20, 190, 12, 20);

    // Glow border
    btnGraphics.lineStyle(2, 0xffffff, 0.6);
    btnGraphics.strokeRoundedRect(-100, -25, 200, 50, 25);

    // Button text
    const btnText = this.add.text(0, 0, text, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: darkColor.toString(16),
      strokeThickness: 3
    }).setOrigin(0.5);

    button.add([btnGraphics, btnText]);
    button.setSize(200, 50);
    button.setInteractive({ useHandCursor: true });

    // Button animations
    button.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scale: 1.1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    button.on('pointerdown', () => {
      button.setScale(0.95);
    });

    button.on('pointerup', () => {
      button.setScale(1);
    });

    return button;
  }

  private setupEventListeners(): void {
    this.events.on('updateScore', (score: number) => {
      this.scoreText.setText(`Score: ${score}`);

      // Pulse animation on score update
      this.tweens.add({
        targets: [this.scoreText, this.scoreIcon],
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    });

    this.events.on('updateMoves', (moves: number) => {
      this.movesText.setText(`Moves: ${moves}`);

      // Update color based on remaining moves
      if (moves <= 5) {
        this.movesText.setColor('#e74c3c');
        this.movesIcon.setFillStyle(0xe74c3c);
      } else if (moves <= 10) {
        this.movesText.setColor('#f39c12');
        this.movesIcon.setFillStyle(0xf39c12);
      } else {
        this.movesText.setColor('#ffffff');
        this.movesIcon.setFillStyle(0xff6b6b);
      }

      // Pulse animation
      this.tweens.add({
        targets: [this.movesText, this.movesIcon],
        scale: 1.15,
        duration: 150,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    });

    this.events.on('updateTarget', (target: number) => {
      this.targetText.setText(`Target: ${target}`);
    });
  }

  private togglePause(): void {
    if (this.gamePaused) {
      // Resume game
      this.scene.resume('GameScene');
      this.pauseMenu.setVisible(false);
      this.gamePaused = false;
    } else {
      // Pause game
      this.scene.pause('GameScene');
      this.pauseMenu.setVisible(true);
      this.gamePaused = true;

      // Animate menu entrance
      this.pauseMenu.setScale(0.8);
      this.pauseMenu.setAlpha(0);
      this.tweens.add({
        targets: this.pauseMenu,
        scale: 1,
        alpha: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
    }
  }

  // Public methods for external updates
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
