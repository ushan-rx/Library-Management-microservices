import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthUserStatus } from './enums/auth-user-status.enum';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ValidateTokenDto } from './dto/validate-token.dto';
import {
  conflictError,
  forbiddenError,
  unauthorizedError,
} from '../common/auth-response.helpers';
import { PasswordService } from './password.service';
import { AuthUser } from './interfaces/auth-user.interface';
import {
  AUTH_USER_REPOSITORY,
} from '../users/auth-user.repository';
import type { AuthUserRepository } from '../users/auth-user.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly authUserRepository: AuthUserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUsername = await this.authUserRepository.findByUsername(
      registerDto.username,
    );
    if (existingUsername) {
      throw conflictError('Username already exists', 'USERNAME_ALREADY_EXISTS');
    }

    const existingEmail = await this.authUserRepository.findByEmail(
      registerDto.email,
    );
    if (existingEmail) {
      throw conflictError('Email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await this.passwordService.hash(registerDto.password);
    const user = await this.authUserRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash,
      role: registerDto.role,
      status: AuthUserStatus.ACTIVE,
    });

    this.logger.log(`Auth user registered: ${user.id}`);

    return {
      success: true,
      message: 'User registered successfully',
      data: this.toRegistrationResponse(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.authUserRepository.findByLogin(loginDto.login);
    if (!user) {
      throw unauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    if (user.status === AuthUserStatus.INACTIVE) {
      throw forbiddenError('User is inactive', 'USER_INACTIVE');
    }

    if (user.status === AuthUserStatus.LOCKED) {
      throw forbiddenError('User is locked', 'USER_LOCKED');
    }

    const passwordMatches = await this.passwordService.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw unauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const lastLoginAt = new Date();
    const updatedUser = await this.authUserRepository.update(user.id, {
      lastLoginAt,
    });
    const accessToken = await this.jwtService.signAsync(
      this.toJwtPayload(updatedUser),
    );

    this.logger.log(`Auth login successful: ${updatedUser.id}`);

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        tokenType: 'Bearer',
        expiresIn: this.getTokenLifetimeInSeconds(),
        user: this.toUserSummary(updatedUser),
      },
    };
  }

  async profile(userId: string) {
    const user = await this.authUserRepository.findById(userId);
    if (!user) {
      throw unauthorizedError('Invalid token', 'TOKEN_INVALID');
    }

    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        ...this.toUserSummary(user),
        status: user.status,
      },
    };
  }

  async validateToken(validateTokenDto: ValidateTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        validateTokenDto.token,
      );

      return {
        success: true,
        message: 'Token is valid',
        data: {
          valid: true,
          user: {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
          },
        },
      };
    } catch {
      throw unauthorizedError('Invalid token', 'TOKEN_INVALID');
    }
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw unauthorizedError('Invalid token', 'TOKEN_INVALID');
    }
  }

  health() {
    return {
      success: true,
      message: 'Auth service healthy',
      data: {
        service:
          this.configService.get<string>('AUTH_SERVICE_NAME') ?? 'auth-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private toRegistrationResponse(user: AuthUser) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private toUserSummary(user: AuthUser) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  private toJwtPayload(user: AuthUser): JwtPayload {
    return {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  private getTokenLifetimeInSeconds(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h';

    if (/^\d+$/.test(expiresIn)) {
      return Number.parseInt(expiresIn, 10);
    }

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600;
    }

    const value = Number.parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 3600;
    }
  }
}
