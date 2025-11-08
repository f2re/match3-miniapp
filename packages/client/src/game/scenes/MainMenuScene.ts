import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private userInfo!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background gradient
    this.createBackground();

    // Title with glow effect
    this.titleText = this.add.text(width / 2, height * 0.2, 'MATCH-3', {
      fontSize: '64px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#4a90e2',
      strokeThickness: 6,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#00d4ff',
        blur: 20,
        fill: true
      }
    }).setOrigin(0.5);

    // Add sparkle decorations around title
    const titleBounds = this.titleText.getBounds();
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const radius = 120;
      const sparkle = this.add.star(
        titleBounds.centerX + Math.cos(angle) * radius,
        titleBounds.centerY + Math.sin(angle) * radius,
        5, 4, 8,
        0xffd700
      );
      sparkle.setAlpha(0.6);

      this.tweens.add({
        targets: sparkle,
        angle: 360,
        alpha: 0.3,
        scale: 0.8,
        duration: 3000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Subtitle with gradient effect
    this.add.text(width / 2, height * 0.3, 'Telegram Mini Game', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#4ecdc4',
      fontStyle: 'italic',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // User info from Telegram
    this.createUserInfo();

    // Start button
    this.createStartButton();

    // Game stats preview
    this.createStatsPreview();

    // Add some decorative elements
    this.createDecorations();

    // Add simple animations
    this.addAnimations();
  }

  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create stunning gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(
      0x1a1a2e, // Top left - deep navy
      0x16213e, // Top right - dark blue
      0x0f3460, // Bottom left - ocean blue
      0x533483, // Bottom right - purple
      1, 1, 1, 1
    );
    graphics.fillRect(0, 0, width, height);

    // Add animated gradient overlay
    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x4a90e2, 0x9b59b6, 0x4a90e2, 0x9b59b6, 0.1, 0.1, 0.1, 0.1);
    overlay.fillRect(0, 0, width, height);

    // Create floating orbs
    for (let i = 0; i < 12; i++) {
      const orb = this.add.circle(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 60 + 30,
        0x4a90e2,
        0.05
      );

      this.tweens.add({
        targets: orb,
        x: Math.random() * width,
        y: Math.random() * height,
        alpha: Math.random() * 0.08 + 0.02,
        scale: Math.random() * 0.5 + 0.8,
        duration: Math.random() * 10000 + 8000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Add sparkling stars
    for (let i = 0; i < 40; i++) {
      const star = this.add.circle(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 0.5,
        0xffffff,
        Math.random() * 0.8 + 0.2
      );

      this.tweens.add({
        targets: star,
        alpha: Math.random() * 0.4 + 0.1,
        scale: Math.random() * 0.8 + 0.5,
        duration: Math.random() * 3000 + 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000
      });
    }
  }

  private createUserInfo(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    let userText = 'Welcome, Player!';
    
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      userText = `Welcome, ${firstName} ${lastName}!`.trim();
      if (userText === 'Welcome, !') {
        userText = `Welcome, @${user.username || 'Player'}!`;
      }
    }

    this.userInfo = this.add.text(width / 2, height * 0.4, userText, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#3498db',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createStartButton(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Button container
    this.startButton = this.add.container(width / 2, height * 0.6);

    // Button background with gradient layers
    const buttonBg = this.add.graphics();

    // Deep shadow
    buttonBg.fillStyle(0x000000, 0.3);
    buttonBg.fillRoundedRect(-92, -27, 184, 54, 27);

    // Main gradient background
    buttonBg.fillStyle(0x1e88e5, 1);
    buttonBg.fillRoundedRect(-90, -25, 180, 50, 25);

    // Gradient overlay (lighter top)
    buttonBg.fillStyle(0x42a5f5, 0.8);
    buttonBg.fillRoundedRect(-88, -23, 176, 20, 23);

    // Top highlight
    buttonBg.fillStyle(0xffffff, 0.3);
    buttonBg.fillRoundedRect(-85, -20, 170, 12, 20);

    // Glow border
    buttonBg.lineStyle(3, 0x00d4ff, 0.6);
    buttonBg.strokeRoundedRect(-90, -25, 180, 50, 25);

    // Inner border for depth
    buttonBg.lineStyle(2, 0xffffff, 0.4);
    buttonBg.strokeRoundedRect(-88, -23, 176, 46, 23);

    // Button text with glow
    const buttonText = this.add.text(0, 0, 'START GAME', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#0d47a1',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    }).setOrigin(0.5);

    // Add play icon
    const playIcon = this.add.triangle(0, 0, -8, -6, -8, 6, 0, 0, 0xffffff);
    playIcon.setX(-60);

    this.startButton.add([buttonBg, playIcon, buttonText]);

    // Make button interactive
    this.startButton.setSize(180, 50);
    this.startButton.setInteractive({ useHandCursor: true });

    // Button events with enhanced feedback
    this.startButton.on('pointerdown', () => {
      this.startButton.setScale(0.95);
      this.tweens.add({
        targets: buttonBg,
        alpha: 0.8,
        duration: 100
      });
    });

    this.startButton.on('pointerup', () => {
      this.startButton.setScale(1);
      this.startGame();
    });

    this.startButton.on('pointerover', () => {
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 300,
        ease: 'Back.easeOut'
      });

      // Add glow pulse
      this.tweens.add({
        targets: buttonBg,
        alpha: 1.2,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
    });

    this.startButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });

      this.tweens.killTweensOf(buttonBg);
      buttonBg.setAlpha(1);
    });

    // Idle pulsing animation
    this.tweens.add({
      targets: this.startButton,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createStatsPreview(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Stats container
    const statsY = height * 0.75;
    
    // Best Score (placeholder)
    this.add.text(width / 2, statsY, 'Best Score: 0', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#bdc3c7'
    }).setOrigin(0.5);

    // Level info
    this.add.text(width / 2, statsY + 25, 'Current Level: 1', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#bdc3c7'
    }).setOrigin(0.5);
  }

  private createDecorations(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add some floating tile decorations
    const tileTypes = ['red', 'blue', 'yellow', 'green', 'purple'];
    
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(50, height - 50);
      const tileType = Phaser.Utils.Array.GetRandom(tileTypes);
      const scale = Phaser.Math.FloatBetween(0.3, 0.6);
      
      const tile = this.add.image(x, y, tileType);
      tile.setScale(scale);
      tile.setAlpha(0.3);
      tile.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

      // Add floating animation
      this.tweens.add({
        targets: tile,
        y: y + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });

      // Add rotation animation
      this.tweens.add({
        targets: tile,
        rotation: tile.rotation + Math.PI * 2,
        duration: Phaser.Math.Between(8000, 12000),
        ease: 'Linear',
        repeat: -1
      });
    }
  }

  private addAnimations(): void {
    // Title pulse animation
    this.tweens.add({
      targets: this.titleText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // User info fade in
    this.userInfo.setAlpha(0);
    this.tweens.add({
      targets: this.userInfo,
      alpha: 1,
      duration: 1000,
      delay: 500,
      ease: 'Power2'
    });

    // Start button bounce in
    this.startButton.setScale(0);
    this.tweens.add({
      targets: this.startButton,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      delay: 1000,
      ease: 'Back.easeOut'
    });
  }

  private startGame(): void {
    // Add a nice transition effect
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { level: 1 });
    });
  }
}