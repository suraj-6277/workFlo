import mongoose, { Document, Schema } from 'mongoose';

export interface IProject {
  name: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends IProject, Document {}

const projectSchema = new Schema<IProjectDocument>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: undefined,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'workspaceId is required'],
      index: true,
    },
    color: {
      type: String,
      default: '#6366F1',
      match: [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a valid hex code (e.g. #6366F1)'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

projectSchema.index({ workspaceId: 1, name: 1 });

export const Project = mongoose.model<IProjectDocument>('Project', projectSchema);

