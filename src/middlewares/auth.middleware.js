import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import TokenHelper from '../utils/tokenHelper.js';

class AuthMiddleware {
  /**
   * Authenticates a request by verifying the Bearer access token.
   * Attaches decoded user info to `req.user`.
   */
  static authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Access denied. No token provided.'
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Access denied. Token is malformed.'
      );
    }

    try {
      const decoded = TokenHelper.verifyAccessToken(token);

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Access denied. Token is invalid or expired.'
      );
    }
  }

  /**
   * Authorizes access based on allowed roles.
   * Must be used AFTER `authenticate`.
   * @param  {...string} roles - Allowed roles (e.g., 'ADMIN', 'OWNER')
   * @returns {Function} Express middleware
   */
  static authorize(...roles) {
    return (req, _res, next) => {
      if (!req.user) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          'Access denied. Authentication required.'
        );
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          'Access denied. You do not have the required permissions.'
        );
      }

      next();
    };
  }
}

export default AuthMiddleware;
