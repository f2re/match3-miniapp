import db from '../database/connection';
import type { User as UserType } from '../../../shared/types';

export interface UserRow {
  id: string;
  telegram_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  score: number;
  level: number;
  lives: number;
  coins: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  score?: number;
  level?: number;
  lives?: number;
  coins?: number;
}

export interface UpdateUserData {
  username?: string;
  firstName?: string;
  lastName?: string;
  score?: number;
  level?: number;
  lives?: number;
  coins?: number;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<UserRow> {
    const {
      telegramId,
      username,
      firstName,
      lastName,
      score = 0,
      level = 1,
      lives = 5,
      coins = 100
    } = userData;
    
    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, score, level, lives, coins) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [telegramId, username, firstName, lastName, score, level, lives, coins]
    );
    return result.rows[0];
  }

  static async findByTelegramId(telegramId: string): Promise<UserRow | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<UserRow | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async update(id: string, userData: UpdateUserData): Promise<UserRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 2;

    // Map camelCase to snake_case and build query
    const fieldMapping: Record<string, string> = {
      username: 'username',
      firstName: 'first_name',
      lastName: 'last_name',
      score: 'score',
      level: 'level',
      lives: 'lives',
      coins: 'coins'
    };

    Object.entries(userData).forEach(([key, value]) => {
      if (fieldMapping[key] && value !== undefined) {
        fields.push(`${fieldMapping[key]} = $${index}`);
        values.push(value);
        index++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    values.unshift(id);

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  }
  
  static async getAll(limit = 100, offset = 0): Promise<UserRow[]> {
    const result = await db.query(
      'SELECT * FROM users ORDER BY score DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async getLeaderboard(limit = 10): Promise<UserRow[]> {
    const result = await db.query(
      `SELECT id, telegram_id, username, first_name, last_name, score, level, 
              ROW_NUMBER() OVER (ORDER BY score DESC) as rank
       FROM users 
       ORDER BY score DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async updateScore(id: string, newScore: number): Promise<UserRow | null> {
    const result = await db.query(
      `UPDATE users 
       SET score = GREATEST(score, $2), updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, newScore]
    );
    return result.rows[0] || null;
  }

  static async addCoins(id: string, amount: number): Promise<UserRow | null> {
    const result = await db.query(
      `UPDATE users 
       SET coins = coins + $2, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, amount]
    );
    return result.rows[0] || null;
  }

  static async spendCoins(id: string, amount: number): Promise<UserRow | null> {
    const result = await db.query(
      `UPDATE users 
       SET coins = GREATEST(0, coins - $2), updated_at = NOW() 
       WHERE id = $1 AND coins >= $2
       RETURNING *`,
      [id, amount]
    );
    return result.rows[0] || null;
  }

  static async updateLives(id: string, lives: number): Promise<UserRow | null> {
    const result = await db.query(
      `UPDATE users 
       SET lives = $2, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, Math.max(0, Math.min(5, lives))] // Clamp between 0 and 5
    );
    return result.rows[0] || null;
  }

  static async getUserStats(id: string): Promise<any> {
    // This would be expanded to include more detailed statistics
    const result = await db.query(
      `SELECT 
        score,
        level,
        created_at,
        (SELECT COUNT(*) FROM game_sessions WHERE user_id = $1) as total_games,
        (SELECT AVG(score) FROM game_sessions WHERE user_id = $1) as avg_score
       FROM users 
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }
}