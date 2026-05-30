import envConfig from '../config/env.config.js';
import { COOKIE_NAMES } from './constants.js';

class CookieHelper {
  /**
   * Sets the refresh token as an httpOnly cookie on the response.
   * @param {import('express').Response} res - Express response object
   * @param {string} token - Refresh token value
   */
  static setRefreshTokenCookie(res, token) {
    const isProduction = envConfig.NODE_ENV === 'production';

    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/',
    });
  }

  /**
   * Clears the refresh token cookie from the response.
   * @param {import('express').Response} res - Express response object
   */
  static clearRefreshTokenCookie(res) {
    const isProduction = envConfig.NODE_ENV === 'production';

    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    });
  }
}

export default CookieHelper;
