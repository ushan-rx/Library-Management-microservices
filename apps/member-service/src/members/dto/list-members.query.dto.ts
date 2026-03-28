import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MemberStatus } from '../enums/member-status.enum';

export class ListMembersQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'Nimal' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MemberStatus, example: MemberStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MemberStatus)
  membershipStatus?: MemberStatus;
}
