import {
  GameTile,
  TileType,
  GridPosition,
  MatchResult,
  GameState,
  LevelConfig,
  TileAnimation,
  ScoreConfig,
  SpecialTileEffect
} from '../../types/game';

/**
 * Core Match-3 game logic class
 * Handles grid management, match detection, tile falling, scoring, and special tiles
 */
export class GameLogic {
  private readonly GRID_WIDTH: number;
  private readonly GRID_HEIGHT: number;
  private readonly MIN_MATCH_LENGTH = 3;
  private readonly TILE_TYPES: TileType[];

  private scoreConfig: ScoreConfig = {
    basePoints: {
      [TileType.RED]: 10,
      [TileType.BLUE]: 10,
      [TileType.GREEN]: 10,
      [TileType.YELLOW]: 10,
      [TileType.PURPLE]: 10,
      [TileType.ORANGE]: 10
    },
    matchMultipliers: {
      3: 1,
      4: 2.5,    // Increased for bomb creation
      5: 5,      // Increased for rocket creation
      6: 10,     // Massive bonus
      7: 20      // Legendary bonus
    },
    comboMultiplier: 1.5,
    levelBonus: 100
  };

  // Special tile bonuses
  private readonly SPECIAL_BONUSES = {
    bomb: 200,
    rocket: 300,
    rainbow: 500
  };

  constructor(config: LevelConfig) {
    this.GRID_WIDTH = config.gridWidth;
    this.GRID_HEIGHT = config.gridHeight;
    this.TILE_TYPES = config.tileTypes.filter(
      type => type !== TileType.EMPTY &&
      !type.startsWith('bomb') &&
      !type.startsWith('rocket') &&
      !type.startsWith('rainbow')
    );
  }

  /**
   * Initialize a new game grid with random tiles
   */
  public initializeGrid(): GameTile[][] {
    const grid: GameTile[][] = [];
    
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      grid[y] = [];
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        grid[y][x] = this.createRandomTile(x, y);
      }
    }
    
    // Ensure no initial matches
    this.removeInitialMatches(grid);
    return grid;
  }

  /**
   * Create a random tile with specified position
   */
  private createRandomTile(x: number, y: number): GameTile {
    const randomType = this.TILE_TYPES[Math.floor(Math.random() * this.TILE_TYPES.length)];
    return {
      type: randomType,
      x,
      y,
      id: `tile_${x}_${y}_${Date.now()}_${Math.random()}`,
      falling: false,
      matched: false
    };
  }

  /**
   * Remove any initial matches from the grid
   */
  private removeInitialMatches(grid: GameTile[][]): void {
    let hasMatches = true;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (hasMatches && attempts < maxAttempts) {
      const matches = this.findAllMatches(grid);
      hasMatches = matches.length > 0;
      
      if (hasMatches) {
        // Replace matched tiles with new random tiles
        matches.forEach(match => {
          match.tiles.forEach(pos => {
            grid[pos.y][pos.x] = this.createRandomTile(pos.x, pos.y);
          });
        });
      }
      
      attempts++;
    }
  }

  /**
   * Check if two tiles can be swapped (are adjacent)
   */
  public canSwapTiles(pos1: GridPosition, pos2: GridPosition): boolean {
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    
    // Only allow adjacent tiles (not diagonal)
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  /**
   * Swap two tiles in the grid
   */
  public swapTiles(grid: GameTile[][], pos1: GridPosition, pos2: GridPosition): GameTile[][] {
    if (!this.isValidPosition(pos1) || !this.isValidPosition(pos2)) {
      return grid;
    }
    
    const newGrid = this.cloneGrid(grid);
    const tile1 = newGrid[pos1.y][pos1.x];
    const tile2 = newGrid[pos2.y][pos2.x];
    
    // Swap positions
    tile1.x = pos2.x;
    tile1.y = pos2.y;
    tile2.x = pos1.x;
    tile2.y = pos1.y;
    
    // Swap in grid
    newGrid[pos1.y][pos1.x] = tile2;
    newGrid[pos2.y][pos2.x] = tile1;
    
    return newGrid;
  }

  /**
   * Check if a swap would create matches
   */
  public wouldCreateMatches(grid: GameTile[][], pos1: GridPosition, pos2: GridPosition): boolean {
    const testGrid = this.swapTiles(grid, pos1, pos2);
    const matches = this.findAllMatches(testGrid);
    return matches.length > 0;
  }

  /**
   * Find all matches in the grid
   */
  public findAllMatches(grid: GameTile[][]): MatchResult[] {
    const matches: MatchResult[] = [];
    const processedPositions = new Set<string>();
    
    // Check horizontal matches
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.GRID_WIDTH - 2; x++) {
        const match = this.findHorizontalMatch(grid, x, y);
        if (match && match.length >= this.MIN_MATCH_LENGTH) {
          const posKey = match.tiles.map(p => `${p.x},${p.y}`).join('|');
          if (!processedPositions.has(posKey)) {
            matches.push(match);
            match.tiles.forEach(p => processedPositions.add(`${p.x},${p.y}`));
          }
        }
      }
    }
    
    // Check vertical matches
    for (let x = 0; x < this.GRID_WIDTH; x++) {
      for (let y = 0; y < this.GRID_HEIGHT - 2; y++) {
        const match = this.findVerticalMatch(grid, x, y);
        if (match && match.length >= this.MIN_MATCH_LENGTH) {
          const posKey = match.tiles.map(p => `${p.x},${p.y}`).join('|');
          if (!processedPositions.has(posKey)) {
            matches.push(match);
            match.tiles.forEach(p => processedPositions.add(`${p.x},${p.y}`));
          }
        }
      }
    }
    
    return matches;
  }

  /**
   * Find horizontal match starting at position
   */
  private findHorizontalMatch(grid: GameTile[][], startX: number, y: number): MatchResult | null {
    const startTile = grid[y][startX];
    if (startTile.type === TileType.EMPTY) return null;
    
    const matchTiles: GridPosition[] = [{ x: startX, y }];
    
    // Check right
    for (let x = startX + 1; x < this.GRID_WIDTH; x++) {
      if (grid[y][x].type === startTile.type) {
        matchTiles.push({ x, y });
      } else {
        break;
      }
    }
    
    if (matchTiles.length >= this.MIN_MATCH_LENGTH) {
      return {
        tiles: matchTiles,
        type: startTile.type,
        direction: 'horizontal',
        length: matchTiles.length
      };
    }
    
    return null;
  }

  /**
   * Find vertical match starting at position
   */
  private findVerticalMatch(grid: GameTile[][], x: number, startY: number): MatchResult | null {
    const startTile = grid[startY][x];
    if (startTile.type === TileType.EMPTY) return null;
    
    const matchTiles: GridPosition[] = [{ x, y: startY }];
    
    // Check down
    for (let y = startY + 1; y < this.GRID_HEIGHT; y++) {
      if (grid[y][x].type === startTile.type) {
        matchTiles.push({ x, y });
      } else {
        break;
      }
    }
    
    if (matchTiles.length >= this.MIN_MATCH_LENGTH) {
      return {
        tiles: matchTiles,
        type: startTile.type,
        direction: 'vertical',
        length: matchTiles.length
      };
    }
    
    return null;
  }

  /**
   * Remove matched tiles from grid
   */
  public removeMatches(grid: GameTile[][], matches: MatchResult[]): GameTile[][] {
    const newGrid = this.cloneGrid(grid);
    
    matches.forEach(match => {
      match.tiles.forEach(pos => {
        if (this.isValidPosition(pos)) {
          newGrid[pos.y][pos.x] = {
            type: TileType.EMPTY,
            x: pos.x,
            y: pos.y,
            id: `empty_${pos.x}_${pos.y}_${Date.now()}`,
            falling: false,
            matched: true
          };
        }
      });
    });
    
    return newGrid;
  }

  /**
   * Apply gravity - make tiles fall down
   */
  public applyGravity(grid: GameTile[][]): { grid: GameTile[][], animations: TileAnimation[] } {
    const newGrid = this.cloneGrid(grid);
    const animations: TileAnimation[] = [];
    
    for (let x = 0; x < this.GRID_WIDTH; x++) {
      const column = this.getColumn(newGrid, x);
      const nonEmptyTiles = column.filter(tile => tile.type !== TileType.EMPTY);
      
      // Fill column from bottom
      for (let y = this.GRID_HEIGHT - 1; y >= 0; y--) {
        const tileIndex = this.GRID_HEIGHT - 1 - y;
        
        if (tileIndex < nonEmptyTiles.length) {
          const tile = nonEmptyTiles[tileIndex];
          const oldY = tile.y;
          
          if (oldY !== y) {
            // Tile needs to fall
            animations.push({
              tile: tile,
              fromX: x,
              fromY: oldY,
              toX: x,
              toY: y,
              duration: 300 + (y - oldY) * 50,
              type: 'fall'
            });
            
            tile.y = y;
            tile.falling = true;
          }
          
          newGrid[y][x] = tile;
        } else {
          // Create new tile from top
          const newTile = this.createRandomTile(x, y);
          const spawnY = -1 - (tileIndex - nonEmptyTiles.length);
          
          animations.push({
            tile: newTile,
            fromX: x,
            fromY: spawnY,
            toX: x,
            toY: y,
            duration: 400 + (y - spawnY) * 50,
            type: 'spawn'
          });
          
          newTile.falling = true;
          newGrid[y][x] = newTile;
        }
      }
    }
    
    return { grid: newGrid, animations };
  }

  /**
   * Calculate score for matches with enhanced bonuses
   */
  public calculateScore(matches: MatchResult[], comboCount: number = 0, specialActivations: number = 0): number {
    let totalScore = 0;

    matches.forEach(match => {
      const basePoints = this.scoreConfig.basePoints[match.type] || 10;
      const multiplier = this.scoreConfig.matchMultipliers[match.length] || 1;
      const comboBonus = Math.pow(this.scoreConfig.comboMultiplier, comboCount);

      // Calculate base match score
      let matchScore = Math.floor(basePoints * match.length * multiplier * comboBonus);

      // Add bonus for special tile creation
      if (match.special) {
        const specialBonus = this.SPECIAL_BONUSES[match.special] || 0;
        matchScore += specialBonus;
      }

      totalScore += matchScore;
    });

    // Add bonus for special tile activations
    if (specialActivations > 0) {
      totalScore += specialActivations * 150;
    }

    return totalScore;
  }

  /**
   * Detect match type and create special tile if applicable
   * Returns the position where special tile should be created
   */
  public detectSpecialTileCreation(match: MatchResult): { position: GridPosition; special: SpecialTileEffect } | null {
    const { tiles, length, direction } = match;

    // 5+ match = Rocket
    if (length >= 5) {
      const centerPos = tiles[Math.floor(tiles.length / 2)];
      return {
        position: centerPos,
        special: direction === 'horizontal' ? SpecialTileEffect.ROCKET_H : SpecialTileEffect.ROCKET_V
      };
    }

    // 4 match = Bomb
    if (length === 4) {
      const centerPos = tiles[Math.floor(tiles.length / 2)];
      return {
        position: centerPos,
        special: SpecialTileEffect.BOMB
      };
    }

    // L or T shape = Rainbow (check if this match intersects with another)
    // This is detected separately in findLShapedMatches

    return null;
  }

  /**
   * Create a special tile at the specified position
   */
  public createSpecialTile(grid: GameTile[][], position: GridPosition, special: SpecialTileEffect, tileType: TileType): GameTile[][] {
    const newGrid = this.cloneGrid(grid);

    if (!this.isValidPosition(position)) {
      return newGrid;
    }

    const tile: GameTile = {
      type: tileType,
      x: position.x,
      y: position.y,
      id: `special_${position.x}_${position.y}_${Date.now()}`,
      special: special,
      falling: false,
      matched: false
    };

    newGrid[position.y][position.x] = tile;
    return newGrid;
  }

  /**
   * Activate a special tile and get affected positions
   */
  public activateSpecialTile(grid: GameTile[][], position: GridPosition): GridPosition[] {
    const tile = grid[position.y]?.[position.x];
    if (!tile || !tile.special) {
      return [];
    }

    const affectedPositions: GridPosition[] = [];

    switch (tile.special) {
      case SpecialTileEffect.BOMB:
        // 3x3 area around the bomb
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const pos = { x: position.x + dx, y: position.y + dy };
            if (this.isValidPosition(pos)) {
              affectedPositions.push(pos);
            }
          }
        }
        break;

      case SpecialTileEffect.ROCKET_H:
        // Entire row
        for (let x = 0; x < this.GRID_WIDTH; x++) {
          affectedPositions.push({ x, y: position.y });
        }
        break;

      case SpecialTileEffect.ROCKET_V:
        // Entire column
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
          affectedPositions.push({ x: position.x, y });
        }
        break;

      case SpecialTileEffect.RAINBOW:
        // All tiles of the same type as the tile it was swapped with
        // This needs to be handled differently - we'll mark all matching colors
        // For now, just return the position itself
        affectedPositions.push(position);
        break;
    }

    return affectedPositions;
  }

  /**
   * Remove tiles at specified positions (for special tile effects)
   */
  public removeTilesAtPositions(grid: GameTile[][], positions: GridPosition[]): GameTile[][] {
    const newGrid = this.cloneGrid(grid);

    positions.forEach(pos => {
      if (this.isValidPosition(pos)) {
        newGrid[pos.y][pos.x] = {
          type: TileType.EMPTY,
          x: pos.x,
          y: pos.y,
          id: `empty_${pos.x}_${pos.y}_${Date.now()}`,
          falling: false,
          matched: true
        };
      }
    });

    return newGrid;
  }

  /**
   * Shuffle all tile colors on the board (for color swap feature)
   * Preserves positions and special tile properties
   */
  public shuffleTileColors(grid: GameTile[][]): { grid: GameTile[][], colorMap: Map<string, TileType> } {
    const newGrid = this.cloneGrid(grid);
    const colorMap = new Map<string, TileType>();

    // Collect all non-empty, non-special tiles
    const regularTiles: { pos: GridPosition; oldType: TileType }[] = [];

    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        const tile = newGrid[y][x];
        if (tile.type !== TileType.EMPTY && !tile.special) {
          regularTiles.push({ pos: { x, y }, oldType: tile.type });
          colorMap.set(`${x},${y}`, tile.type);
        }
      }
    }

    // Create a shuffled array of colors
    const colors = regularTiles.map(t => t.oldType);
    this.shuffleArray(colors);

    // Assign new colors
    regularTiles.forEach((tileInfo, index) => {
      const { pos } = tileInfo;
      newGrid[pos.y][pos.x].type = colors[index];
    });

    // Make sure there are no immediate matches
    this.removeInitialMatches(newGrid);

    return { grid: newGrid, colorMap };
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Check if a tile is special
   */
  public isSpecialTile(tile: GameTile): boolean {
    return !!tile.special && tile.special !== SpecialTileEffect.NONE;
  }

  /**
   * Check if there are possible moves
   */
  public hasPossibleMoves(grid: GameTile[][]): boolean {
    for (let y = 0; y < this.GRID_HEIGHT; y++) {
      for (let x = 0; x < this.GRID_WIDTH; x++) {
        const pos1 = { x, y };
        
        // Check adjacent positions
        const adjacentPositions = [
          { x: x + 1, y },
          { x, y: y + 1 }
        ];
        
        for (const pos2 of adjacentPositions) {
          if (this.isValidPosition(pos2) && this.wouldCreateMatches(grid, pos1, pos2)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // Utility methods
  private isValidPosition(pos: GridPosition): boolean {
    return pos.x >= 0 && pos.x < this.GRID_WIDTH && pos.y >= 0 && pos.y < this.GRID_HEIGHT;
  }

  private cloneGrid(grid: GameTile[][]): GameTile[][] {
    return grid.map(row => row.map(tile => ({ ...tile })));
  }

  private getColumn(grid: GameTile[][], x: number): GameTile[] {
    return grid.map(row => row[x]);
  }

  public getGridDimensions() {
    return { width: this.GRID_WIDTH, height: this.GRID_HEIGHT };
  }
}
