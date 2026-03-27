import { AuthRole } from '../enums/auth-role.enum';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: AuthRole;
}
