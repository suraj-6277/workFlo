import crypto from 'crypto';
import mongoose from 'mongoose';
import { Workspace, IWorkspaceDocument } from '../models/workspace.model';
import { Member, IMemberDocument } from '../models/member.model';
import { Role } from '../types/roles';
import { AppError } from '../utils/appError';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '../validations/workspace.validation';

export class WorkspaceService {
  /**
   * Create a new workspace and automatically assign the creator as OWNER
   */
  public static async createWorkspace(
    userId: mongoose.Types.ObjectId,
    input: CreateWorkspaceInput,
  ): Promise<{ workspace: IWorkspaceDocument; member: IMemberDocument }> {
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // CRITICAL: owner strictly stores the User._id
    const workspace = await Workspace.create({
      name: input.name,
      description: input.description,
      owner: userId,
      inviteCode,
    });

    // Create the creator's membership as OWNER
    const member = await Member.create({
      userId,
      workspaceId: workspace._id,
      role: Role.OWNER,
    });

    return { workspace, member };
  }

  /**
   * Get all workspaces that the user belongs to
   */
  public static async getUserWorkspaces(userId: mongoose.Types.ObjectId) {
    const memberships = await Member.find({ userId }).select('workspaceId role joinedAt');
    const workspaceIds = memberships.map((m) => m.workspaceId);

    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } })
      .populate('owner', 'name email avatarUrl')
      .lean();

    return workspaces.map((ws) => {
      const membership = memberships.find((m) => m.workspaceId.toString() === ws._id.toString());
      return {
        ...ws,
        currentUserRole: membership?.role,
      };
    });
  }

  /**
   * Get workspace details by ID
   */
  public static async getWorkspaceById(workspaceId: string): Promise<IWorkspaceDocument> {
    const workspace = await Workspace.findById(workspaceId).populate('owner', 'name email avatarUrl');
    if (!workspace) {
      throw AppError.notFound('Workspace not found');
    }
    return workspace;
  }

  /**
   * Update workspace details
   */
  public static async updateWorkspace(
    workspaceId: string,
    input: UpdateWorkspaceInput,
  ): Promise<IWorkspaceDocument> {
    const workspace = await Workspace.findByIdAndUpdate(workspaceId, input, {
      new: true,
      runValidators: true,
    });

    if (!workspace) {
      throw AppError.notFound('Workspace not found');
    }

    return workspace;
  }

  /**
   * Delete workspace and cascade delete all associated members
   */
  public static async deleteWorkspace(workspaceId: string): Promise<void> {
    const workspace = await Workspace.findByIdAndDelete(workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found');
    }

    // Cascade delete members
    await Member.deleteMany({ workspaceId });
  }

  /**
   * Join a workspace using an invite code
   */
  public static async joinByInviteCode(
    userId: mongoose.Types.ObjectId,
    inviteCode: string,
  ): Promise<{ workspace: IWorkspaceDocument; member: IMemberDocument }> {
    const workspace = await Workspace.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!workspace) {
      throw AppError.notFound('Invalid invite code. Workspace not found.');
    }

    // Check if already a member
    const existingMember = await Member.findOne({
      workspaceId: workspace._id,
      userId,
    });

    if (existingMember) {
      throw AppError.conflict('You are already a member of this workspace');
    }

    const member = await Member.create({
      userId,
      workspaceId: workspace._id,
      role: Role.MEMBER,
    });

    return { workspace, member };
  }

  /**
   * List all members of a workspace
   */
  public static async getWorkspaceMembers(workspaceId: string) {
    return Member.find({ workspaceId })
      .populate('userId', 'name email avatarUrl')
      .sort({ joinedAt: 1 });
  }

  /**
   * Update a member's role
   */
  public static async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    newRole: Role,
  ): Promise<IMemberDocument> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found');
    }

    // Cannot change the owner's role
    if (workspace.owner.toString() === targetUserId) {
      throw AppError.badRequest('Cannot modify the role of the workspace owner');
    }

    const member = await Member.findOneAndUpdate(
      { workspaceId, userId: targetUserId },
      { role: newRole },
      { new: true },
    );

    if (!member) {
      throw AppError.notFound('Member not found in this workspace');
    }

    return member;
  }

  /**
   * Remove a member from workspace
   */
  public static async removeMember(workspaceId: string, targetUserId: string): Promise<void> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw AppError.notFound('Workspace not found');
    }

    if (workspace.owner.toString() === targetUserId) {
      throw AppError.badRequest('Cannot remove the workspace owner from the workspace');
    }

    const result = await Member.findOneAndDelete({ workspaceId, userId: targetUserId });
    if (!result) {
      throw AppError.notFound('Member not found in this workspace');
    }
  }
}

