import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus } from '../enums/member-status.enum';

export class CreateMemberDto {
  @ApiProperty({ maxLength: 150, example: 'Nimal Perera' })
  @IsString()
  @MaxLength(150)
  fullName!: string;

  @ApiPropertyOptional({ example: 'nimal@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ maxLength: 30, example: '+94771234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Colombo' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ enum: MemberStatus, example: MemberStatus.ACTIVE })
  @IsEnum(MemberStatus)
  membershipStatus!: MemberStatus;

  @ApiPropertyOptional({ example: 'Frequent borrower' })
  @IsOptional()
  @IsString()
  notes?: string;
}
