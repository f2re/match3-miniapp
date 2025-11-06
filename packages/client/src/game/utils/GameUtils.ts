import { Tile, TileType, Match, GameConfig } from '../../../../../shared/types/game';

export class GameUtils {
  static readonly GRID_WIDTH = 8;
  static readonly GRID_HEIGHT = 8;
  static readonly TILE_SIZE = 64;
  static readonly TILE_SPACING = 4;
  static readonly ANIMATION_DURATION = 300;

  /**
   * Create a new tile with given parameters
   */
  static createTile(x: number, y: number, type: TileType): Tile {
    return {
      id: `${x}-${y}-${Date.now()}`,
      type,
      x,
      y,
      isSelected: false,
      isMatched: false,
      isFalling: false
    };
  }

  /**
   * Get random tile type
   */
  static getRandomTileType(excludeTypes: TileType[] = []): TileType {
    const availableTypes = [TileType.RED, TileType.BLUE, TileType.GREEN, TileType.YELLOW, TileType.PURPLE, TileType.ORANGE]
      .filter(type => !excludeTypes.includes(type));
    
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  /**
   * Initialize empty grid
   */
  static createEmptyGrid(width: number = GameUtils.GRID_WIDTH, height: number = GameUtils.GRID_HEIGHT): Tile[][] {
    const grid: Tile[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = GameUtils.createTile(x, y, TileType.EMPTY);
      }
    }
    return grid;
  }

  /**
   * Fill grid with random tiles, ensuring no initial matches
   */
  static fillGridWithoutMatches(grid: Tile[][]): void {
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x].type === TileType.EMPTY) {
          let attempts = 0;
          let tileType: TileType;
          
          do {
            tileType = GameUtils.getRandomTileType();
            attempts++;
          } while (attempts < 10 && GameUtils.wouldCreateMatch(grid, x, y, tileType));
          
          grid[y][x] = GameUtils.createTile(x, y, tileType);
        }
      }
    }
  }

  /**
   * Check if placing a tile type at position would create a match
   */
  static wouldCreateMatch(grid: Tile[][], x: number, y: number, type: TileType): boolean {
    const height = grid.length;
    const width = grid[0].length;

    // Check horizontal match
    let horizontalCount = 1;
    // Check left
    for (let i = x - 1; i >= 0 && grid[y][i].type === type; i--) {
      horizontalCount++;
    }
    // Check right
    for (let i = x + 1; i < width && grid[y][i].type === type; i++) {
      horizontalCount++;
    }

    // Check vertical match
    let verticalCount = 1;
    // Check up
    for (let i = y - 1; i >= 0 && grid[i][x].type === type; i--) {
      verticalCount++;
    }
    // Check down
    for (let i = y + 1; i < height && grid[i][x].type === type; i++) {
      verticalCount++;
    }

    return horizontalCount >= 3 || verticalCount >= 3;
  }

  /**
   * Find all matches in the current grid
   */
  static findMatches(grid: Tile[][]): Match[] {
    const matches: Match[] = [];
    const height = grid.length;
    const width = grid[0].length;
    const checked: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

    // Find horizontal matches
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width - 2; x++) {
        if (checked[y][x] || grid[y][x].type === TileType.EMPTY) continue;
        
        const type = grid[y][x].type;
        const matchTiles: Tile[] = [grid[y][x]];
        
        for (let i = x + 1; i < width && grid[y][i].type === type; i++) {
          matchTiles.push(grid[y][i]);
        }
        
        if (matchTiles.length >= 3) {
          matches.push({
            tiles: matchTiles,
            type: 'horizontal',
            length: matchTiles.length
          });
          
          matchTiles.forEach(tile => {
            checked[tile.y][tile.x] = true;
          });
        }
      }
    }

    // Find vertical matches
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height - 2; y++) {
        if (checked[y][x] || grid[y][x].type === TileType.EMPTY) continue;
        
        const type = grid[y][x].type;
        const matchTiles: Tile[] = [grid[y][x]];
        
        for (let i = y + 1; i < height && grid[i][x].type === type; i++) {
          matchTiles.push(grid[i][x]);
        }
        
        if (matchTiles.length >= 3) {
          matches.push({
            tiles: matchTiles,
            type: 'vertical',
            length: matchTiles.length
          });
          
          matchTiles.forEach(tile => {
            checked[tile.y][tile.x] = true;
          });
        }
      }
    }

    return matches;
  }

  /**
   * Check if two tiles are adjacent
   */
  static areAdjacent(tile1: Tile, tile2: Tile): boolean {
    const dx = Math.abs(tile1.x - tile2.x);
    const dy = Math.abs(tile1.y - tile2.y);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  /**
   * Swap two tiles in the grid
   */
  static swapTiles(grid: Tile[][], tile1: Tile, tile2: Tile): void {
    const temp = { ...grid[tile1.y][tile1.x] };
    grid[tile1.y][tile1.x] = { ...grid[tile2.y][tile2.x], x: tile1.x, y: tile1.y };
    grid[tile2.y][tile2.x] = { ...temp, x: tile2.x, y: tile2.y };
  }

  /**
   * Remove matched tiles from grid
   */
  static removeMatches(grid: Tile[][], matches: Match[]): number {
    let removedCount = 0;
    
    matches.forEach(match => {
      match.tiles.forEach(tile => {
        if (grid[tile.y][tile.x].type !== TileType.EMPTY) {
          grid[tile.y][tile.x] = GameUtils.createTile(tile.x, tile.y, TileType.EMPTY);
          removedCount++;
        }
      });
    });
    
    return removedCount;
  }

  /**
   * Make tiles fall down to fill empty spaces
   */
  static applyGravity(grid: Tile[][]): boolean {
    const height = grid.length;
    const width = grid[0].length;
    let tilesMoveed = false;

    for (let x = 0; x < width; x++) {
      // Collect non-empty tiles from bottom to top
      const column: Tile[] = [];
      for (let y = height - 1; y >= 0; y--) {
        if (grid[y][x].type !== TileType.EMPTY) {
          column.push(grid[y][x]);
        }
      }

      // Fill column from bottom up
      for (let y = height - 1; y >= 0; y--) {
        const columnIndex = height - 1 - y;
        if (columnIndex < column.length) {
          const tile = column[columnIndex];
          if (tile.y !== y) {
            tilesMoveed = true;
            grid[y][x] = { ...tile, y, isFalling: true };
          } else {
            grid[y][x] = tile;
          }
        } else {
          grid[y][x] = GameUtils.createTile(x, y, TileType.EMPTY);
        }
      }
    }

    return tilesMoveed;
  }

  /**
   * Fill empty spaces at top with new random tiles
   */
  static fillEmptySpaces(grid: Tile[][]): boolean {
    const height = grid.length;
    const width = grid[0].length;
    let tilesAdded = false;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (grid[y][x].type === TileType.EMPTY) {
          grid[y][x] = GameUtils.createTile(x, y, GameUtils.getRandomTileType());
          grid[y][x].isFalling = true;
          tilesAdded = true;
        }
      }
    }

    return tilesAdded;
  }

  /**
   * Calculate score based on match properties
   */
  static calculateScore(matches: Match[], combo: number = 1): number {
    let score = 0;
    
    matches.forEach(match => {
      const baseScore = match.length * 10;
      const comboMultiplier = Math.min(combo, 10); // Cap combo multiplier
      const lengthBonus = match.length > 3 ? (match.length - 3) * 20 : 0;
      
      score += (baseScore + lengthBonus) * comboMultiplier;
    });
    
    return score;
  }

  /**
   * Check if any valid moves are available
   */
  static hasValidMoves(grid: Tile[][]): boolean {
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Try swapping with right neighbor
        if (x < width - 1) {
          GameUtils.swapTiles(grid, grid[y][x], grid[y][x + 1]);
          const matches = GameUtils.findMatches(grid);
          GameUtils.swapTiles(grid, grid[y][x], grid[y][x + 1]); // Swap back
          
          if (matches.length > 0) {
            return true;
          }
        }
        
        // Try swapping with bottom neighbor
        if (y < height - 1) {
          GameUtils.swapTiles(grid, grid[y][x], grid[y + 1][x]);
          const matches = GameUtils.findMatches(grid);
          GameUtils.swapTiles(grid, grid[y][x], grid[y + 1][x]); // Swap back
          
          if (matches.length > 0) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Convert grid position to screen coordinates
   */
  static gridToScreen(gridX: number, gridY: number): { x: number, y: number } {
    return {
      x: gridX * (GameUtils.TILE_SIZE + GameUtils.TILE_SPACING) + GameUtils.TILE_SIZE / 2,
      y: gridY * (GameUtils.TILE_SIZE + GameUtils.TILE_SPACING) + GameUtils.TILE_SIZE / 2
    };
  }

  /**
   * Convert screen coordinates to grid position
   */
  static screenToGrid(screenX: number, screenY: number): { x: number, y: number } {
    return {
      x: Math.floor(screenX / (GameUtils.TILE_SIZE + GameUtils.TILE_SPACING)),
      y: Math.floor(screenY / (GameUtils.TILE_SIZE + GameUtils.TILE_SPACING))
    };
  }

  /**
   * Get tile color based on type
   */
  static getTileColor(type: TileType): number {
    switch (type) {
      case TileType.RED: return 0xff4444;
      case TileType.BLUE: return 0x4444ff;
      case TileType.GREEN: return 0x44ff44;
      case TileType.YELLOW: return 0xffff44;
      case TileType.PURPLE: return 0xff44ff;
      case TileType.ORANGE: return 0xff8844;
      default: return 0x888888;
    }
  }
}