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

    // Title
    this.titleText = this.add.text(width / 2, height * 0.2, 'MATCH-3', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.3, 'Telegram Mini Game', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ecf0f1',
      fontStyle: 'italic'
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

    // Create gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1, 1, 1, 1);
    graphics.fillRect(0, 0, width, height);

    // Add subtle pattern
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      
      graphics.fillStyle(0xffffff, 0.1);
      graphics.fillCircle(x, y, size);
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

    // Button background
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x3498db, 1);
    buttonBg.fillRoundedRect(-80, -25, 160, 50, 25);
    
    // Button highlight
    buttonBg.fillStyle(0xffffff, 0.2);
    buttonBg.fillRoundedRect(-78, -23, 156, 15, 20);
    
    // Button border
    buttonBg.lineStyle(2, 0x2980b9, 1);
    buttonBg.strokeRoundedRect(-80, -25, 160, 50, 25);

    // Button text
    const buttonText = this.add.text(0, 0, 'START GAME', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.startButton.add([buttonBg, buttonText]);

    // Make button interactive
    this.startButton.setSize(160, 50);
    this.startButton.setInteractive({ useHandCursor: true });

    // Button events
    this.startButton.on('pointerdown', () => {
      this.startButton.setScale(0.95);
    });

    this.startButton.on('pointerup', () => {
      this.startButton.setScale(1);
      this.startGame();
    });

    this.startButton.on('pointerover', () => {
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: 'Power2'
      });
    });

    this.startButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.startButton,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
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