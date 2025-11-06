import db from '../database/connection';

export interface GameStatesRow {
  id: string;
  user_id: string;
  game_data: any; // JSONB field containing the game state
  last_played: Date;
  created_at: Date;
  updated_at: Date;
}

export interface GameStatePayload {
  score: number;
  level: number;
  lives: number;
  coins: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  lastPlayed: string;
  // Add other game state properties as needed
}

export const GameStatesModel = {
  async saveGameState(userId: string, gameState: GameStatePayload): Promise<GameStatesRow> {
    const result = await db.query(
      `INSERT INTO game_states (user_id, game_data) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET game_data = $2, last_played = NOW(), updated_at = NOW()
       RETURNING *`,
      [userId, JSON.stringify(gameState)]
    );
    return result.rows[0];
  },

  async getGameState(userId: string): Promise<GameStatesRow | null> {
    const result = await db.query(
      'SELECT * FROM game_states WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  async deleteGameState(userId: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM game_states WHERE user_id = $1 RETURNING user_id',
      [userId]
    );
    return result.rows.length > 0;
  },

  async updateGameState(userId: string, gameState: Partial<GameStatePayload>): Promise<GameStatesRow | null> {
    // Get the current state first
    const currentState = await this.getGameState(userId);
    
    if (!currentState) {
      // If no existing state, create a new one with defaults
      const defaultState: GameStatePayload = {
        score: 0,
        level: 1,
        lives: 5,
        coins: 100,
        soundEnabled: true,
        musicEnabled: true,
        vibrationEnabled: true,
        lastPlayed: new Date().toISOString()
      };
      
      const mergedState = { ...defaultState, ...gameState };
      return await this.saveGameState(userId, mergedState);
    }
    
    // Merge the updated values with the current state
    const currentData = JSON.parse(currentState.game_data);
    const updatedData = { ...currentData, ...gameState };
    
    return await this.saveGameState(userId, updatedData);
  }
};