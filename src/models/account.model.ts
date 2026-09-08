import mongoose, { Document, Schema } from 'mongoose';

export type AuthProvider = 'local' | 'google';

export interface IAccount {
  userId: mongoose.Types.ObjectId;
  provider: AuthProvider;
  providerAccountId: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccountDocument extends IAccount, Document {}

const accountSchema = new Schema<IAccountDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId reference is required'],
      index: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      required: [true, 'Auth provider is required'],
    },
    providerAccountId: {
      type: String,
      required: [true, 'providerAccountId is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const Account = mongoose.model<IAccountDocument>('Account', accountSchema);
