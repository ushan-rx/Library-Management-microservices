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
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from '../platform/roles/roles.decorator';
import { MemberRole } from '../platform/roles/member-role.enum';
import { RolesGuard } from '../platform/roles/roles.guard';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members.query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberService } from './member.service';

@Controller('members')
@ApiTags('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get member-service health status' })
  health() {
    return this.memberService.health();
  }

  @Get(':memberId/eligibility')
  @ApiOperation({ summary: 'Check whether a member is eligible to borrow' })
  eligibility(@Param('memberId') memberId: string) {
    return this.memberService.eligibility(memberId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN, MemberRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Create a new member' })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN, MemberRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'List members with optional filters' })
  list(@Query() query: ListMembersQueryDto) {
    return this.memberService.list(query);
  }

  @Get(':memberId')
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN, MemberRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Get a member by id' })
  getById(@Param('memberId') memberId: string) {
    return this.memberService.getById(memberId);
  }

  @Put(':memberId')
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN, MemberRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Update a member by id' })
  update(
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.memberService.update(memberId, updateMemberDto);
  }

  @Delete(':memberId')
  @UseGuards(RolesGuard)
  @Roles(MemberRole.ADMIN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Deactivate a member by id' })
  remove(@Param('memberId') memberId: string) {
    return this.memberService.remove(memberId);
  }
}
