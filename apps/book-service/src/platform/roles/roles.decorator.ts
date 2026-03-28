import { SetMetadata } from '@nestjs/common';
import { BookRole } from './book-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: BookRole[]) => SetMetadata(ROLES_KEY, roles);
