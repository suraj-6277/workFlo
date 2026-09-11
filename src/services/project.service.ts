import mongoose from 'mongoose';
import { Project, IProjectDocument } from '../models/project.model';
import { AppError } from '../utils/appError';
import { CreateProjectInput, UpdateProjectInput } from '../validations/project.validation';

export class ProjectService {
  /**
   * Create a new project scoped to a workspace
   */
  public static async createProject(
    workspaceId: string,
    input: CreateProjectInput,
  ): Promise<IProjectDocument> {
    return Project.create({
      name: input.name,
      description: input.description,
      color: input.color || '#6366F1',
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    });
  }

  /**
   * Get all projects belonging to a workspace
   */
  public static async getWorkspaceProjects(workspaceId: string): Promise<IProjectDocument[]> {
    return Project.find({ workspaceId }).sort({ createdAt: -1 });
  }

  /**
   * Get a single project by ID within a workspace
   */
  public static async getProjectById(
    projectId: string,
    workspaceId: string,
  ): Promise<IProjectDocument> {
    const project = await Project.findOne({ _id: projectId, workspaceId });
    if (!project) {
      throw AppError.notFound('Project not found in this workspace');
    }
    return project;
  }

  /**
   * Update a project's details
   */
  public static async updateProject(
    projectId: string,
    workspaceId: string,
    input: UpdateProjectInput,
  ): Promise<IProjectDocument> {
    const project = await Project.findOneAndUpdate({ _id: projectId, workspaceId }, input, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      throw AppError.notFound('Project not found in this workspace');
    }

    return project;
  }

  /**
   * Delete a project
   */
  public static async deleteProject(projectId: string, workspaceId: string): Promise<void> {
    const project = await Project.findOneAndDelete({ _id: projectId, workspaceId });
    if (!project) {
      throw AppError.notFound('Project not found in this workspace');
    }
  }
}

