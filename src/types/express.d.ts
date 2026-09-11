import { IUserDocument } from '../models/user.model';
import { IMemberDocument } from '../models/member.model';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends IUserDocument {}

    interface Request {
      member?: IMemberDocument;
      workspaceId?: string;
    }
  }
}
