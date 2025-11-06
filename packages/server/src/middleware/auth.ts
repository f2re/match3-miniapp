import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { ApiResponse } from '../../../../shared/types';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    telegramId: string;
    username?: string;
  };
}

/**
 * JWT-based authentication middleware
 * Verifies JWT tokens and adds user info to request
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No valid authorization token provided'
      } as ApiResponse<null>);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Authentication service not configured'
      } as ApiResponse<null>);
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    if (!decoded.id || !decoded.telegramId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token payload'
      } as ApiResponse<null>);
    }

    // Add user info to request object
    req.user = {
      id: decoded.id,
      telegramId: decoded.telegramId,
      username: decoded.username
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      } as ApiResponse<null>);
    }

    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication service error'
    } as ApiResponse<null>);
  }
};

/**
 * Optional authentication middleware
 * Adds user info to request if token is provided, but doesn't require it
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      // JWT not configured, continue without authentication
      return next();
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      if (decoded.id && decoded.telegramId) {
        req.user = {
          id: decoded.id,
          telegramId: decoded.telegramId,
          username: decoded.username
        };
      }
    } catch (jwtError) {
      // Invalid token, but continue without authentication
      console.warn('Invalid optional JWT token:', jwtError);
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Continue without authentication on any error
    next();
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user: {
  id: string;
  telegramId: string;
  username?: string;
}): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username
    },
    jwtSecret,
    { expiresIn }
  );
};

/**
 * Verify JWT token without middleware (utility function)
 */
export const verifyToken = (token: string): any => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.verify(token, jwtSecret);
};

// Export the authenticated request type for use in controllers
export type { AuthenticatedRequest };