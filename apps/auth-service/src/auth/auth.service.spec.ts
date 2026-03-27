import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { InMemoryAuthUserRepository } from '../users/in-memory-auth-user.repository';
import { AuthRole } from './enums/auth-role.enum';
import { AuthUserStatus } from './enums/auth-user-status.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let authUserRepository: InMemoryAuthUserRepository;

  beforeEach(() => {
    authUserRepository = new InMemoryAuthUserRepository();
    authService = new AuthService(
      authUserRepository,
      new PasswordService(),
      new JwtService({
        secret: 'test-secret',
        signOptions: { expiresIn: '1h' },
      }),
      new ConfigService({
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '1h',
        AUTH_SERVICE_NAME: 'auth-service',
      }),
    );
  });

  it('registers a user with a hashed password', async () => {
    const response = await authService.register({
      username: 'librarian01',
      email: 'librarian01@example.com',
      password: 'StrongPassword123',
      role: AuthRole.LIBRARIAN,
    });

    const storedUser = await authUserRepository.findByEmail(
      'librarian01@example.com',
    );

    expect(response.success).toBe(true);
    expect(response.data.email).toBe('librarian01@example.com');
    expect(storedUser?.passwordHash).toBeDefined();
    expect(storedUser?.passwordHash).not.toBe('StrongPassword123');
  });

  it('rejects duplicate usernames', async () => {
    await authService.register({
      username: 'admin01',
      email: 'admin01@example.com',
      password: 'StrongPassword123',
      role: AuthRole.ADMIN,
    });

    await expect(
      authService.register({
        username: 'admin01',
        email: 'admin02@example.com',
        password: 'StrongPassword123',
        role: AuthRole.ADMIN,
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'USERNAME_ALREADY_EXISTS',
        },
      },
    });
  });

  it('logs in an active user and issues a JWT token', async () => {
    await authService.register({
      username: 'member01',
      email: 'member01@example.com',
      password: 'StrongPassword123',
      role: AuthRole.MEMBER,
    });

    const response = await authService.login({
      login: 'member01@example.com',
      password: 'StrongPassword123',
    });

    expect(response.success).toBe(true);
    expect(response.data.accessToken).toEqual(expect.any(String));
    expect(response.data.expiresIn).toBe(3600);
    expect(response.data.user.role).toBe(AuthRole.MEMBER);
  });

  it('rejects invalid credentials', async () => {
    await authService.register({
      username: 'member02',
      email: 'member02@example.com',
      password: 'StrongPassword123',
      role: AuthRole.MEMBER,
    });

    await expect(
      authService.login({
        login: 'member02@example.com',
        password: 'WrongPassword123',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'INVALID_CREDENTIALS',
        },
      },
    });
  });

  it('rejects inactive users during login', async () => {
    const registeredUser = await authService.register({
      username: 'inactive-user',
      email: 'inactive@example.com',
      password: 'StrongPassword123',
      role: AuthRole.LIBRARIAN,
    });

    await authUserRepository.update(registeredUser.data.id, {
      status: AuthUserStatus.INACTIVE,
    });

    await expect(
      authService.login({
        login: 'inactive@example.com',
        password: 'StrongPassword123',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'USER_INACTIVE',
        },
      },
    });
  });
});
