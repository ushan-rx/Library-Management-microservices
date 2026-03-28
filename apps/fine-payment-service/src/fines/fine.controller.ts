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
import { FineRole } from '../platform/roles/fine-role.enum';
import { Roles } from '../platform/roles/roles.decorator';
import { RolesGuard } from '../platform/roles/roles.guard';
import { CreateFineDto } from './dto/create-fine.dto';
import { ListFinesQueryDto } from './dto/list-fines.query.dto';
import { RecordFinePaymentDto } from './dto/record-fine-payment.dto';
import { FineService } from './fine.service';

@Controller('fines')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @Get('health')
  health() {
    return this.fineService.health();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(FineRole.ADMIN, FineRole.LIBRARIAN)
  create(@Body() createFineDto: CreateFineDto) {
    return this.fineService.create(createFineDto);
  }

  @Get()
  list(@Query() query: ListFinesQueryDto) {
    return this.fineService.list(query);
  }

  @Get('borrow/:borrowId')
  getByBorrowId(@Param('borrowId') borrowId: string) {
    return this.fineService.getByBorrowId(borrowId);
  }

  @Get('member/:memberId')
  getByMemberId(@Param('memberId') memberId: string) {
    return this.fineService.getByMemberId(memberId);
  }

  @Get(':fineId')
  getById(@Param('fineId') fineId: string) {
    return this.fineService.getById(fineId);
  }

  @Post(':fineId/payments')
  @UseGuards(RolesGuard)
  @Roles(FineRole.ADMIN, FineRole.LIBRARIAN)
  recordPayment(
    @Param('fineId') fineId: string,
    @Body() recordFinePaymentDto: RecordFinePaymentDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.fineService.recordPayment(fineId, recordFinePaymentDto, userId);
  }
}
