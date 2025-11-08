import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create stunning gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      0x1a1a2e,
      0x16213e,
      0x0f3460,
      0x533483,
      1, 1, 1, 1
    );
    bg.fillRect(0, 0, width, height);

    // Add animated orbs
    for (let i = 0; i < 8; i++) {
      const orb = this.add.circle(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 50 + 25,
        0x4a90e2,
        0.05
      );

      this.tweens.add({
        targets: orb,
        x: Math.random() * width,
        y: Math.random() * height,
        alpha: Math.random() * 0.1 + 0.02,
        duration: Math.random() * 6000 + 4000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Game title with glow
    const title = this.add.text(width / 2, height * 0.25, 'MATCH-3', {
      fontSize: '56px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#4a90e2',
      strokeThickness: 5,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#00d4ff',
        blur: 25,
        fill: true
      }
    }).setOrigin(0.5);

    // Pulse animation for title
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 60, 'Loading...', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#4ecdc4',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Animated loading dots
    this.tweens.add({
      targets: loadingText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Progress box with glass-morphism
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a1a2e, 0.6);
    progressBox.fillRoundedRect(width / 2 - 165, height / 2 - 20, 330, 40, 20);
    progressBox.lineStyle(2, 0x4a90e2, 0.8);
    progressBox.strokeRoundedRect(width / 2 - 165, height / 2 - 20, 330, 40, 20);
    progressBox.lineStyle(1, 0xffffff, 0.3);
    progressBox.strokeRoundedRect(width / 2 - 163, height / 2 - 18, 326, 36, 18);

    // Progress bar
    const progressBar = this.add.graphics();

    // Percentage text
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Loading spinner
    const spinner = this.add.star(width / 2, height / 2 + 70, 8, 10, 20, 0x4ecdc4);
    this.tweens.add({
      targets: spinner,
      rotation: Math.PI * 2,
      duration: 1500,
      repeat: -1,
      ease: 'Linear'
    });

    // Loading events with beautiful animation
    this.load.on('progress', (value: number) => {
      const percentage = Math.floor(value * 100);
      percentText.setText(percentage + '%');

      progressBar.clear();

      // Gradient progress bar
      const barWidth = 320 * value;

      // Shadow
      progressBar.fillStyle(0x000000, 0.2);
      progressBar.fillRoundedRect(width / 2 - 157, height / 2 - 13, barWidth, 26, 15);

      // Main gradient bar
      progressBar.fillStyle(0x1e88e5, 1);
      progressBar.fillRoundedRect(width / 2 - 160, height / 2 - 15, barWidth, 30, 15);

      // Highlight gradient
      progressBar.fillStyle(0x42a5f5, 0.8);
      progressBar.fillRoundedRect(width / 2 - 158, height / 2 - 13, barWidth - 4, 12, 13);

      // Glow effect
      progressBar.lineStyle(2, 0x00d4ff, 0.6);
      progressBar.strokeRoundedRect(width / 2 - 160, height / 2 - 15, barWidth, 30, 15);

      // Pulse animation on progress
      this.tweens.add({
        targets: percentText,
        scale: 1.1,
        duration: 100,
        yoyo: true,
        ease: 'Back.easeOut'
      });
    });

    this.load.on('complete', () => {
      // Fade out animation
      this.tweens.add({
        targets: [progressBar, progressBox, loadingText, percentText, spinner, title],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          progressBar.destroy();
          progressBox.destroy();
          loadingText.destroy();
          percentText.destroy();
          spinner.destroy();
          title.destroy();
        }
      });
    });

    // Generate beautiful tile textures
    this.generateTileTextures();
  }

  private generateTileTextures(): void {
    const tileSize = 64;
    const colors = [
      0xff6b6b, // Red
      0x4ecdc4, // Blue/Teal
      0x45b7d1, // Light Blue
      0xf9ca24, // Yellow
      0x6c5ce7, // Purple
      0xa55eea, // Pink
      0x26de81  // Green
    ];

    const tileTypes = ['red', 'blue', 'lightblue', 'yellow', 'purple', 'pink', 'green'];

    colors.forEach((color, index) => {
      const graphics = this.add.graphics();
      
      // Create tile with modern flat design
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(2, 2, tileSize - 4, tileSize - 4, 8);
      
      // Add subtle inner highlight
      graphics.fillStyle(0xffffff, 0.2);
      graphics.fillRoundedRect(4, 4, tileSize - 8, (tileSize - 8) / 3, 6);
      
      // Add border
      graphics.lineStyle(2, 0xffffff, 0.3);
      graphics.strokeRoundedRect(2, 2, tileSize - 4, tileSize - 4, 8);

      graphics.generateTexture(tileTypes[index], tileSize, tileSize);
      graphics.destroy();
    });

    // Generate special tiles
    this.generateSpecialTileTextures(tileSize);
  }

  private generateSpecialTileTextures(tileSize: number): void {
    // Bomb tile
    const bombGraphics = this.add.graphics();
    bombGraphics.fillStyle(0x2c2c2c, 1);
    bombGraphics.fillRoundedRect(2, 2, tileSize - 4, tileSize - 4, 8);
    bombGraphics.fillStyle(0xff4757, 1);
    bombGraphics.fillCircle(tileSize / 2, tileSize / 2, 20);
    bombGraphics.fillStyle(0xffffff, 1);
    bombGraphics.fillCircle(tileSize / 2 - 5, tileSize / 2 - 5, 3);
    bombGraphics.generateTexture('bomb', tileSize, tileSize);
    bombGraphics.destroy();

    // Rainbow tile (multi-color)
    const rainbowGraphics = this.add.graphics();
    const rainbowColors = [0xff6b6b, 0xf9ca24, 0x45b7d1, 0x6c5ce7, 0x26de81];
    const sectionWidth = (tileSize - 4) / rainbowColors.length;
    
    rainbowColors.forEach((color, index) => {
      rainbowGraphics.fillStyle(color, 1);
      const x = 2 + index * sectionWidth;
      if (index === 0) {
        rainbowGraphics.fillRoundedRect(x, 2, sectionWidth, tileSize - 4, 8, 0, 0, 8);
      } else if (index === rainbowColors.length - 1) {
        rainbowGraphics.fillRoundedRect(x, 2, sectionWidth, tileSize - 4, 0, 8, 8, 0);
      } else {
        rainbowGraphics.fillRect(x, 2, sectionWidth, tileSize - 4);
      }
    });
    
    rainbowGraphics.generateTexture('rainbow', tileSize, tileSize);
    rainbowGraphics.destroy();
  }

  create(): void {
    // Initialize Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      // Set theme colors
      const themeParams = window.Telegram.WebApp.themeParams;
      if (themeParams.bg_color) {
        this.cameras.main.setBackgroundColor(themeParams.bg_color);
      }
    }

    // Start the main menu scene
    this.scene.start('MainMenuScene');
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        expand(): void;
        close(): void;
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}