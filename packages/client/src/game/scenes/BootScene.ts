import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px Arial',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px Arial',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    // Loading events
    this.load.on('progress', (value: number) => {
      percentText.setText(Math.floor(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x00d4aa, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Generate tile textures programmatically for minimal design
    this.generateTileTextures();
    
    // Load any other assets here
    // this.load.audio('pop', ['assets/sounds/pop.mp3']);
    // this.load.audio('match', ['assets/sounds/match.mp3']);
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