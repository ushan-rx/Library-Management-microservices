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
import { Roles } from '../platform/roles/roles.decorator';
import { BorrowRole } from '../platform/roles/borrow-role.enum';
import { RolesGuard } from '../platform/roles/roles.guard';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { ListBorrowsQueryDto } from './dto/list-borrows.query.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';

@Controller('borrows')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Get('health')
  health() {
    return this.borrowService.health();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(BorrowRole.ADMIN, BorrowRole.LIBRARIAN)
  create(
    @Body() createBorrowDto: CreateBorrowDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.borrowService.create(createBorrowDto, userId);
  }

  @Get()
  list(@Query() query: ListBorrowsQueryDto) {
    return this.borrowService.list(query);
  }

  @Get(':borrowId')
  getById(@Param('borrowId') borrowId: string) {
    return this.borrowService.getById(borrowId);
  }

  @Put(':borrowId')
  @UseGuards(RolesGuard)
  @Roles(BorrowRole.ADMIN, BorrowRole.LIBRARIAN)
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
  returnBook(
    @Param('borrowId') borrowId: string,
    @Body() returnBookDto: ReturnBookDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.borrowService.returnBook(borrowId, returnBookDto, userId);
  }

  @Get(':borrowId/overdue-status')
  overdueStatus(@Param('borrowId') borrowId: string) {
    return this.borrowService.overdueStatus(borrowId);
  }
}
