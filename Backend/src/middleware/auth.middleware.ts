import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify the Supabase Auth token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('Supabase auth error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Invalid or expired token'
      });
    }

    // Extract user information from Supabase user object
    req.user = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      role: user.user_metadata?.role || user.app_metadata?.role || 'user'
    };

    next();
  } catch (error) {
    console.log('Authentication error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      message: 'Invalid or expired token'
    });
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};
