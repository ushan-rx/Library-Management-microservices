import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FineRole } from '../platform/roles/fine-role.enum';
import { Roles } from '../platform/roles/roles.decorator';
import { RolesGuard } from '../platform/roles/roles.guard';
import { CreateFineDto } from './dto/create-fine.dto';
import { ListFinesQueryDto } from './dto/list-fines.query.dto';
import { RecordFinePaymentDto } from './dto/record-fine-payment.dto';
import { FineService } from './fine.service';

@Controller('fines')
@ApiTags('fines')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get fine-payment-service health status' })
  health() {
    return this.fineService.health();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(FineRole.ADMIN, FineRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Create a fine record' })
  create(@Body() createFineDto: CreateFineDto) {
    return this.fineService.create(createFineDto);
  }

  @Get()
  @ApiOperation({ summary: 'List fines with optional filters' })
  list(@Query() query: ListFinesQueryDto) {
    return this.fineService.list(query);
  }

  @Get('borrow/:borrowId')
  @ApiOperation({ summary: 'Get a fine by borrow id' })
  getByBorrowId(@Param('borrowId') borrowId: string) {
    return this.fineService.getByBorrowId(borrowId);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'List fines for a member id' })
  getByMemberId(@Param('memberId') memberId: string) {
    return this.fineService.getByMemberId(memberId);
  }

  @Get(':fineId')
  @ApiOperation({ summary: 'Get a fine by id' })
  getById(@Param('fineId') fineId: string) {
    return this.fineService.getById(fineId);
  }

  @Post(':fineId/payments')
  @UseGuards(RolesGuard)
  @Roles(FineRole.ADMIN, FineRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Record a payment against a fine' })
  recordPayment(
    @Param('fineId') fineId: string,
    @Body() recordFinePaymentDto: RecordFinePaymentDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.fineService.recordPayment(fineId, recordFinePaymentDto, userId);
  }
}
