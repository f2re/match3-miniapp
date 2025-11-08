import Phaser from 'phaser';
import { GameLogic } from '../utils/GameLogic';
import { AchievementManager } from '../utils/AchievementManager';
import {
  GameTile,
  TileType,
  GridPosition,
  GameState,
  LevelConfig,
  MatchResult,
  TileAnimation,
  SpecialTileEffect,
  Achievement
} from '../../types/game';

/**
 * Main game scene for Match-3 gameplay
 * Handles rendering, animations, and user interactions
 * Enhanced with special tiles, achievements, and color swap mechanics
 */
export class GameScene extends Phaser.Scene {
  private gameLogic!: GameLogic;
  private gameState!: GameState;
  private levelConfig!: LevelConfig;
  private achievementManager!: AchievementManager;

  // Visual constants - optimized for mobile
  private readonly TILE_SIZE = 64;
  private readonly TILE_SPACING = 6;
  private readonly GRID_OFFSET_X = 50;
  private readonly GRID_OFFSET_Y = 180;

  // Game objects
  private tileSprites: Phaser.GameObjects.Sprite[][] = [];
  private selectedTileSprite: Phaser.GameObjects.Sprite | null = null;
  private particleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private backgroundSprites: Phaser.GameObjects.Sprite[][] = [];

  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private targetScoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private achievementNotification!: Phaser.GameObjects.Container;
  private colorSwapText!: Phaser.GameObjects.Text;
  private matchCounterText!: Phaser.GameObjects.Text;

  // Audio - with fallback system
  private audioEnabled = false;
  private audioContext: AudioContext | null = null;

  // Animation state
  private isAnimating = false;
  private comboCount = 0;
  private totalMatches = 0;
  private matchesSinceColorSwap = 0;
  private readonly COLOR_SWAP_THRESHOLD = 3;
  private specialActivations = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelConfig: LevelConfig }) {
    this.levelConfig = data.levelConfig || this.getDefaultLevelConfig();
    this.gameLogic = new GameLogic(this.levelConfig);
    this.achievementManager = new AchievementManager();
    this.achievementManager.loadFromStorage();
    this.achievementManager.resetGameStats();
    this.initializeGameState();

    // Initialize audio context safely
    this.initializeAudio();
  }

  preload() {
    // Create enhanced tile textures with better visual design
    this.createTileTextures();
    
    // Create particle texture for effects
    this.add.graphics()
      .fillStyle(0xffffff)
      .fillCircle(0, 0, 4)
      .generateTexture('particle', 8, 8);
    
    // Create star particle for special effects using custom drawing function
    this.createStarTexture();
  }

  create() {
    // Set up camera and animated background
    this.createAnimatedBackground();
    
    // Create game grid with background tiles
    this.createGrid();
    
    // Create enhanced UI
    this.createUI();
    
    // Create enhanced particle systems
    this.createParticleEffects();
    
    // Set up input handlers with improved feedback
    this.setupInput();
    
    // Start game
    this.startNewGame();
    
    // Add resize listener for better mobile support
    this.scale.on('resize', this.handleResize, this);
  }

  update() {
    // Update combo text opacity
    if (this.comboText && this.comboText.visible) {
      const alpha = this.comboText.alpha - 0.02;
      if (alpha <= 0) {
        this.comboText.setVisible(false);
      } else {
        this.comboText.setAlpha(alpha);
      }
    }
  }

  private initializeAudio() {
    try {
      // Create audio context for procedural sounds
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioEnabled = true;
    } catch (error) {
      console.warn('Audio context not available:', error);
      this.audioEnabled = false;
    }
  }

  private createAnimatedBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create beautiful multi-layer gradient background
    const graphics = this.add.graphics();

    // Base gradient (purple to blue)
    graphics.fillGradientStyle(
      0x1a1a2e, // Top left - deep navy
      0x16213e, // Top right - dark blue
      0x0f3460, // Bottom left - ocean blue
      0x533483, // Bottom right - purple
      1
    );
    graphics.fillRect(0, 0, width, height);

    // Add subtle overlay pattern
    graphics.fillStyle(0x000000, 0.1);
    for (let x = 0; x < width; x += 40) {
      for (let y = 0; y < height; y += 40) {
        if ((x + y) % 80 === 0) {
          graphics.fillCircle(x, y, 1);
        }
      }
    }

    // Create floating orbs for depth
    for (let i = 0; i < 8; i++) {
      const orb = this.add.circle(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 40 + 20,
        0x4a90e2,
        0.05
      );

      this.tweens.add({
        targets: orb,
        x: Math.random() * width,
        y: Math.random() * height,
        alpha: Math.random() * 0.1 + 0.02,
        duration: Math.random() * 8000 + 6000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Add sparkling stars with varied sizes
    for (let i = 0; i < 30; i++) {
      const starSize = Math.random() * 3 + 1;
      const star = this.add.circle(
        Math.random() * width,
        Math.random() * height,
        starSize,
        0xffffff,
        Math.random() * 0.6 + 0.3
      );

      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: Math.random() * 0.3,
        scale: Math.random() * 0.5 + 0.7,
        duration: Math.random() * 2500 + 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000
      });
    }

    // Add shooting stars occasionally
    this.time.addEvent({
      delay: 3000,
      callback: () => this.createShootingStar(),
      loop: true
    });
  }

  private createShootingStar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const startX = Math.random() * width;
    const startY = Math.random() * height * 0.3;

    const star = this.add.circle(startX, startY, 2, 0xffffff, 0.9);
    const trail = this.add.rectangle(startX - 20, startY, 40, 2, 0xffffff, 0.5);
    trail.setOrigin(1, 0.5);

    this.tweens.add({
      targets: [star, trail],
      x: '+=200',
      y: '+=150',
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        star.destroy();
        trail.destroy();
      }
    });
  }

  private createStarTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00);
    
    // Draw star shape manually using path drawing
    this.drawStar(graphics, 6, 6, 4, 6, 3);
    
    graphics.generateTexture('star_particle', 12, 12);
    graphics.destroy();
  }

  private drawStar(graphics: Phaser.GameObjects.Graphics, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }
    
    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
  }

  private createTileTextures() {
    // Beautiful gem colors with sophisticated palettes
    const tileColors = {
      [TileType.RED]: {
        main: 0xff3838,
        mid: 0xff6b6b,
        highlight: 0xff9999,
        shadow: 0xc62828,
        dark: 0x8b0000,
        accent: 0xffcccc
      },
      [TileType.BLUE]: {
        main: 0x1e88e5,
        mid: 0x42a5f5,
        highlight: 0x90caf9,
        shadow: 0x0d47a1,
        dark: 0x002171,
        accent: 0xe3f2fd
      },
      [TileType.GREEN]: {
        main: 0x43a047,
        mid: 0x66bb6a,
        highlight: 0xa5d6a7,
        shadow: 0x2e7d32,
        dark: 0x1b5e20,
        accent: 0xe8f5e9
      },
      [TileType.YELLOW]: {
        main: 0xfdd835,
        mid: 0xffeb3b,
        highlight: 0xfff59d,
        shadow: 0xf9a825,
        dark: 0xf57f17,
        accent: 0xfffde7
      },
      [TileType.PURPLE]: {
        main: 0x8e24aa,
        mid: 0xab47bc,
        highlight: 0xce93d8,
        shadow: 0x6a1b9a,
        dark: 0x4a148c,
        accent: 0xf3e5f5
      },
      [TileType.ORANGE]: {
        main: 0xfb8c00,
        mid: 0xff9800,
        highlight: 0xffcc80,
        shadow: 0xe65100,
        dark: 0xbf360c,
        accent: 0xfff3e0
      }
    };

    Object.entries(tileColors).forEach(([type, colors]) => {
      const graphics = this.add.graphics();
      const centerX = this.TILE_SIZE / 2;
      const centerY = this.TILE_SIZE / 2;

      // Deep shadow for depth
      graphics.fillStyle(0x000000, 0.4);
      graphics.fillCircle(centerX + 3, centerY + 5, 26);

      // Outer dark border for 3D effect
      graphics.fillStyle(colors.dark);
      graphics.fillCircle(centerX, centerY, 28);

      // Shadow layer
      graphics.fillStyle(colors.shadow);
      graphics.fillCircle(centerX, centerY, 26);

      // Main gem body with gradient simulation (multiple circles)
      for (let i = 0; i < 5; i++) {
        const radius = 26 - i * 2;
        const alpha = 1 - i * 0.1;
        const color = i === 0 ? colors.main : (i < 3 ? colors.mid : colors.highlight);
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(centerX, centerY, radius);
      }

      // Create faceted gem appearance
      // Top facet (highlight)
      graphics.fillStyle(colors.accent, 0.9);
      graphics.beginPath();
      graphics.moveTo(centerX, centerY - 18);
      graphics.lineTo(centerX - 10, centerY - 8);
      graphics.lineTo(centerX + 10, centerY - 8);
      graphics.closePath();
      graphics.fillPath();

      // Side facets (mid-tone)
      graphics.fillStyle(colors.mid, 0.8);
      graphics.beginPath();
      graphics.moveTo(centerX - 10, centerY - 8);
      graphics.lineTo(centerX - 16, centerY + 6);
      graphics.lineTo(centerX, centerY + 2);
      graphics.closePath();
      graphics.fillPath();

      graphics.fillStyle(colors.highlight, 0.7);
      graphics.beginPath();
      graphics.moveTo(centerX + 10, centerY - 8);
      graphics.lineTo(centerX + 16, centerY + 6);
      graphics.lineTo(centerX, centerY + 2);
      graphics.closePath();
      graphics.fillPath();

      // Bottom facets (darker)
      graphics.fillStyle(colors.shadow, 0.6);
      graphics.beginPath();
      graphics.moveTo(centerX, centerY + 2);
      graphics.lineTo(centerX - 16, centerY + 6);
      graphics.lineTo(centerX, centerY + 18);
      graphics.closePath();
      graphics.fillPath();

      graphics.beginPath();
      graphics.moveTo(centerX, centerY + 2);
      graphics.lineTo(centerX + 16, centerY + 6);
      graphics.lineTo(centerX, centerY + 18);
      graphics.closePath();
      graphics.fillPath();

      // Intense highlight for sparkle effect
      graphics.fillStyle(0xffffff, 0.9);
      graphics.fillCircle(centerX - 8, centerY - 10, 4);
      graphics.fillStyle(0xffffff, 0.7);
      graphics.fillCircle(centerX - 6, centerY - 8, 2);

      // Secondary sparkle
      graphics.fillStyle(0xffffff, 0.5);
      graphics.fillCircle(centerX + 6, centerY - 4, 3);

      // Glossy reflection arc
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillCircle(centerX - 5, centerY - 5, 8);

      // Subtle outer glow
      graphics.lineStyle(2, colors.highlight, 0.6);
      graphics.strokeCircle(centerX, centerY, 26);

      // Inner shine ring
      graphics.lineStyle(1, 0xffffff, 0.4);
      graphics.strokeCircle(centerX, centerY, 20);

      graphics.generateTexture(`tile_${type}`, this.TILE_SIZE, this.TILE_SIZE);
      graphics.destroy();
    });

    // Beautiful empty tile texture with subtle gradient
    const emptyGraphics = this.add.graphics();
    emptyGraphics.fillStyle(0x34495e, 0.3);
    emptyGraphics.fillRoundedRect(2, 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4, 12);

    // Inner gradient effect
    emptyGraphics.fillStyle(0x2c3e50, 0.2);
    emptyGraphics.fillRoundedRect(6, 6, this.TILE_SIZE - 12, this.TILE_SIZE - 12, 10);

    // Subtle border
    emptyGraphics.lineStyle(1, 0x7f8c8d, 0.4);
    emptyGraphics.strokeRoundedRect(2, 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4, 12);

    emptyGraphics.generateTexture('tile_empty', this.TILE_SIZE, this.TILE_SIZE);
    emptyGraphics.destroy();

    // Create bomb overlay texture
    this.createBombTexture();
    this.createRocketTexture();
    this.createRainbowTexture();
  }

  private createBombTexture() {
    const graphics = this.add.graphics();
    const centerX = this.TILE_SIZE / 2;
    const centerY = this.TILE_SIZE / 2;

    // Bomb body (dark sphere)
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillCircle(centerX, centerY, 18);

    // Highlight
    graphics.fillStyle(0x7f8c8d, 0.8);
    graphics.fillCircle(centerX - 6, centerY - 6, 6);

    // Fuse
    graphics.lineStyle(3, 0x8b4513);
    graphics.beginPath();
    graphics.moveTo(centerX + 8, centerY - 12);
    graphics.lineTo(centerX + 14, centerY - 20);
    graphics.strokePath();

    // Spark
    graphics.fillStyle(0xff6b00, 1);
    graphics.fillCircle(centerX + 14, centerY - 20, 3);

    // Glowing effect overlay
    graphics.fillStyle(0xffffff, 0.2);
    graphics.fillCircle(centerX, centerY, 20);

    graphics.generateTexture('bomb_overlay', this.TILE_SIZE, this.TILE_SIZE);
    graphics.destroy();
  }

  private createRocketTexture() {
    const graphics = this.add.graphics();
    const centerX = this.TILE_SIZE / 2;
    const centerY = this.TILE_SIZE / 2;

    // Rocket body
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillRect(centerX - 6, centerY - 14, 12, 24);

    // Rocket tip
    graphics.beginPath();
    graphics.moveTo(centerX - 6, centerY - 14);
    graphics.lineTo(centerX, centerY - 20);
    graphics.lineTo(centerX + 6, centerY - 14);
    graphics.closePath();
    graphics.fillPath();

    // Rocket fins
    graphics.fillStyle(0xc0392b, 1);
    graphics.beginPath();
    graphics.moveTo(centerX - 6, centerY + 6);
    graphics.lineTo(centerX - 12, centerY + 10);
    graphics.lineTo(centerX - 6, centerY + 10);
    graphics.closePath();
    graphics.fillPath();

    graphics.beginPath();
    graphics.moveTo(centerX + 6, centerY + 6);
    graphics.lineTo(centerX + 12, centerY + 10);
    graphics.lineTo(centerX + 6, centerY + 10);
    graphics.closePath();
    graphics.fillPath();

    // Window
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(centerX, centerY, 4);

    // Flame
    graphics.fillStyle(0xf39c12, 0.8);
    graphics.fillTriangle(
      centerX - 4, centerY + 10,
      centerX + 4, centerY + 10,
      centerX, centerY + 16
    );

    graphics.generateTexture('rocket_overlay', this.TILE_SIZE, this.TILE_SIZE);
    graphics.destroy();
  }

  private createRainbowTexture() {
    const graphics = this.add.graphics();
    const centerX = this.TILE_SIZE / 2;
    const centerY = this.TILE_SIZE / 2;

    // Rainbow colors
    const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    const radius = 20;

    // Draw rainbow segments
    colors.forEach((color, index) => {
      const startAngle = (index * Math.PI * 2) / colors.length;
      const endAngle = ((index + 1) * Math.PI * 2) / colors.length;

      graphics.fillStyle(color, 0.9);
      graphics.slice(centerX, centerY, radius, startAngle, endAngle, false);
      graphics.fillPath();
    });

    // Central white circle
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(centerX, centerY, 10);

    // Star in the center
    graphics.fillStyle(0xffd700, 1);
    this.drawStar(graphics, centerX, centerY, 5, 6, 3);

    graphics.generateTexture('rainbow_overlay', this.TILE_SIZE, this.TILE_SIZE);
    graphics.destroy();
  }

  private createGrid() {
    const { width, height } = this.gameLogic.getGridDimensions();
    
    // Create background grid
    for (let y = 0; y < height; y++) {
      this.backgroundSprites[y] = [];
      this.tileSprites[y] = [];
      
      for (let x = 0; x < width; x++) {
        const tileX = this.GRID_OFFSET_X + x * (this.TILE_SIZE + this.TILE_SPACING);
        const tileY = this.GRID_OFFSET_Y + y * (this.TILE_SIZE + this.TILE_SPACING);
        
        // Background tile
        const bgSprite = this.add.sprite(tileX, tileY, 'tile_empty');
        bgSprite.setAlpha(0.8);
        this.backgroundSprites[y][x] = bgSprite;
        
        // Foreground tile
        const sprite = this.add.sprite(tileX, tileY, 'tile_empty');
        sprite.setInteractive({ useHandCursor: true });
        sprite.setData('gridX', x);
        sprite.setData('gridY', y);

        // Add smooth hover effect with reflection
        sprite.on('pointerover', () => {
          if (!this.isAnimating && this.gameState.gameStatus === 'playing') {
            // Smooth scale up and add brightness
            this.tweens.add({
              targets: sprite,
              scaleX: 1.08,
              scaleY: 1.08,
              duration: 150,
              ease: 'Power2'
            });
            sprite.setTint(0xffffff);
          }
        });

        sprite.on('pointerout', () => {
          // Smooth scale back down
          this.tweens.add({
            targets: sprite,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Power2'
          });
          sprite.clearTint();
        });

        // Add click effect
        sprite.on('pointerdown', () => {
          if (!this.isAnimating && this.gameState.gameStatus === 'playing') {
            // Quick press animation
            this.tweens.add({
              targets: sprite,
              scaleX: 0.95,
              scaleY: 0.95,
              duration: 80,
              ease: 'Power2',
              yoyo: true
            });
          }
        });

        this.tileSprites[y][x] = sprite;
      }
    }
  }

  private createUI() {
    const headerY = 25;
    const fontSize = this.cameras.main.width < 600 ? '22px' : '26px';
    const smallFontSize = this.cameras.main.width < 600 ? '16px' : '18px';
    const width = this.cameras.main.width;

    // Create glass-morphism panel for stats
    const panelWidth = 200;
    const panelHeight = 140;
    const panel = this.add.graphics();

    // Panel background with blur effect simulation
    panel.fillStyle(0x1a1a2e, 0.7);
    panel.fillRoundedRect(10, 10, panelWidth, panelHeight, 15);

    // Inner glow
    panel.lineStyle(2, 0x4a90e2, 0.5);
    panel.strokeRoundedRect(10, 10, panelWidth, panelHeight, 15);

    // Highlight edge
    panel.lineStyle(1, 0xffffff, 0.2);
    panel.strokeRoundedRect(11, 11, panelWidth - 2, panelHeight - 2, 14);

    // Level display with icon
    const levelIcon = this.add.circle(30, headerY + 5, 8, 0xffd700, 1);
    this.tweens.add({
      targets: levelIcon,
      scale: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.levelText = this.add.text(45, headerY, `Level ${this.gameState.level}`, {
      fontSize,
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Score display with gradient effect
    const scoreIcon = this.add.star(30, headerY + 40, 5, 6, 10, 0x4ecdc4);
    this.tweens.add({
      targets: scoreIcon,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });

    this.scoreText = this.add.text(45, headerY + 35, 'Score: 0', {
      fontSize,
      color: '#4ecdc4',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Moves display with icon
    const movesIcon = this.add.circle(30, headerY + 75, 8, 0xff6b6b, 1);
    this.movesText = this.add.text(45, headerY + 70, `Moves: ${this.gameState.maxMoves}`, {
      fontSize: smallFontSize,
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Target score display with icon
    const targetIcon = this.add.star(30, headerY + 105, 5, 4, 8, 0xf1c40f);
    this.targetScoreText = this.add.text(45, headerY + 100, `Target: ${this.gameState.targetScore}`, {
      fontSize: smallFontSize,
      color: '#f1c40f',
      fontFamily: 'Arial, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Enhanced combo text with multiple effects
    this.comboText = this.add.text(
      width / 2,
      this.cameras.main.height / 2 - 100,
      '',
      {
        fontSize: '42px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#ff6b6b',
        strokeThickness: 6,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: '#ffd700',
          blur: 10,
          fill: true
        }
      }
    ).setOrigin(0.5).setVisible(false);

    // Match counter text (for color swap feature)
    this.matchCounterText = this.add.text(
      width - 20,
      headerY + 40,
      `Matches: 0/${this.COLOR_SWAP_THRESHOLD}`,
      {
        fontSize: smallFontSize,
        color: '#9b59b6',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(1, 0);

    // Color swap notification text
    this.colorSwapText = this.add.text(
      width / 2,
      this.cameras.main.height / 2,
      '',
      {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#9b59b6',
        strokeThickness: 5,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: '#e91e63',
          blur: 15,
          fill: true
        }
      }
    ).setOrigin(0.5).setVisible(false);

    // Create achievement notification container
    this.createAchievementNotification();

    // Beautiful game over panel
    const gameOverPanel = this.add.graphics();
    gameOverPanel.fillStyle(0x1a1a2e, 0.95);
    gameOverPanel.fillRoundedRect(
      width / 2 - 150,
      this.cameras.main.height / 2 - 100,
      300,
      200,
      20
    );
    gameOverPanel.lineStyle(3, 0x4a90e2, 0.8);
    gameOverPanel.strokeRoundedRect(
      width / 2 - 150,
      this.cameras.main.height / 2 - 100,
      300,
      200,
      20
    );
    gameOverPanel.setVisible(false);

    this.gameOverText = this.add.text(
      width / 2,
      this.cameras.main.height / 2,
      '',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 8,
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setVisible(false);
  }

  private createParticleEffects() {
    // Create beautiful enhanced particle emitters for match effects
    const colors = [
      { color: 0xff3838, glow: 0xff6b6b }, // Red
      { color: 0x1e88e5, glow: 0x42a5f5 }, // Blue
      { color: 0x43a047, glow: 0x66bb6a }, // Green
      { color: 0xfdd835, glow: 0xffeb3b }, // Yellow
      { color: 0x8e24aa, glow: 0xab47bc }, // Purple
      { color: 0xfb8c00, glow: 0xff9800 }  // Orange
    ];

    colors.forEach(({ color, glow }) => {
      // Main particle emitter
      const emitter = this.add.particles(0, 0, 'particle', {
        speed: { min: 100, max: 250 },
        scale: { start: 1.2, end: 0 },
        blendMode: 'ADD',
        tint: [color, glow],
        lifespan: 600,
        quantity: 12,
        gravityY: 150,
        angle: { min: -110, max: -70 },
        rotate: { min: 0, max: 360 },
        alpha: { start: 1, end: 0 }
      });
      emitter.stop();
      this.particleEmitters.push(emitter);

      // Secondary glow emitter for extra flair
      const glowEmitter = this.add.particles(0, 0, 'particle', {
        speed: { min: 50, max: 120 },
        scale: { start: 0.8, end: 0.2 },
        blendMode: 'ADD',
        tint: glow,
        lifespan: 800,
        quantity: 8,
        gravityY: 80,
        alpha: { start: 0.8, end: 0 }
      });
      glowEmitter.stop();
      this.particleEmitters.push(glowEmitter);
    });

    // Create special star emitter for combos with rainbow effect
    const starEmitter = this.add.particles(0, 0, 'star_particle', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.5, end: 0 },
      blendMode: 'ADD',
      tint: [0xffff00, 0xff6b6b, 0x4ecdc4, 0x9b59b6, 0x2ecc71],
      lifespan: 1000,
      quantity: 20,
      gravityY: -30,
      angle: { min: 0, max: 360 },
      rotate: { min: 0, max: 360 },
      alpha: { start: 1, end: 0 }
    });
    starEmitter.stop();
    this.particleEmitters.push(starEmitter);

    // Sparkle emitter for tile selection and hover
    const sparkleEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 20, max: 50 },
      scale: { start: 0.4, end: 0 },
      blendMode: 'ADD',
      tint: 0xffffff,
      lifespan: 400,
      quantity: 5,
      alpha: { start: 0.8, end: 0 }
    });
    sparkleEmitter.stop();
    this.particleEmitters.push(sparkleEmitter);
  }

  private createAchievementNotification() {
    const width = this.cameras.main.width;

    // Container for achievement notification
    this.achievementNotification = this.add.container(width / 2, -100);

    // Background panel
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.95);
    bg.fillRoundedRect(-150, 0, 300, 80, 10);
    bg.lineStyle(2, 0xf39c12, 1);
    bg.strokeRoundedRect(-150, 0, 300, 80, 10);

    // Icon text
    const icon = this.add.text(-130, 20, '', {
      fontSize: '32px',
      fontFamily: 'Arial, sans-serif'
    });

    // Achievement title
    const title = this.add.text(-90, 15, '', {
      fontSize: '18px',
      color: '#f39c12',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    });

    // Achievement description
    const desc = this.add.text(-90, 38, '', {
      fontSize: '14px',
      color: '#ecf0f1',
      fontFamily: 'Arial, sans-serif'
    });

    this.achievementNotification.add([bg, icon, title, desc]);
    this.achievementNotification.setData('icon', icon);
    this.achievementNotification.setData('title', title);
    this.achievementNotification.setData('desc', desc);
    this.achievementNotification.setDepth(1000);
    this.achievementNotification.setVisible(false);
  }

  private setupInput() {
    this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
      if (this.isAnimating || this.gameState.gameStatus !== 'playing') return;

      const gridX = gameObject.getData('gridX');
      const gridY = gameObject.getData('gridY');

      this.handleTileClick({ x: gridX, y: gridY });

      // Haptic feedback for mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    });
  }

  private handleTileClick(position: GridPosition) {
    if (!this.gameState.selectedTile) {
      // Select first tile
      this.selectTile(position);
    } else {
      // Try to swap with selected tile
      this.attemptSwap(this.gameState.selectedTile, position);
    }
  }

  private selectTile(position: GridPosition) {
    this.gameState.selectedTile = position;
    
    // Visual feedback with enhanced animation
    const sprite = this.tileSprites[position.y][position.x];
    this.selectedTileSprite = sprite;
    
    // Highlight selected tile with pulsing glow
    this.tweens.add({
      targets: sprite,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Add glow effect
    sprite.setTint(0xffffff);
    
    this.playSound('select');
  }

  private deselectTile() {
    if (this.selectedTileSprite) {
      this.tweens.killTweensOf(this.selectedTileSprite);
      this.selectedTileSprite.setScale(1);
      this.selectedTileSprite.clearTint();
      this.selectedTileSprite = null;
    }
    this.gameState.selectedTile = null;
  }

  private async attemptSwap(pos1: GridPosition, pos2: GridPosition) {
    if (!this.gameLogic.canSwapTiles(pos1, pos2)) {
      this.deselectTile();
      return;
    }

    const tile1 = this.gameState.grid[pos1.y][pos1.x];
    const tile2 = this.gameState.grid[pos2.y][pos2.x];

    // Check if either tile is special
    const isSpecial1 = this.gameLogic.isSpecialTile(tile1);
    const isSpecial2 = this.gameLogic.isSpecialTile(tile2);

    if (isSpecial1 || isSpecial2) {
      // Handle special tile activation
      await this.handleSpecialTileSwap(pos1, pos2, tile1, tile2);
      return;
    }

    // Check if swap would create matches
    if (!this.gameLogic.wouldCreateMatches(this.gameState.grid, pos1, pos2)) {
      // Invalid move - animate back with better feedback
      await this.animateInvalidSwap(pos1, pos2);
      this.deselectTile();
      this.playSound('invalid');
      return;
    }

    // Valid move
    this.isAnimating = true;
    this.deselectTile();

    // Perform swap
    this.gameState.grid = this.gameLogic.swapTiles(this.gameState.grid, pos1, pos2);
    this.gameState.moves--;
    this.comboCount = 0;

    // Animate swap with improved easing
    await this.animateSwap(pos1, pos2);

    // Update moves display
    this.updateUI();

    // Play sound
    this.playSound('swap');

    // Check for matches and cascades
    this.isAnimating = false;
    // Use setTimeout to allow browser to render the swap
    setTimeout(() => this.checkForMatches(), 50);
  }

  private async handleSpecialTileSwap(
    pos1: GridPosition,
    pos2: GridPosition,
    tile1: GameTile,
    tile2: GameTile
  ) {
    this.isAnimating = true;
    this.deselectTile();
    this.gameState.moves--;

    // Determine which tile is special
    const specialPos = this.gameLogic.isSpecialTile(tile1) ? pos1 : pos2;
    const specialTile = this.gameLogic.isSpecialTile(tile1) ? tile1 : tile2;
    const otherTile = this.gameLogic.isSpecialTile(tile1) ? tile2 : tile1;

    // Get affected positions
    let affectedPositions: GridPosition[] = [];

    if (specialTile.special === SpecialTileEffect.RAINBOW) {
      // Rainbow clears all tiles of the other tile's color
      affectedPositions = this.getAllTilesOfType(otherTile.type);
      // Add the rainbow tile itself
      affectedPositions.push(specialPos);
    } else {
      affectedPositions = this.gameLogic.activateSpecialTile(this.gameState.grid, specialPos);
    }

    this.specialActivations++;

    // Animate special effect
    if (specialTile.special) {
      await this.animateSpecialTileEffect(specialPos, specialTile.special, affectedPositions);
    }

    // Clean up overlays for affected tiles before removing them
    affectedPositions.forEach(pos => {
      this.destroyTileOverlay(pos);
    });

    // Remove affected tiles
    this.gameState.grid = this.gameLogic.removeTilesAtPositions(this.gameState.grid, affectedPositions);

    // Apply gravity
    const { grid, animations } = this.gameLogic.applyGravity(this.gameState.grid);
    this.gameState.grid = grid;

    if (animations.length > 0) {
      await this.animateFalling(animations);
    }

    this.updateUI();
    this.playSound('match');

    this.isAnimating = false;
    // Use setTimeout to prevent stack overflow and give browser time to render
    setTimeout(() => this.checkForMatches(), 50);
  }

  private getAllTilesOfType(tileType: TileType): GridPosition[] {
    const positions: GridPosition[] = [];
    const { width, height } = this.gameLogic.getGridDimensions();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = this.gameState.grid[y][x];
        if (tile.type === tileType && tile.type !== TileType.EMPTY) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  private async animateSpecialTileEffect(
    position: GridPosition,
    special: SpecialTileEffect,
    affectedPositions: GridPosition[]
  ): Promise<void> {
    return new Promise(resolve => {
      const sprite = this.tileSprites[position.y][position.x];

      // Create explosion effect at origin
      const emitter = this.particleEmitters[this.particleEmitters.length - 1]; // Star emitter
      emitter.setPosition(sprite.x, sprite.y);
      emitter.explode(30);

      // Visual effect based on type
      switch (special) {
        case SpecialTileEffect.BOMB:
          this.createBombExplosion(sprite.x, sprite.y);
          break;
        case SpecialTileEffect.ROCKET_H:
          this.createRocketEffect(sprite.x, sprite.y, 'horizontal');
          break;
        case SpecialTileEffect.ROCKET_V:
          this.createRocketEffect(sprite.x, sprite.y, 'vertical');
          break;
        case SpecialTileEffect.RAINBOW:
          this.createRainbowEffect(affectedPositions);
          break;
      }

      // Animate affected tiles
      let completedAnimations = 0;
      affectedPositions.forEach((pos, index) => {
        setTimeout(() => {
          const affectedSprite = this.tileSprites[pos.y][pos.x];

          // Particle effect
          const particleEmitter = this.particleEmitters[index % (this.particleEmitters.length - 1)];
          particleEmitter.setPosition(affectedSprite.x, affectedSprite.y);
          particleEmitter.explode();

          // Shrink animation
          this.tweens.add({
            targets: affectedSprite,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            rotation: Math.PI,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              completedAnimations++;
              if (completedAnimations === affectedPositions.length) {
                resolve();
              }
            }
          });
        }, index * 50);
      });

      // If no affected tiles, resolve immediately
      if (affectedPositions.length === 0) {
        setTimeout(() => resolve(), 500);
      }
    });
  }

  private createBombExplosion(x: number, y: number) {
    // Create expanding circle effect
    const explosion = this.add.circle(x, y, 10, 0xff6b00, 0.8);

    this.tweens.add({
      targets: explosion,
      radius: 100,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => explosion.destroy()
    });

    // Screen shake
    this.cameras.main.shake(300, 0.01);
  }

  private createRocketEffect(x: number, y: number, direction: 'horizontal' | 'vertical') {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    if (direction === 'horizontal') {
      // Horizontal beam
      const beam = this.add.rectangle(width / 2, y, width, 10, 0xff3838, 0.8);
      this.tweens.add({
        targets: beam,
        alpha: 0,
        height: 30,
        duration: 500,
        ease: 'Power2',
        onComplete: () => beam.destroy()
      });
    } else {
      // Vertical beam
      const beam = this.add.rectangle(x, height / 2, 10, height, 0x1e88e5, 0.8);
      this.tweens.add({
        targets: beam,
        alpha: 0,
        width: 30,
        duration: 500,
        ease: 'Power2',
        onComplete: () => beam.destroy()
      });
    }

    // Screen shake
    this.cameras.main.shake(200, 0.005);
  }

  private createRainbowEffect(positions: GridPosition[]) {
    // Create rainbow wave emanating outward
    positions.forEach((pos, index) => {
      const sprite = this.tileSprites[pos.y][pos.x];
      const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
      const color = colors[index % colors.length];

      const circle = this.add.circle(sprite.x, sprite.y, 5, color, 0.8);
      this.tweens.add({
        targets: circle,
        radius: 40,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => circle.destroy()
      });
    });
  }

  private async checkForMatches() {
    // Prevent multiple simultaneous calls
    if (this.isAnimating) return;

    const matches = this.gameLogic.findAllMatches(this.gameState.grid);

    if (matches.length > 0) {
      this.isAnimating = true;

      // Track matches for color swap feature
      this.matchesSinceColorSwap++;
      this.totalMatches += matches.length;

      // Check for special tile creation before removing matches
      const specialTilesToCreate: Array<{ position: GridPosition; special: SpecialTileEffect; tileType: TileType }> = [];

      matches.forEach(match => {
        const specialInfo = this.gameLogic.detectSpecialTileCreation(match);
        if (specialInfo) {
          const tileType = match.type;
          specialTilesToCreate.push({
            position: specialInfo.position,
            special: specialInfo.special,
            tileType
          });

          // Mark match with special tile info for scoring
          match.special = specialInfo.special;

          // Track achievements
          switch (specialInfo.special) {
            case SpecialTileEffect.BOMB:
              const bombAchievements = this.achievementManager.updateStats('bomb', 1);
              this.showAchievements(bombAchievements);
              break;
            case SpecialTileEffect.ROCKET_H:
            case SpecialTileEffect.ROCKET_V:
              const rocketAchievements = this.achievementManager.updateStats('rocket', 1);
              this.showAchievements(rocketAchievements);
              break;
            case SpecialTileEffect.RAINBOW:
              const rainbowAchievements = this.achievementManager.updateStats('rainbow', 1);
              this.showAchievements(rainbowAchievements);
              break;
          }
        }

        // Track massive matches
        if (match.length >= 6) {
          const massiveAchievements = this.achievementManager.updateStats('massiveMatch', 1);
          this.showAchievements(massiveAchievements);
        }
      });

      // Calculate and add score
      const score = this.gameLogic.calculateScore(matches, this.comboCount, this.specialActivations);
      this.gameState.score += score;
      this.comboCount++;

      // Track achievements
      const matchAchievements = this.achievementManager.updateStats('match', matches.length);
      const scoreAchievements = this.achievementManager.updateStats('score', this.gameState.score);
      const comboAchievements = this.achievementManager.updateStats('combo', this.comboCount);
      this.showAchievements([...matchAchievements, ...scoreAchievements, ...comboAchievements]);

      // Show combo text for multiple matches
      if (this.comboCount > 1) {
        this.showComboText(this.comboCount, score);
      }

      // Animate matches with enhanced effects
      await this.animateMatches(matches);

      // Remove matched tiles
      this.gameState.grid = this.gameLogic.removeMatches(this.gameState.grid, matches);

      // Create special tiles
      specialTilesToCreate.forEach(({ position, special, tileType }) => {
        this.gameState.grid = this.gameLogic.createSpecialTile(
          this.gameState.grid,
          position,
          special,
          tileType
        );
      });

      // Apply gravity
      const { grid, animations } = this.gameLogic.applyGravity(this.gameState.grid);
      this.gameState.grid = grid;

      // Animate falling tiles
      if (animations.length > 0) {
        await this.animateFalling(animations);
      }

      // Update UI with score animation
      this.updateUI();
      this.animateScoreIncrease(score);

      this.playSound('match');

      // Check for color swap trigger
      if (this.matchesSinceColorSwap >= this.COLOR_SWAP_THRESHOLD) {
        await this.triggerColorSwap();
      }

      this.isAnimating = false;
      this.specialActivations = 0; // Reset after scoring

      // Check for more matches (cascade) with a small delay
      // Use setTimeout to prevent stack overflow and allow browser to render
      setTimeout(() => {
        if (!this.isAnimating) {
          this.checkForMatches();
        }
      }, 100);
    } else {
      // No more matches, reset combo and check game state
      this.comboCount = 0;
      this.checkGameState();
    }
  }

  private showComboText(combo: number, score: number) {
    const texts = [
      '', // 0
      '', // 1
      'NICE!', // 2
      'GREAT!', // 3
      'AMAZING!', // 4
      'FANTASTIC!', // 5
      'INCREDIBLE!' // 6+
    ];
    
    const text = texts[Math.min(combo, texts.length - 1)] || 'LEGENDARY!';
    
    this.comboText.setText(`${text}\n+${score}`);
    this.comboText.setVisible(true);
    this.comboText.setAlpha(1);
    this.comboText.setY(this.cameras.main.height / 2 - 100);
    
    // Animate combo text
    this.tweens.add({
      targets: this.comboText,
      y: this.cameras.main.height / 2 - 150,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 800,
      ease: 'Back.easeOut'
    });
  }

  private animateScoreIncrease(scoreIncrease: number) {
    // Create floating score text
    const floatingScore = this.add.text(
      this.scoreText.x + this.scoreText.width + 10,
      this.scoreText.y,
      `+${scoreIncrease}`,
      {
        fontSize: '18px',
        color: '#2ecc71',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }
    );
    
    this.tweens.add({
      targets: floatingScore,
      y: floatingScore.y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => floatingScore.destroy()
    });
    
    // Pulse score text
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }

  // ... (continue with the rest of the methods)
  // Note: I'll continue with the remaining methods in the next part due to length

  private async animateSwap(pos1: GridPosition, pos2: GridPosition): Promise<void> {
    return new Promise(resolve => {
      const sprite1 = this.tileSprites[pos1.y][pos1.x];
      const sprite2 = this.tileSprites[pos2.y][pos2.x];

      // Get overlays if they exist
      const overlay1 = sprite1.getData('overlay');
      const overlay2 = sprite2.getData('overlay');

      const targetX1 = this.GRID_OFFSET_X + pos2.x * (this.TILE_SIZE + this.TILE_SPACING);
      const targetY1 = this.GRID_OFFSET_Y + pos2.y * (this.TILE_SIZE + this.TILE_SPACING);
      const targetX2 = this.GRID_OFFSET_X + pos1.x * (this.TILE_SIZE + this.TILE_SPACING);
      const targetY2 = this.GRID_OFFSET_Y + pos1.y * (this.TILE_SIZE + this.TILE_SPACING);

      let completedTweens = 0;
      const onComplete = () => {
        completedTweens++;
        if (completedTweens === 2) {
          // Swap sprites in array
          this.tileSprites[pos1.y][pos1.x] = sprite2;
          this.tileSprites[pos2.y][pos2.x] = sprite1;

          // Update sprite data
          sprite1.setData('gridX', pos2.x).setData('gridY', pos2.y);
          sprite2.setData('gridX', pos1.x).setData('gridY', pos1.y);

          resolve();
        }
      };

      // Animate sprite1 and its overlay
      this.tweens.add({
        targets: sprite1,
        x: targetX1,
        y: targetY1,
        duration: 250,
        ease: 'Back.easeOut',
        onComplete
      });

      if (overlay1) {
        this.tweens.add({
          targets: overlay1,
          x: targetX1,
          y: targetY1,
          duration: 250,
          ease: 'Back.easeOut'
        });
      }

      // Animate sprite2 and its overlay
      this.tweens.add({
        targets: sprite2,
        x: targetX2,
        y: targetY2,
        duration: 250,
        ease: 'Back.easeOut',
        onComplete
      });

      if (overlay2) {
        this.tweens.add({
          targets: overlay2,
          x: targetX2,
          y: targetY2,
          duration: 250,
          ease: 'Back.easeOut'
        });
      }
    });
  }

  private async animateInvalidSwap(pos1: GridPosition, pos2: GridPosition): Promise<void> {
    return new Promise(resolve => {
      const sprite1 = this.tileSprites[pos1.y][pos1.x];
      const sprite2 = this.tileSprites[pos2.y][pos2.x];
      
      const targetX1 = this.GRID_OFFSET_X + pos2.x * (this.TILE_SIZE + this.TILE_SPACING);
      const targetY1 = this.GRID_OFFSET_Y + pos2.y * (this.TILE_SIZE + this.TILE_SPACING);
      const targetX2 = this.GRID_OFFSET_X + pos1.x * (this.TILE_SIZE + this.TILE_SPACING);
      const targetY2 = this.GRID_OFFSET_Y + pos1.y * (this.TILE_SIZE + this.TILE_SPACING);
      
      // Shake effect for invalid move
      this.tweens.add({
        targets: [sprite1, sprite2],
        x: '+=5',
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });
      
      // Move towards each other, then back with bounce
      this.tweens.add({
        targets: sprite1,
        x: targetX1,
        y: targetY1,
        duration: 150,
        ease: 'Power2',
        yoyo: true,
        repeat: 1
      });
      
      this.tweens.add({
        targets: sprite2,
        x: targetX2,
        y: targetY2,
        duration: 150,
        ease: 'Power2',
        yoyo: true,
        repeat: 1,
        onComplete: () => resolve()
      });
    });
  }

  private async animateMatches(matches: MatchResult[]): Promise<void> {
    return new Promise(resolve => {
      let completedAnimations = 0;
      const totalAnimations = matches.reduce((sum, match) => sum + match.tiles.length, 0);

      matches.forEach(match => {
        match.tiles.forEach((pos, index) => {
          const sprite = this.tileSprites[pos.y][pos.x];

          // Clean up overlay before animating destruction
          this.destroyTileOverlay(pos);

          // Enhanced particle effect
          const emitterIndex = this.comboCount > 3 ?
            this.particleEmitters.length - 1 : // Use star emitter for high combos
            Math.floor(Math.random() * (this.particleEmitters.length - 1));
          const emitter = this.particleEmitters[emitterIndex];
          emitter.setPosition(sprite.x, sprite.y);
          emitter.explode();

          // Staggered animation for better visual effect
          setTimeout(() => {
            // Scale down and fade out with rotation
            this.tweens.add({
              targets: sprite,
              scaleX: 0,
              scaleY: 0,
              alpha: 0,
              rotation: Math.PI * 2,
              duration: 400,
              ease: 'Back.easeIn',
              onComplete: () => {
                completedAnimations++;
                if (completedAnimations === totalAnimations) {
                  resolve();
                }
              }
            });
          }, index * 50);
        });
      });
    });
  }

  private async animateFalling(animations: TileAnimation[]): Promise<void> {
    return new Promise(resolve => {
      if (animations.length === 0) {
        resolve();
        return;
      }

      let completedAnimations = 0;

      animations.forEach((animation, index) => {
        const { tile, toX, toY, duration } = animation;
        const sprite = this.tileSprites[tile.y][tile.x];

        // Get overlay before cleaning up
        const overlay = sprite.getData('overlay');

        // Update sprite texture
        sprite.setTexture(`tile_${tile.type}`);
        sprite.setAlpha(1);
        sprite.setScale(1);
        sprite.setRotation(0);

        // Animate to final position with bounce
        const targetX = this.GRID_OFFSET_X + toX * (this.TILE_SIZE + this.TILE_SPACING);
        const targetY = this.GRID_OFFSET_Y + toY * (this.TILE_SIZE + this.TILE_SPACING);

        setTimeout(() => {
          this.tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            duration: Math.min(duration * 0.8, 600),
            ease: 'Bounce.easeOut',
            onComplete: () => {
              tile.falling = false;
              completedAnimations++;
              if (completedAnimations === animations.length) {
                resolve();
              }
            }
          });

          // Animate overlay if it exists
          if (overlay) {
            this.tweens.add({
              targets: overlay,
              x: targetX,
              y: targetY,
              duration: Math.min(duration * 0.8, 600),
              ease: 'Bounce.easeOut'
            });
          }
        }, index * 30);
      });
    });
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.gameState.score}`);
    this.movesText.setText(`Moves: ${this.gameState.moves}`);
    this.matchCounterText.setText(`Matches: ${this.matchesSinceColorSwap}/${this.COLOR_SWAP_THRESHOLD}`);

    // Update moves text color based on remaining moves
    if (this.gameState.moves <= 5) {
      this.movesText.setColor('#e74c3c');
    } else if (this.gameState.moves <= 10) {
      this.movesText.setColor('#f39c12');
    } else {
      this.movesText.setColor('#ffffff');
    }

    // Update sprites to match game state
    for (let y = 0; y < this.gameState.grid.length; y++) {
      for (let x = 0; x < this.gameState.grid[y].length; x++) {
        const tile = this.gameState.grid[y][x];
        const sprite = this.tileSprites[y][x];

        if (tile.type === TileType.EMPTY) {
          // Clean up overlay if tile is now empty
          this.destroyTileOverlay({ x, y });
          sprite.setTexture('tile_empty').setAlpha(0.5);
        } else {
          sprite.setTexture(`tile_${tile.type}`).setAlpha(1);

          // Add special tile overlay if applicable (only if not already present)
          const hasOverlay = sprite.getData('overlay') !== null && sprite.getData('overlay') !== undefined;
          if (tile.special && !hasOverlay) {
            this.addSpecialTileOverlay(sprite, tile.special);
          } else if (!tile.special && hasOverlay) {
            // Remove overlay if tile is no longer special
            this.destroyTileOverlay({ x, y });
          }
        }
      }
    }
  }

  private destroyTileOverlay(position: GridPosition) {
    if (!this.isValidPosition(position)) return;

    const sprite = this.tileSprites[position.y][position.x];
    if (!sprite) return;

    const existingOverlay = sprite.getData('overlay');
    if (existingOverlay) {
      // Kill all tweens on the overlay before destroying
      this.tweens.killTweensOf(existingOverlay);
      existingOverlay.destroy();
      sprite.setData('overlay', null);
    }
  }

  private addSpecialTileOverlay(sprite: Phaser.GameObjects.Sprite, special: SpecialTileEffect) {
    // Remove any existing overlay
    const existingOverlay = sprite.getData('overlay');
    if (existingOverlay) {
      this.tweens.killTweensOf(existingOverlay);
      existingOverlay.destroy();
      sprite.setData('overlay', null);
    }

    let overlayTexture = '';
    switch (special) {
      case SpecialTileEffect.BOMB:
        overlayTexture = 'bomb_overlay';
        break;
      case SpecialTileEffect.ROCKET_H:
      case SpecialTileEffect.ROCKET_V:
        overlayTexture = 'rocket_overlay';
        break;
      case SpecialTileEffect.RAINBOW:
        overlayTexture = 'rainbow_overlay';
        break;
    }

    if (overlayTexture) {
      const overlay = this.add.sprite(sprite.x, sprite.y, overlayTexture);
      overlay.setDepth(sprite.depth + 1);
      sprite.setData('overlay', overlay);

      // Pulsing animation for special tiles
      this.tweens.add({
        targets: overlay,
        scale: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private isValidPosition(pos: GridPosition): boolean {
    const { width, height } = this.gameLogic.getGridDimensions();
    return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
  }

  private async triggerColorSwap(): Promise<void> {
    return new Promise(resolve => {
      // Reset counter
      this.matchesSinceColorSwap = 0;
      this.updateUI();

      // Track achievement
      const swapAchievements = this.achievementManager.updateStats('colorSwap', 1);
      this.showAchievements(swapAchievements);

      // Show dramatic announcement
      this.colorSwapText.setText('🎨 COLOR SWAP! 🎨');
      this.colorSwapText.setVisible(true);
      this.colorSwapText.setAlpha(1);
      this.colorSwapText.setScale(0.5);

      this.tweens.add({
        targets: this.colorSwapText,
        scale: 1.3,
        alpha: 1,
        duration: 500,
        ease: 'Back.easeOut',
        onComplete: () => {
          setTimeout(() => {
            // Perform the color swap
            const { grid } = this.gameLogic.shuffleTileColors(this.gameState.grid);
            this.gameState.grid = grid;

            // Animate the color change
            this.animateColorSwap().then(() => {
              // Hide text
              this.tweens.add({
                targets: this.colorSwapText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                  this.colorSwapText.setVisible(false);
                  resolve();
                }
              });
            });
          }, 1000);
        }
      });

      this.playSound('victory'); // Celebratory sound
    });
  }

  private async animateColorSwap(): Promise<void> {
    return new Promise(resolve => {
      const { width, height } = this.gameLogic.getGridDimensions();
      let completedAnimations = 0;
      const totalTiles = width * height;

      // Animate each tile with a wave effect
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const tile = this.gameState.grid[y][x];
          const sprite = this.tileSprites[y][x];
          const delay = (x + y) * 30;

          setTimeout(() => {
            // Rotate and update texture
            this.tweens.add({
              targets: sprite,
              rotation: Math.PI * 2,
              scaleX: 0,
              scaleY: 0,
              duration: 300,
              ease: 'Power2',
              onComplete: () => {
                // Update texture
                if (tile.type !== TileType.EMPTY) {
                  sprite.setTexture(`tile_${tile.type}`);
                }

                // Scale back up
                this.tweens.add({
                  targets: sprite,
                  scaleX: 1,
                  scaleY: 1,
                  rotation: 0,
                  duration: 300,
                  ease: 'Back.easeOut',
                  onComplete: () => {
                    completedAnimations++;
                    if (completedAnimations === totalTiles) {
                      resolve();
                    }
                  }
                });
              }
            });
          }, delay);
        }
      }
    });
  }

  private showAchievements(achievements: Achievement[]) {
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        this.displayAchievement(achievement);

        // Save achievements
        this.achievementManager.saveToStorage();
      }, index * 3000); // Stagger multiple achievements
    });
  }

  private displayAchievement(achievement: Achievement) {
    const icon = this.achievementNotification.getData('icon') as Phaser.GameObjects.Text;
    const title = this.achievementNotification.getData('title') as Phaser.GameObjects.Text;
    const desc = this.achievementNotification.getData('desc') as Phaser.GameObjects.Text;

    icon.setText(achievement.icon);
    title.setText(achievement.name);
    desc.setText(achievement.description);

    this.achievementNotification.setVisible(true);

    // Slide down animation
    this.tweens.add({
      targets: this.achievementNotification,
      y: 100,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Wait and slide back up
        setTimeout(() => {
          this.tweens.add({
            targets: this.achievementNotification,
            y: -100,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
              this.achievementNotification.setVisible(false);
            }
          });
        }, 2500);
      }
    });

    this.playSound('victory');

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  private checkGameState() {
    // Check win condition
    if (this.gameState.score >= this.gameState.targetScore) {
      this.gameState.gameStatus = 'levelComplete';
      this.showLevelComplete();
      return;
    }
    
    // Check lose condition
    if (this.gameState.moves <= 0) {
      // Check if there are any possible moves
      if (!this.gameLogic.hasPossibleMoves(this.gameState.grid)) {
        this.gameState.gameStatus = 'gameOver';
        this.showGameOver();
        return;
      }
    }
    
    // Check if no moves left
    if (this.gameState.moves <= 0) {
      this.gameState.gameStatus = 'gameOver';
      this.showGameOver();
    }
  }

  private showLevelComplete() {
    this.playSound('victory');
    
    // Celebration particle effect
    this.particleEmitters.forEach(emitter => {
      emitter.setPosition(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2
      );
      emitter.explode();
    });
    
    this.gameOverText.setText(`🎉 Level Complete! 🎉\n\nScore: ${this.gameState.score}\nTarget: ${this.gameState.targetScore}\n\nTap to continue`)
      .setVisible(true)
      .setInteractive({ useHandCursor: true })
      .once('pointerdown', () => {
        this.scene.restart({ levelConfig: this.getNextLevelConfig() });
      });
  }

  private showGameOver() {
    this.playSound('gameOver');
    
    const message = this.gameState.score >= this.gameState.targetScore / 2 ?
      `💯 Good Try! 💯\n\nFinal Score: ${this.gameState.score}\nTarget: ${this.gameState.targetScore}\nMatches: ${this.totalMatches}\n\nTap to try again` :
      `🎮 Game Over 🎮\n\nFinal Score: ${this.gameState.score}\nTarget: ${this.gameState.targetScore}\nMatches: ${this.totalMatches}\n\nTap to restart`;
    
    this.gameOverText.setText(message)
      .setVisible(true)
      .setInteractive({ useHandCursor: true })
      .once('pointerdown', () => {
        this.scene.restart({ levelConfig: this.levelConfig });
      });
  }

  private startNewGame() {
    this.gameState.grid = this.gameLogic.initializeGrid();
    this.totalMatches = 0;
    this.matchesSinceColorSwap = 0;
    this.specialActivations = 0;

    // Track game start achievement
    const gameAchievements = this.achievementManager.updateStats('game', 1);
    this.showAchievements(gameAchievements);

    this.updateUI();
  }

  private handleResize() {
    // Responsive layout adjustments
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Adjust UI positions for different screen sizes
    if (width < 600) {
      this.scoreText.setFontSize('18px');
      this.movesText.setFontSize('14px');
      this.targetScoreText.setFontSize('14px');
    }
  }

  private playSound(type: string) {
    if (!this.audioEnabled || !this.audioContext) return;
    
    try {
      // Create procedural sounds using Web Audio API
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      let frequency = 440;
      let duration = 0.1;
      
      switch (type) {
        case 'select':
          frequency = 800;
          duration = 0.1;
          break;
        case 'swap':
          frequency = 600;
          duration = 0.2;
          break;
        case 'match':
          frequency = 1000;
          duration = 0.3;
          break;
        case 'invalid':
          frequency = 200;
          duration = 0.15;
          break;
        case 'victory':
          frequency = 1200;
          duration = 0.5;
          break;
        case 'gameOver':
          frequency = 150;
          duration = 0.4;
          break;
      }
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  public activateAudio() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.audioEnabled = true;
        this.playSound('select'); // Test sound
      });
    }
  }

  private initializeGameState() {
    this.gameState = {
      grid: [],
      score: 0,
      moves: this.levelConfig.maxMoves,
      level: this.levelConfig.level,
      targetScore: this.levelConfig.targetScore,
      maxMoves: this.levelConfig.maxMoves,
      gameStatus: 'playing',
      selectedTile: null,
      animating: false
    };
  }

  private getDefaultLevelConfig(): LevelConfig {
    return {
      level: 1,
      targetScore: 1000,
      maxMoves: 25,
      gridWidth: 8,
      gridHeight: 8,
      tileTypes: [TileType.RED, TileType.BLUE, TileType.GREEN, TileType.YELLOW, TileType.PURPLE]
    };
  }

  private getNextLevelConfig(): LevelConfig {
    const nextLevel = this.levelConfig.level + 1;
    return {
      ...this.levelConfig,
      level: nextLevel,
      targetScore: Math.floor(this.levelConfig.targetScore * 1.3),
      maxMoves: Math.max(15, this.levelConfig.maxMoves - 1),
      tileTypes: nextLevel > 3 ? 
        [TileType.RED, TileType.BLUE, TileType.GREEN, TileType.YELLOW, TileType.PURPLE, TileType.ORANGE] :
        [TileType.RED, TileType.BLUE, TileType.GREEN, TileType.YELLOW, TileType.PURPLE]
    };
  }
}