import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from '../platform/roles/roles.decorator';
import { BorrowRole } from '../platform/roles/borrow-role.enum';
import { RolesGuard } from '../platform/roles/roles.guard';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { ListBorrowsQueryDto } from './dto/list-borrows.query.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';

@Controller('borrows')
@ApiTags('borrows')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get borrow-service health status' })
  health() {
    return this.borrowService.health();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(BorrowRole.ADMIN, BorrowRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({
    summary: 'Create a borrow record and decrement book inventory',
  })
  create(
    @Body() createBorrowDto: CreateBorrowDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.borrowService.create(createBorrowDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List borrow records with optional filters' })
  list(@Query() query: ListBorrowsQueryDto) {
    return this.borrowService.list(query);
  }

  @Get(':borrowId')
  @ApiOperation({ summary: 'Get a borrow record by id' })
  getById(@Param('borrowId') borrowId: string) {
    return this.borrowService.getById(borrowId);
  }

  @Put(':borrowId')
  @UseGuards(RolesGuard)
  @Roles(BorrowRole.ADMIN, BorrowRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({ summary: 'Update a borrow record by id' })
  update(
    @Param('borrowId') borrowId: string,
    @Body() updateBorrowDto: UpdateBorrowDto,
  ) {
    return this.borrowService.update(borrowId, updateBorrowDto);
  }

  @Post(':borrowId/return')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(BorrowRole.ADMIN, BorrowRole.LIBRARIAN)
  @ApiSecurity('x-user-role')
  @ApiOperation({
    summary: 'Return a borrowed book and generate overdue fine if needed',
  })
  returnBook(
    @Param('borrowId') borrowId: string,
    @Body() returnBookDto: ReturnBookDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.borrowService.returnBook(borrowId, returnBookDto, userId);
  }

  @Get(':borrowId/overdue-status')
  @ApiOperation({ summary: 'Get overdue status for a borrow record' })
  overdueStatus(@Param('borrowId') borrowId: string) {
    return this.borrowService.overdueStatus(borrowId);
  }
}
