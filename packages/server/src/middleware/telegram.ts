import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type { ApiResponse } from '@shared/types';

interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  auth_date: number;
  hash: string;
  [key: string]: any;
}

interface TelegramRequest extends Request {
  telegramUser?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  telegramData?: TelegramInitData;
}

/**
 * Validates Telegram Web App initialization data
 * Ensures the request comes from a legitimate Telegram Mini App
 */
export const validateTelegramData = (
  req: TelegramRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.body.initData || req.headers['x-telegram-init-data'];
    
    if (!initData) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Telegram initialization data is required'
      } as ApiResponse<null>);
    }

    // Skip validation in development mode for testing
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_TELEGRAM_VALIDATION === 'true') {
      console.warn('⚠️ Skipping Telegram validation in development mode');
      
      // Extract mock user data for development
      if (req.body.userId) {
        req.telegramUser = {
          id: parseInt(req.body.userId),
          first_name: 'Dev User',
          username: 'devuser'
        };
      }
      
      return next();
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Telegram authentication not configured'
      } as ApiResponse<null>);
    }

    // Parse initialization data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid Telegram data: missing hash'
      } as ApiResponse<null>);
    }

    // Remove hash from params for validation
    params.delete('hash');
    
    // Sort and create data string for validation
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key using bot token
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    
    // Calculate expected hash
    const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Verify hash
    if (hash !== expectedHash) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid Telegram data signature'
      } as ApiResponse<null>);
    }

    // Check data age (should be recent)
    const authDate = parseInt(params.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 86400; // 24 hours in seconds
    
    if (currentTime - authDate > maxAge) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Telegram data is too old'
      } as ApiResponse<null>);
    }

    // Parse user data
    const userParam = params.get('user');
    if (userParam) {
      try {
        const userData = JSON.parse(userParam);
        req.telegramUser = userData;
        
        // Store full init data for reference
        req.telegramData = {
          query_id: params.get('query_id') || undefined,
          user: userData,
          auth_date: authDate,
          hash: hash
        };
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid user data in Telegram initialization'
        } as ApiResponse<null>);
      }
    }

    next();
  } catch (error) {
    console.error('Telegram validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to validate Telegram data'
    } as ApiResponse<null>);
  }
};

/**
 * Optional Telegram validation - adds user data if valid, but doesn't fail if invalid
 */
export const optionalTelegramValidation = (
  req: TelegramRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.body.initData || req.headers['x-telegram-init-data'];
    
    if (!initData) {
      return next();
    }

    // In development, allow mock data
    if (process.env.NODE_ENV === 'development') {
      if (req.body.userId) {
        req.telegramUser = {
          id: parseInt(req.body.userId),
          first_name: 'Dev User',
          username: 'devuser'
        };
      }
      return next();
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return next();
    }

    try {
      // Validate (same logic as validateTelegramData but non-blocking)
      const params = new URLSearchParams(initData);
      const hash = params.get('hash');
      
      if (hash) {
        params.delete('hash');
        
        const dataCheckString = Array.from(params.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (hash === expectedHash) {
          const authDate = parseInt(params.get('auth_date') || '0');
          const currentTime = Math.floor(Date.now() / 1000);
          const maxAge = 86400;
          
          if (currentTime - authDate <= maxAge) {
            const userParam = params.get('user');
            if (userParam) {
              const userData = JSON.parse(userParam);
              req.telegramUser = userData;
              req.telegramData = {
                query_id: params.get('query_id') || undefined,
                user: userData,
                auth_date: authDate,
                hash: hash
              };
            }
          }
        }
      }
    } catch (error) {
      console.warn('Optional Telegram validation failed:', error);
    }

    next();
  } catch (error) {
    console.warn('Optional Telegram validation error:', error);
    next();
  }
};

/**
 * Middleware to ensure Telegram user is present (use after validateTelegramData)
 */
export const requireTelegramUser = (
  req: TelegramRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.telegramUser) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Telegram user authentication required'
    } as ApiResponse<null>);
  }
  next();
};

/**
 * Utility function to validate Telegram data without middleware
 */
export const validateTelegramDataSync = (initData: string, botToken: string): TelegramInitData | null => {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) return null;
    
    params.delete('hash');
    
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (hash !== expectedHash) return null;

    const authDate = parseInt(params.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 86400;
    
    if (currentTime - authDate > maxAge) return null;

    const userParam = params.get('user');
    const userData = userParam ? JSON.parse(userParam) : undefined;

    return {
      query_id: params.get('query_id') || undefined,
      user: userData,
      auth_date: authDate,
      hash: hash
    };
  } catch {
    return null;
  }
};

// Export types
export type { TelegramRequest, TelegramInitData };