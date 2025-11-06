import db from '../database/connection';
import { GameData } from '../../../shared/types';

export interface GameDataRow {
  id: string;
  user_id: string;
  score: number;
  level: number;
  moves: number;
  board: number[][];
  achievements: string[];
  last_played: Date;
}

export const GameDataModel = {
  async create(gameData: Omit<GameData, 'id' | 'lastPlayed'>): Promise<GameDataRow> {
    const { userId, score, level, moves, board, achievements } = gameData;
    const result = await db.query(
      `INSERT INTO game_data (user_id, score, level, moves, board, achievements) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, score, level, moves, JSON.stringify(board), achievements]
    );
    return result.rows[0];
  },

  async findByUserId(userId: string): Promise<GameDataRow | null> {
    const result = await db.query(
      'SELECT * FROM game_data WHERE user_id = $1 ORDER BY last_played DESC LIMIT 1',
      [userId]
    );
    return result.rows[0] || null;
  },

  async updateByUserId(userId: string, gameData: Partial<GameData>): Promise<GameDataRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 2;

    Object.keys(gameData).forEach(key => {
      if (key !== 'id' && key !== 'userId' && key !== 'lastPlayed') {
        let column = key;
        // Convert camelCase to snake_case for database column names
        if (key === 'board') {
          column = 'board';
          values.push(JSON.stringify(gameData[key as keyof typeof gameData]));
        } else {
          column = key;
          values.push(gameData[key as keyof typeof gameData]);
        }
        fields.push(`${column} = $${index}`);
        index++;
      }
    });

    if (fields.length === 0) {
      return await this.findByUserId(userId); // Return unchanged if no fields to update
    }

    const query = `UPDATE game_data SET ${fields.join(', ')}, last_played = NOW() WHERE user_id = $1 RETURNING *`;
    values.unshift(userId); // Add userId as first parameter

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM game_data WHERE user_id = $1 RETURNING user_id',
      [userId]
    );
    return result.rows.length > 0;
  }
};