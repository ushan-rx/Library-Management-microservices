import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus } from '../enums/member-status.enum';

export class UpdateMemberDto {
  @ApiPropertyOptional({ maxLength: 150, example: 'Nimal Perera' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;

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

  @ApiPropertyOptional({ enum: MemberStatus, example: MemberStatus.BLOCKED })
  @IsOptional()
  @IsEnum(MemberStatus)
  membershipStatus?: MemberStatus;

  @ApiPropertyOptional({ example: 'Membership suspended for unpaid fines' })
  @IsOptional()
  @IsString()
  notes?: string;
}
