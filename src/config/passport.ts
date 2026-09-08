import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, IUserDocument } from '../models/user.model';
import { Account } from '../models/account.model';
import { verifyPassword } from '../utils/password';
import { env } from './env';
import { logger } from '../utils/logger';

// CRITICAL SECURITY INVARIANT: Store strictly user._id in session, never full user document or credentials
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUserDocument)._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    if (!user || !user.isActive) {
      done(null, false);
      return;
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// 1. Local Strategy (Email & Password)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: true,
    },
    async (email, password, done) => {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
          // Constant-time protection: avoid telling caller if email exists vs password wrong
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account is deactivated' });
        }

        const account = await Account.findOne({
          userId: user._id,
          provider: 'local',
        });

        if (!account || !account.passwordHash) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isPasswordValid = await verifyPassword(password, account.passwordHash);

        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// 2. Google OAuth Strategy (Enabled if credentials are provided)
if (
  env.GOOGLE_CLIENT_ID &&
  env.GOOGLE_CLIENT_SECRET &&
  env.GOOGLE_CLIENT_ID !== 'mock-google-client-id'
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const name = profile.displayName || profile.name?.givenName || 'Google User';
          const avatarUrl = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email associated with this Google account'), false);
          }

          // 1. Check if account with this googleId already exists
          let account = await Account.findOne({
            provider: 'google',
            providerAccountId: googleId,
          });

          if (account) {
            const existingUser = await User.findById(account.userId);
            if (!existingUser || !existingUser.isActive) {
              return done(null, false);
            }
            return done(null, existingUser);
          }

          // 2. Check if a user with this email already exists
          let user = await User.findOne({ email });

          if (!user) {
            // Create brand new user
            user = await User.create({
              name,
              email,
              avatarUrl,
              isActive: true,
            });
          }

          // Link Google Account to the user
          account = await Account.create({
            userId: user._id,
            provider: 'google',
            providerAccountId: googleId,
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error, false);
        }
      },
    ),
  );
} else {
  logger.info('ℹ️ Google OAuth not configured; skipping GoogleStrategy registration');
}

export default passport;

