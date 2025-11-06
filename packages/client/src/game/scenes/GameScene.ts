import Phaser from 'phaser';
import { GameLogic } from '../utils/GameLogic';
import {
  GameTile,
  TileType,
  GridPosition,
  GameState,
  LevelConfig,
  MatchResult,
  TileAnimation
} from '../../types/game';

/**
 * Main game scene for Match-3 gameplay
 * Handles rendering, animations, and user interactions
 * Enhanced with smooth animations and better UX
 */
export class GameScene extends Phaser.Scene {
  private gameLogic!: GameLogic;
  private gameState!: GameState;
  private levelConfig!: LevelConfig;
  
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
  
  // Audio - with fallback system
  private audioEnabled = false;
  private audioContext: AudioContext | null = null;
  
  // Animation state
  private isAnimating = false;
  private comboCount = 0;
  private totalMatches = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelConfig: LevelConfig }) {
    this.levelConfig = data.levelConfig || this.getDefaultLevelConfig();
    this.gameLogic = new GameLogic(this.levelConfig);
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
    // Update animations and check for cascading matches
    if (!this.isAnimating) {
      this.checkForMatches();
    }
    
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
    // Create gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    // Add animated stars
    for (let i = 0; i < 20; i++) {
      const star = this.add.circle(
        Math.random() * this.cameras.main.width,
        Math.random() * this.cameras.main.height,
        Math.random() * 2 + 1,
        0xffffff,
        Math.random() * 0.5 + 0.2
      );
      
      this.tweens.add({
        targets: star,
        alpha: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 2000 + 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
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
    const tileColors = {
      [TileType.RED]: { main: 0xe74c3c, highlight: 0xec7063, shadow: 0xc0392b },
      [TileType.BLUE]: { main: 0x3498db, highlight: 0x5dade2, shadow: 0x2980b9 },
      [TileType.GREEN]: { main: 0x2ecc71, highlight: 0x58d68d, shadow: 0x27ae60 },
      [TileType.YELLOW]: { main: 0xf1c40f, highlight: 0xf4d03f, shadow: 0xd4ac0d },
      [TileType.PURPLE]: { main: 0x9b59b6, highlight: 0xbb8fce, shadow: 0x8e44ad },
      [TileType.ORANGE]: { main: 0xe67e22, highlight: 0xf0b27a, shadow: 0xd68910 }
    };

    Object.entries(tileColors).forEach(([type, colors]) => {
      const graphics = this.add.graphics();
      
      // Shadow
      graphics.fillStyle(colors.shadow);
      graphics.fillRoundedRect(4, 6, this.TILE_SIZE - 8, this.TILE_SIZE - 8, 10);
      
      // Main tile body with gradient effect
      graphics.fillStyle(colors.main);
      graphics.fillRoundedRect(2, 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4, 10);
      
      // Highlight
      graphics.fillStyle(colors.highlight, 0.7);
      graphics.fillRoundedRect(6, 6, this.TILE_SIZE - 12, 20, 6);
      
      // Inner glow
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillRoundedRect(8, 8, this.TILE_SIZE - 16, this.TILE_SIZE - 16, 8);
      
      // Border
      graphics.lineStyle(2, 0x34495e);
      graphics.strokeRoundedRect(1, 1, this.TILE_SIZE - 2, this.TILE_SIZE - 2, 10);
      
      // Add gemstone pattern
      graphics.fillStyle(0xffffff, 0.6);
      const centerX = this.TILE_SIZE / 2;
      const centerY = this.TILE_SIZE / 2;
      graphics.fillTriangle(
        centerX, centerY - 8,
        centerX - 6, centerY + 4,
        centerX + 6, centerY + 4
      );
      
      graphics.generateTexture(`tile_${type}`, this.TILE_SIZE, this.TILE_SIZE);
      graphics.destroy();
    });
    
    // Enhanced empty tile texture
    const emptyGraphics = this.add.graphics();
    emptyGraphics.fillStyle(0x7f8c8d, 0.2);
    emptyGraphics.fillRoundedRect(2, 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4, 10);
    emptyGraphics.lineStyle(1, 0x95a5a6, 0.5);
    emptyGraphics.strokeRoundedRect(2, 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4, 10);
    emptyGraphics.generateTexture('tile_empty', this.TILE_SIZE, this.TILE_SIZE);
    emptyGraphics.destroy();
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
        
        // Add hover effect
        sprite.on('pointerover', () => {
          if (!this.isAnimating && this.gameState.gameStatus === 'playing') {
            sprite.setTint(0xdddddd);
          }
        });
        
        sprite.on('pointerout', () => {
          sprite.clearTint();
        });
        
        this.tileSprites[y][x] = sprite;
      }
    }
  }

  private createUI() {
    const headerY = 20;
    const fontSize = this.cameras.main.width < 600 ? '20px' : '24px';
    const smallFontSize = this.cameras.main.width < 600 ? '16px' : '18px';
    
    // Level display
    this.levelText = this.add.text(20, headerY, `Level ${this.gameState.level}`, {
      fontSize,
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    });
    
    // Score display with animation
    this.scoreText = this.add.text(20, headerY + 35, 'Score: 0', {
      fontSize,
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Moves display
    this.movesText = this.add.text(20, headerY + 70, `Moves: ${this.gameState.maxMoves}`, {
      fontSize: smallFontSize,
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Target score display
    this.targetScoreText = this.add.text(20, headerY + 95, `Target: ${this.gameState.targetScore}`, {
      fontSize: smallFontSize,
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Combo text (initially hidden)
    this.comboText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      '',
      {
        fontSize: '32px',
        color: '#f1c40f',
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5).setVisible(false);
    
    // Game over text (initially hidden)
    this.gameOverText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '',
      {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        align: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: { left: 20, right: 20, top: 15, bottom: 15 }
      }
    ).setOrigin(0.5).setVisible(false);
  }

  private createParticleEffects() {
    // Create enhanced particle emitters for match effects
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xe67e22];
    
    colors.forEach(color => {
      const emitter = this.add.particles(0, 0, 'particle', {
        speed: { min: 80, max: 200 },
        scale: { start: 0.8, end: 0 },
        blendMode: 'ADD',
        tint: color,
        lifespan: 500,
        quantity: 8,
        gravityY: 100
      });
      emitter.stop();
      this.particleEmitters.push(emitter);
    });
    
    // Create special star emitter for combos
    const starEmitter = this.add.particles(0, 0, 'star_particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [0xffff00, 0xff6b6b, 0x4ecdc4],
      lifespan: 800,
      quantity: 12,
      gravityY: -50
    });
    starEmitter.stop();
    this.particleEmitters.push(starEmitter);
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
    this.checkForMatches();
  }

  private async checkForMatches() {
    const matches = this.gameLogic.findAllMatches(this.gameState.grid);
    
    if (matches.length > 0) {
      this.isAnimating = true;
      
      // Calculate and add score
      const score = this.gameLogic.calculateScore(matches, this.comboCount);
      this.gameState.score += score;
      this.comboCount++;
      this.totalMatches += matches.length;
      
      // Show combo text for multiple matches
      if (this.comboCount > 1) {
        this.showComboText(this.comboCount, score);
      }
      
      // Animate matches with enhanced effects
      await this.animateMatches(matches);
      
      // Remove matched tiles
      this.gameState.grid = this.gameLogic.removeMatches(this.gameState.grid, matches);
      
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
      
      this.isAnimating = false;
      
      // Check for more matches (cascade)
      setTimeout(() => this.checkForMatches(), 150);
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
      
      this.tweens.add({
        targets: sprite1,
        x: targetX1,
        y: targetY1,
        duration: 250,
        ease: 'Back.easeOut',
        onComplete
      });
      
      this.tweens.add({
        targets: sprite2,
        x: targetX2,
        y: targetY2,
        duration: 250,
        ease: 'Back.easeOut',
        onComplete
      });
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
        
        // Update sprite texture
        sprite.setTexture(`tile_${tile.type}`);
        sprite.setAlpha(1);
        sprite.setScale(1);
        
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
        }, index * 30);
      });
    });
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.gameState.score}`);
    this.movesText.setText(`Moves: ${this.gameState.moves}`);
    
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
          sprite.setTexture('tile_empty').setAlpha(0.5);
        } else {
          sprite.setTexture(`tile_${tile.type}`).setAlpha(1);
        }
      }
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