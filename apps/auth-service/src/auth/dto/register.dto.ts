import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthRole } from '../enums/auth-role.enum';

export class RegisterDto {
  @ApiProperty({ minLength: 3, maxLength: 50, example: 'librarian01' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @ApiProperty({ example: 'librarian01@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'StrongPassword123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: AuthRole, example: AuthRole.LIBRARIAN })
  @IsEnum(AuthRole)
  role!: AuthRole;
}
