import db from '../database/connection';
import type { User as UserType, CreateUserRequest, UpdateUserRequest } from '@shared/types';

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
  language_code?: string;
  is_premium: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
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
      languageCode,
      isPremium = false,
      score = 0,
      level = 1,
      lives = 5,
      coins = 100
    } = userData;
    
    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, language_code, is_premium, score, level, lives, coins) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [telegramId, username, firstName, lastName, languageCode, isPremium, score, level, lives, coins]
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

  static async findOrCreate(userData: CreateUserData): Promise<UserRow> {
    let user = await this.findByTelegramId(userData.telegramId);
    
    if (!user) {
      user = await this.create(userData);
    } else {
      // Update user data if needed
      const updateData: UpdateUserData = {};
      if (userData.username && userData.username !== user.username) {
        updateData.username = userData.username;
      }
      if (userData.firstName && userData.firstName !== user.first_name) {
        updateData.firstName = userData.firstName;
      }
      if (userData.lastName && userData.lastName !== user.last_name) {
        updateData.lastName = userData.lastName;
      }
      
      if (Object.keys(updateData).length > 0) {
        user = await this.update(user.id, updateData) || user;
      }
    }
    
    return user;
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
      'SELECT * FROM users ORDER BY score DESC, created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async getLeaderboard(limit = 10): Promise<(UserRow & { rank: number })[]> {
    const result = await db.query(
      `SELECT *, 
              ROW_NUMBER() OVER (ORDER BY score DESC, level DESC, created_at ASC) as rank
       FROM users 
       WHERE score > 0
       ORDER BY score DESC, level DESC, created_at ASC
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

  static async incrementLevel(id: string): Promise<UserRow | null> {
    const result = await db.query(
      `UPDATE users 
       SET level = level + 1, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async getUserStats(id: string): Promise<any> {
    const result = await db.query(
      `SELECT 
        u.id,
        u.score,
        u.level,
        u.lives,
        u.coins,
        u.created_at,
        COALESCE(gs.total_games, 0) as total_games,
        COALESCE(gs.avg_score, 0) as avg_score,
        COALESCE(gs.best_score, u.score) as best_score,
        COALESCE(gs.total_playtime, 0) as total_playtime
       FROM users u
       LEFT JOIN (
         SELECT 
           user_id,
           COUNT(*) as total_games,
           AVG(score) as avg_score,
           MAX(score) as best_score,
           SUM(EXTRACT(EPOCH FROM (end_time - start_time))) as total_playtime
         FROM game_sessions 
         WHERE user_id = $1 AND end_time IS NOT NULL
         GROUP BY user_id
       ) gs ON u.id = gs.user_id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async getUserRank(id: string): Promise<number | null> {
    const result = await db.query(
      `SELECT rank FROM (
         SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC, level DESC, created_at ASC) as rank
         FROM users
         WHERE score > 0
       ) ranked_users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0]?.rank || null;
  }

  static async searchUsers(query: string, limit = 20): Promise<UserRow[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    const result = await db.query(
      `SELECT * FROM users 
       WHERE LOWER(username) LIKE $1 
          OR LOWER(first_name) LIKE $1 
          OR LOWER(last_name) LIKE $1
       ORDER BY score DESC
       LIMIT $2`,
      [searchTerm, limit]
    );
    return result.rows;
  }

  static async getActiveUsers(hours = 24): Promise<UserRow[]> {
    const result = await db.query(
      `SELECT DISTINCT u.* FROM users u
       JOIN game_sessions gs ON u.id = gs.user_id
       WHERE gs.start_time > NOW() - INTERVAL '${hours} hours'
       ORDER BY u.score DESC`,
      []
    );
    return result.rows;
  }
}