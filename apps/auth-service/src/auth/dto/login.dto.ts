import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'librarian01@example.com' })
  @IsString()
  login!: string;

  @ApiProperty({ minLength: 8, example: 'StrongPassword123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
