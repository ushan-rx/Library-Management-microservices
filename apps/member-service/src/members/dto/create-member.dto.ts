import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { MemberStatus } from '../enums/member-status.enum';

export class CreateMemberDto {
  @IsString()
  @MaxLength(150)
  fullName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsEnum(MemberStatus)
  membershipStatus!: MemberStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
