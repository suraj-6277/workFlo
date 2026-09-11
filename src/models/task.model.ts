import mongoose, { Document, Schema } from 'mongoose';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface IRecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate?: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
}

export interface ITask {
  workspaceId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  isRecurring: boolean;
  recurrenceRule?: IRecurrenceRule;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask, Document {}

const recurrenceRuleSchema = new Schema<IRecurrenceRule>(
  {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
    },
    endDate: {
      type: Date,
      default: undefined,
    },
    lastRunAt: {
      type: Date,
      default: undefined,
    },
    nextRunAt: {
      type: Date,
      default: undefined,
    },
  },
  { _id: false },
);

const taskSchema = new Schema<ITaskDocument>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'workspaceId is required'],
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'projectId is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: undefined,
    },
    status: {
      type: String,
      enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      default: 'TODO',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: undefined,
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
      index: true,
    },
    recurrenceRule: {
      type: recurrenceRuleSchema,
      default: undefined,
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

taskSchema.index({ workspaceId: 1, projectId: 1 });
taskSchema.index({ isRecurring: 1, 'recurrenceRule.nextRunAt': 1 });

export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);

