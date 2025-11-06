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
 */
export class GameScene extends Phaser.Scene {
  private gameLogic!: GameLogic;
  private gameState!: GameState;
  private levelConfig!: LevelConfig;
  
  // Visual constants
  private readonly TILE_SIZE = 64;
  private readonly TILE_SPACING = 4;
  private readonly GRID_OFFSET_X = 50;
  private readonly GRID_OFFSET_Y = 150;
  
  // Game objects
  private tileSprites: Phaser.GameObjects.Sprite[][] = [];
  private selectedTileSprite: Phaser.GameObjects.Sprite | null = null;
  private particleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  
  // UI elements
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private targetScoreText!: Phaser.GameObjects.Text;
  private gameOverText!: Phaser.GameObjects.Text;
  
  // Audio
  private matchSound!: Phaser.Sound.BaseSound;
  private swapSound!: Phaser.Sound.BaseSound;
  private fallSound!: Phaser.Sound.BaseSound;
  
  // Animation state
  private isAnimating = false;
  private comboCount = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelConfig: LevelConfig }) {
    this.levelConfig = data.levelConfig || this.getDefaultLevelConfig();
    this.gameLogic = new GameLogic(this.levelConfig);
    this.initializeGameState();
  }

  preload() {
    // Create colored rectangles for tiles (minimalist design)
    this.createTileTextures();
    
    // Create particle texture for effects
    this.add.graphics()
      .fillStyle(0xffffff)
      .fillCircle(0, 0, 4)
      .generateTexture('particle', 8, 8);
    
    // Load or create sound placeholders
    this.createSoundPlaceholders();
  }

  create() {
    // Set up camera and background
    this.cameras.main.setBackgroundColor('#2c3e50');
    
    // Create game grid
    this.createGrid();
    
    // Create UI
    this.createUI();
    
    // Create particle systems
    this.createParticleEffects();
    
    // Set up input handlers
    this.setupInput();
    
    // Start game
    this.startNewGame();
  }

  update() {
    // Update animations and check for cascading matches
    if (!this.isAnimating) {
      this.checkForMatches();
    }
  }

  private createTileTextures() {
    const tileColors = {
      [TileType.RED]: 0xe74c3c,
      [TileType.BLUE]: 0x3498db,
      [TileType.GREEN]: 0x2ecc71,
      [TileType.YELLOW]: 0xf1c40f,
      [TileType.PURPLE]: 0x9b59b6,
      [TileType.ORANGE]: 0xe67e22
    };

    Object.entries(tileColors).forEach(([type, color]) => {
      const graphics = this.add.graphics();
      
      // Main tile body
      graphics.fillStyle(color);
      graphics.fillRoundedRect(2, 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4, 8);
      
      // Highlight
      graphics.fillStyle(Phaser.Display.Color.GetColor32(255, 255, 255, 60));
      graphics.fillRoundedRect(4, 4, this.TILE_SIZE - 8, 16, 4);
      
      // Border
      graphics.lineStyle(2, 0x34495e);
      graphics.strokeRoundedRect(1, 1, this.TILE_SIZE - 2, this.TILE_SIZE - 2, 8);
      
      graphics.generateTexture(`tile_${type}`, this.TILE_SIZE, this.TILE_SIZE);
      graphics.destroy();
    });
    
    // Empty tile texture
    const emptyGraphics = this.add.graphics();
    emptyGraphics.fillStyle(0x7f8c8d, 0.3);
    emptyGraphics.fillRoundedRect(2, 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4, 8);
    emptyGraphics.generateTexture('tile_empty', this.TILE_SIZE, this.TILE_SIZE);
    emptyGraphics.destroy();
  }

  private createSoundPlaceholders() {
    // Create simple sound effects using Web Audio API
    this.matchSound = this.sound.add('match', { volume: 0.5 });
    this.swapSound = this.sound.add('swap', { volume: 0.3 });
    this.fallSound = this.sound.add('fall', { volume: 0.2 });
  }

  private createGrid() {
    const { width, height } = this.gameLogic.getGridDimensions();
    
    for (let y = 0; y < height; y++) {
      this.tileSprites[y] = [];
      for (let x = 0; x < width; x++) {
        const tileX = this.GRID_OFFSET_X + x * (this.TILE_SIZE + this.TILE_SPACING);
        const tileY = this.GRID_OFFSET_Y + y * (this.TILE_SIZE + this.TILE_SPACING);
        
        const sprite = this.add.sprite(tileX, tileY, 'tile_empty');
        sprite.setInteractive();
        sprite.setData('gridX', x);
        sprite.setData('gridY', y);
        
        this.tileSprites[y][x] = sprite;
      }
    }
  }

  private createUI() {
    // Score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Moves display
    this.movesText = this.add.text(20, 50, `Moves: ${this.gameState.maxMoves}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Target score display
    this.targetScoreText = this.add.text(20, 80, `Target: ${this.gameState.targetScore}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Game over text (initially hidden)
    this.gameOverText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        align: 'center'
      }
    ).setOrigin(0.5).setVisible(false);
  }

  private createParticleEffects() {
    // Create particle emitters for match effects
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6, 0xe67e22];
    
    colors.forEach(color => {
      const emitter = this.add.particles(0, 0, 'particle', {
        speed: { min: 50, max: 150 },
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        tint: color,
        lifespan: 300,
        quantity: 5
      });
      emitter.stop();
      this.particleEmitters.push(emitter);
    });
  }

  private setupInput() {
    this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
      if (this.isAnimating || this.gameState.gameStatus !== 'playing') return;
      
      const gridX = gameObject.getData('gridX');
      const gridY = gameObject.getData('gridY');
      
      this.handleTileClick({ x: gridX, y: gridY });
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
    
    // Visual feedback
    const sprite = this.tileSprites[position.y][position.x];
    this.selectedTileSprite = sprite;
    
    // Highlight selected tile
    this.tweens.add({
      targets: sprite,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      repeat: -1
    });
  }

  private deselectTile() {
    if (this.selectedTileSprite) {
      this.tweens.killTweensOf(this.selectedTileSprite);
      this.selectedTileSprite.setScale(1);
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
      // Invalid move - animate back
      await this.animateInvalidSwap(pos1, pos2);
      this.deselectTile();
      return;
    }
    
    // Valid move
    this.isAnimating = true;
    this.deselectTile();
    
    // Perform swap
    this.gameState.grid = this.gameLogic.swapTiles(this.gameState.grid, pos1, pos2);
    this.gameState.moves--;
    this.comboCount = 0;
    
    // Animate swap
    await this.animateSwap(pos1, pos2);
    
    // Update moves display
    this.updateUI();
    
    // Play sound
    this.swapSound.play();
    
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
      
      // Animate matches
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
      
      // Update UI
      this.updateUI();
      
      this.isAnimating = false;
      
      // Check for more matches (cascade)
      setTimeout(() => this.checkForMatches(), 100);
    } else {
      // No more matches, reset combo and check game state
      this.comboCount = 0;
      this.checkGameState();
    }
  }

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
        duration: 200,
        ease: 'Power2',
        onComplete
      });
      
      this.tweens.add({
        targets: sprite2,
        x: targetX2,
        y: targetY2,
        duration: 200,
        ease: 'Power2',
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
      
      // Move towards each other, then back
      this.tweens.add({
        targets: sprite1,
        x: targetX1,
        y: targetY1,
        duration: 100,
        ease: 'Power2',
        yoyo: true,
        repeat: 1
      });
      
      this.tweens.add({
        targets: sprite2,
        x: targetX2,
        y: targetY2,
        duration: 100,
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
        match.tiles.forEach(pos => {
          const sprite = this.tileSprites[pos.y][pos.x];
          
          // Particle effect
          const emitter = this.particleEmitters[Math.floor(Math.random() * this.particleEmitters.length)];
          emitter.setPosition(sprite.x, sprite.y);
          emitter.explode();
          
          // Scale down and fade out
          this.tweens.add({
            targets: sprite,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
              completedAnimations++;
              if (completedAnimations === totalAnimations) {
                resolve();
              }
            }
          });
        });
      });
      
      // Play match sound
      this.matchSound.play();
    });
  }

  private async animateFalling(animations: TileAnimation[]): Promise<void> {
    return new Promise(resolve => {
      if (animations.length === 0) {
        resolve();
        return;
      }
      
      let completedAnimations = 0;
      
      animations.forEach(animation => {
        const { tile, toX, toY, duration } = animation;
        const sprite = this.tileSprites[tile.y][tile.x];
        
        // Update sprite texture
        sprite.setTexture(`tile_${tile.type}`);
        sprite.setAlpha(1);
        sprite.setScale(1);
        
        // Animate to final position
        const targetX = this.GRID_OFFSET_X + toX * (this.TILE_SIZE + this.TILE_SPACING);
        const targetY = this.GRID_OFFSET_Y + toY * (this.TILE_SIZE + this.TILE_SPACING);
        
        this.tweens.add({
          targets: sprite,
          x: targetX,
          y: targetY,
          duration: Math.min(duration, 500),
          ease: 'Bounce.easeOut',
          onComplete: () => {
            tile.falling = false;
            completedAnimations++;
            if (completedAnimations === animations.length) {
              resolve();
            }
          }
        });
      });
      
      // Play fall sound
      this.fallSound.play();
    });
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.gameState.score}`);
    this.movesText.setText(`Moves: ${this.gameState.moves}`);
    
    // Update sprites to match game state
    for (let y = 0; y < this.gameState.grid.length; y++) {
      for (let x = 0; x < this.gameState.grid[y].length; x++) {
        const tile = this.gameState.grid[y][x];
        const sprite = this.tileSprites[y][x];
        
        if (tile.type === TileType.EMPTY) {
          sprite.setTexture('tile_empty');
        } else {
          sprite.setTexture(`tile_${tile.type}`);
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
    this.gameOverText.setText('Level Complete!\nTap to continue')
      .setVisible(true)
      .setInteractive()
      .once('pointerdown', () => {
        this.scene.restart({ levelConfig: this.getNextLevelConfig() });
      });
  }

  private showGameOver() {
    this.gameOverText.setText(`Game Over\nFinal Score: ${this.gameState.score}\nTap to restart`)
      .setVisible(true)
      .setInteractive()
      .once('pointerdown', () => {
        this.scene.restart({ levelConfig: this.levelConfig });
      });
  }

  private startNewGame() {
    this.gameState.grid = this.gameLogic.initializeGrid();
    this.updateUI();
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
      maxMoves: 20,
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
      targetScore: this.levelConfig.targetScore + 500,
      maxMoves: Math.max(15, this.levelConfig.maxMoves - 1),
      tileTypes: nextLevel > 3 ? 
        [TileType.RED, TileType.BLUE, TileType.GREEN, TileType.YELLOW, TileType.PURPLE, TileType.ORANGE] :
        [TileType.RED, TileType.BLUE, TileType.GREEN, TileType.YELLOW, TileType.PURPLE]
    };
  }
}
