import db from '../database/connection';
import { User } from '../../../shared/types';

export interface UserRow {
  id: string;
  telegram_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  score: number;
  level: number;
  created_at: Date;
  updated_at: Date;
}

export const User = {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRow> {
    const { telegramId, username, firstName, lastName, score, level } = userData;
    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, score, level) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [telegramId, username, firstName, lastName, score, level]
    );
    return result.rows[0];
  },

  async findByTelegramId(telegramId: string): Promise<UserRow | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );
    return result.rows[0] || null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async update(id: string, userData: Partial<User>): Promise<UserRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 2;

    Object.keys(userData).forEach(key => {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        fields.push(`${key} = $${index}`);
        // Convert camelCase to snake_case for database column names
        values.push(userData[key as keyof typeof userData]);
        index++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id); // Return unchanged user if no fields to update
    }

    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    values.unshift(id); // Add id as first parameter

    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows.length > 0;
  },
  
  async getAll(): Promise<UserRow[]> {
    const result = await db.query('SELECT * FROM users ORDER BY score DESC');
    return result.rows;
  }
};