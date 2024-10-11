import { Request } from 'express';

import { UserEntity } from '../../user/user.entity';

type UserOmitted = Omit<UserEntity, 'password' | '_id'> & { id: string };

export interface RequestWithUser extends Request {
  user: UserOmitted;
}
