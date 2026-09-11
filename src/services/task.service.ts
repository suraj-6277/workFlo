import mongoose, { FilterQuery } from 'mongoose';
import { Task, ITaskDocument, IRecurrenceRule } from '../models/task.model';
import { Project } from '../models/project.model';
import { Member } from '../models/member.model';
import { AppError } from '../utils/appError';
import { CreateTaskInput, UpdateTaskInput, QueryTaskInput } from '../validations/task.validation';
import { TaskScheduler } from '../jobs/schedulers/recurringTask.scheduler';

export class TaskService {
  /**
   * Create a new task within a workspace project
   */
  public static async createTask(
    workspaceId: string,
    createdBy: mongoose.Types.ObjectId,
    input: CreateTaskInput,
  ): Promise<ITaskDocument> {
    // 1. Verify project belongs to this workspace
    const project = await Project.findOne({
      _id: input.projectId,
      workspaceId,
    });

    if (!project) {
      throw AppError.notFound('Project not found in this workspace');
    }

    // 2. If assignedTo is provided, verify assignee is a member of this workspace
    if (input.assignedTo) {
      const isMember = await Member.exists({
        workspaceId,
        userId: input.assignedTo,
      });

      if (!isMember) {
        throw AppError.badRequest('Assigned user is not a member of this workspace');
      }
    }

    // 3. Compute initial nextRunAt if recurring
    let recurrenceRule: IRecurrenceRule | undefined = undefined;
    if (input.isRecurring && input.recurrenceRule) {
      const nextDate = new Date();
      if (input.recurrenceRule.frequency === 'daily') {
        nextDate.setDate(nextDate.getDate() + (input.recurrenceRule.interval || 1));
      } else if (input.recurrenceRule.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + (input.recurrenceRule.interval || 1) * 7);
      } else if (input.recurrenceRule.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + (input.recurrenceRule.interval || 1));
      }

      recurrenceRule = {
        frequency: input.recurrenceRule.frequency,
        interval: input.recurrenceRule.interval,
        endDate: input.recurrenceRule.endDate,
        nextRunAt: nextDate,
      };
    }

    const task = await Task.create({
      ...input,
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      projectId: new mongoose.Types.ObjectId(input.projectId),
      assignedTo: input.assignedTo ? new mongoose.Types.ObjectId(input.assignedTo) : undefined,
      createdBy,
      recurrenceRule,
    });

    // Automatically schedule BullMQ jobs
    if (task.dueDate && task.assignedTo) {
      await TaskScheduler.scheduleDueDateReminder(
        task._id.toString(),
        workspaceId,
        task.assignedTo.toString(),
        task.dueDate,
      );
    }

    if (task.isRecurring && recurrenceRule) {
      await TaskScheduler.registerRecurringTask(
        task._id.toString(),
        recurrenceRule.frequency,
        recurrenceRule.interval,
      );
    }

    return task;
  }

  /**
   * Get filtered and paginated tasks for a workspace
   */
  public static async getTasks(workspaceId: string, query: QueryTaskInput) {
    const filter: FilterQuery<ITaskDocument> = {
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    };

    if (query.projectId) filter.projectId = new mongoose.Types.ObjectId(query.projectId);
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignedTo) filter.assignedTo = new mongoose.Types.ObjectId(query.assignedTo);

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'name email avatarUrl')
        .populate('createdBy', 'name email')
        .populate('projectId', 'name color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single task by ID within a workspace
   */
  public static async getTaskById(taskId: string, workspaceId: string): Promise<ITaskDocument> {
    const task = await Task.findOne({ _id: taskId, workspaceId })
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name color');

    if (!task) {
      throw AppError.notFound('Task not found in this workspace');
    }

    return task;
  }

  /**
   * Update task fields
   */
  public static async updateTask(
    taskId: string,
    workspaceId: string,
    input: UpdateTaskInput,
  ): Promise<ITaskDocument> {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, workspaceId },
      { $set: input },
      { new: true, runValidators: true },
    )
      .populate('assignedTo', 'name email avatarUrl')
      .populate('projectId', 'name color');

    if (!task) {
      throw AppError.notFound('Task not found in this workspace');
    }

    if (task.status === 'DONE') {
      await TaskScheduler.cancelReminderJob(taskId);
    }

    return task;
  }

  /**
   * Delete task
   */
  public static async deleteTask(taskId: string, workspaceId: string): Promise<void> {
    const task = await Task.findOneAndDelete({ _id: taskId, workspaceId });
    if (!task) {
      throw AppError.notFound('Task not found in this workspace');
    }

    await TaskScheduler.cancelReminderJob(taskId);
  }

  /**
   * Get workspace task analytics
   */
  public static async getAnalytics(workspaceId: string) {
    const matchWorkspace = { workspaceId: new mongoose.Types.ObjectId(workspaceId) };

    const [statusStats, priorityStats, overdueCount] = await Promise.all([
      Task.aggregate([
        { $match: matchWorkspace },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: matchWorkspace },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        workspaceId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'DONE' },
      }),
    ]);

    return {
      byStatus: statusStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      byPriority: priorityStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      overdueTasks: overdueCount,
    };
  }
}

