import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      sendUnauthorized(res, 'Invalid token type');
      return;
    }

    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    sendUnauthorized(res, 'Invalid or expired token');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};
