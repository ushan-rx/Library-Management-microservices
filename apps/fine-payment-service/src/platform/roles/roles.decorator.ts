import { SetMetadata } from '@nestjs/common';
import { FineRole } from './fine-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: FineRole[]) => SetMetadata(ROLES_KEY, roles);
