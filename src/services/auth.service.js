import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import TokenHelper from '../utils/tokenHelper.js';
import { ACCOUNT_STATUS } from '../utils/constants.js';

class AuthService {
  /**
   * @param {import('../repositories/contracts/IUserRepository.js').default} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Registers a new user.
   * @param {Object} userData - { name, email, password, role, phone }
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   */
  async register(userData) {
    const { name, email, password, role, phone } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'A user with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    });

    // Generate token pair
    const { accessToken, refreshToken } = TokenHelper.generateTokenPair(user);

    // Build user response (exclude password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: userResponse, accessToken, refreshToken };
  }

  /**
   * Authenticates a user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: Object, accessToken: string, refreshToken: string }>}
   */
  async login(email, password) {
    // Find user by email (need password for comparison)
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    // Check if account is blocked
    if (user.accountStatus === ACCOUNT_STATUS.BLOCKED) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Your account has been blocked. Please contact support.'
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    // Generate token pair
    const { accessToken, refreshToken } = TokenHelper.generateTokenPair(user);

    // Build user response (exclude password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { user: userResponse, accessToken, refreshToken };
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * Implements token rotation (issues new refresh token too).
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   */
  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token is required');
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = TokenHelper.verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired refresh token');
    }

    // Find user
    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found for this token');
    }

    // Check if account is blocked
    if (user.accountStatus === ACCOUNT_STATUS.BLOCKED) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'Your account has been blocked. Please contact support.'
      );
    }

    // Generate new token pair (token rotation)
    const newAccessToken = TokenHelper.generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = TokenHelper.generateRefreshToken({
      userId: user._id,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Changes the user's password.
   * @param {string} userId - Authenticated user's ID
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   * @returns {Promise<Object>} Updated user (without password)
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Find user with password field
    const user = await this.userRepository.findByEmail(
      (await this.userRepository.findById(userId))?.email
    );

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect');
    }

    // Prevent setting the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'New password must be different from the current password'
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const updatedUser = await this.userRepository.updatePassword(userId, hashedPassword);
    return updatedUser;
  }

  /**
   * Retrieves the current authenticated user's profile.
   * @param {string} userId - Authenticated user's ID
   * @returns {Promise<Object>} User document (without password)
   */
  async getCurrentUser(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    return user;
  }
}

export default AuthService;
