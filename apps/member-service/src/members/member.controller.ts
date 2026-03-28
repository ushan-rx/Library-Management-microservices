import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../platform/roles/roles.decorator';
import { MemberRole } from '../platform/roles/member-role.enum';
import { RolesGuard } from '../platform/roles/roles.guard';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members.query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberService } from './member.service';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('health')
  health() {
    return this.memberService.health();
  }

  @Get(':memberId/eligibility')
  eligibility(@Param('memberId') memberId: string) {
    return this.memberService.eligibility(memberId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN, MemberRole.LIBRARIAN)
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN, MemberRole.LIBRARIAN)
  list(@Query() query: ListMembersQueryDto) {
    return this.memberService.list(query);
  }

  @Get(':memberId')
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN, MemberRole.LIBRARIAN)
  getById(@Param('memberId') memberId: string) {
    return this.memberService.getById(memberId);
  }

  @Put(':memberId')
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN, MemberRole.LIBRARIAN)
  update(
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.memberService.update(memberId, updateMemberDto);
  }

  @Delete(':memberId')
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN)
  remove(@Param('memberId') memberId: string) {
    return this.memberService.remove(memberId);
  }
}
