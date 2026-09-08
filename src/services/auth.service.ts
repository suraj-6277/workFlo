import { User, IUserDocument } from '../models/user.model';
import { Account } from '../models/account.model';
import { hashPassword } from '../utils/password';
import { AppError } from '../utils/appError';
import { RegisterInput } from '../validations/auth.validation';

export class AuthService {
  /**
   * Register a new user with email and password
   */
  public static async register(input: RegisterInput): Promise<IUserDocument> {
    const normalizedEmail = input.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw AppError.conflict('An account with this email already exists');
    }

    // Hash password using 12 salt rounds
    const hashedPassword = await hashPassword(input.password);

    // Create User record
    const user = await User.create({
      name: input.name.trim(),
      email: normalizedEmail,
      isActive: true,
    });

    // Create Account record linked to User
    await Account.create({
      userId: user._id,
      provider: 'local',
      providerAccountId: normalizedEmail,
      passwordHash: hashedPassword,
    });

    return user;
  }

  /**
   * Get public profile by User ID
   */
  public static async getProfile(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }
}

