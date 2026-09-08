import { IUserDocument } from '../models/user.model';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends IUserDocument {}
  }
}

