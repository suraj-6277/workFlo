import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '../types/roles';

export interface IMember {
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  role: Role;
  joinedAt: Date;
}

export interface IMemberDocument extends IMember, Document {}

const memberSchema = new Schema<IMemberDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'workspaceId is required'],
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.MEMBER,
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Compound unique index: a user can only be a member of a workspace once
memberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export const Member = mongoose.model<IMemberDocument>('Member', memberSchema);

