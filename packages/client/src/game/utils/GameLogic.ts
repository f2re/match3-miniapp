import {
  GameTile,
  TileType,
  GridPosition,
  MatchResult,
  GameState,
  LevelConfig,
  TileAnimation,
  ScoreConfig
} from '../../types/game';

/**
 * Core Match-3 game logic class
 * Handles grid management, match detection, tile falling, and scoring
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
      4: 2,
      5: 4,
      6: 8,
      7: 16
    },
    comboMultiplier: 1.5,
    levelBonus: 100
  };

  constructor(config: LevelConfig) {
    this.GRID_WIDTH = config.gridWidth;
    this.GRID_HEIGHT = config.gridHeight;
    this.TILE_TYPES = config.tileTypes.filter(type => type !== TileType.EMPTY);
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
   * Calculate score for matches
   */
  public calculateScore(matches: MatchResult[], comboCount: number = 0): number {
    let totalScore = 0;
    
    matches.forEach(match => {
      const basePoints = this.scoreConfig.basePoints[match.type] || 10;
      const multiplier = this.scoreConfig.matchMultipliers[match.length] || 1;
      const comboBonus = Math.pow(this.scoreConfig.comboMultiplier, comboCount);
      
      totalScore += Math.floor(basePoints * match.length * multiplier * comboBonus);
    });
    
    return totalScore;
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
