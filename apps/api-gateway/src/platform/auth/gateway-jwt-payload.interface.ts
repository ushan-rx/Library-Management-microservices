export interface GatewayJwtPayload {
  sub: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  iat?: number;
  exp?: number;
}
