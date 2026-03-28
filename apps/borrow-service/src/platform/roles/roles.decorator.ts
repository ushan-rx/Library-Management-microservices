import { SetMetadata } from '@nestjs/common';
import { BorrowRole } from './borrow-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: BorrowRole[]) => SetMetadata(ROLES_KEY, roles);
