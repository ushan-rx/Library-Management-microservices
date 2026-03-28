import { SetMetadata } from '@nestjs/common';
import { CategoryRole } from './category-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: CategoryRole[]) =>
  SetMetadata(ROLES_KEY, roles);
