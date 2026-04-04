import {
  All,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBorrowDto } from '../../../borrow-service/src/borrows/dto/create-borrow.dto';
import { ListBorrowsQueryDto } from '../../../borrow-service/src/borrows/dto/list-borrows.query.dto';
import { ReturnBookDto } from '../../../borrow-service/src/borrows/dto/return-book.dto';
import { UpdateBorrowDto } from '../../../borrow-service/src/borrows/dto/update-borrow.dto';
import { CreateBookDto } from '../../../book-service/src/books/dto/create-book.dto';
import { InventoryAdjustDto } from '../../../book-service/src/books/dto/inventory-adjust.dto';
import { ListBooksQueryDto } from '../../../book-service/src/books/dto/list-books.query.dto';
import { UpdateBookDto } from '../../../book-service/src/books/dto/update-book.dto';
import { CreateCategoryDto } from '../../../category-service/src/categories/dto/create-category.dto';
import { ListCategoriesQueryDto } from '../../../category-service/src/categories/dto/list-categories.query.dto';
import { UpdateCategoryDto } from '../../../category-service/src/categories/dto/update-category.dto';
import { CreateFineDto } from '../../../fine-payment-service/src/fines/dto/create-fine.dto';
import { ListFinesQueryDto } from '../../../fine-payment-service/src/fines/dto/list-fines.query.dto';
import { RecordFinePaymentDto } from '../../../fine-payment-service/src/fines/dto/record-fine-payment.dto';
import { CreateMemberDto } from '../../../member-service/src/members/dto/create-member.dto';
import { ListMembersQueryDto } from '../../../member-service/src/members/dto/list-members.query.dto';
import { UpdateMemberDto } from '../../../member-service/src/members/dto/update-member.dto';
import { GatewayAuthService } from '../platform/auth/gateway-auth.service';
import { GatewayProxyService } from './gateway-proxy.service';
import { RouteAccessPolicyService } from './route-access-policy.service';
import { LoginDto } from '../../../auth-service/src/auth/dto/login.dto';
import { RegisterDto } from '../../../auth-service/src/auth/dto/register.dto';
import { ValidateTokenDto } from '../../../auth-service/src/auth/dto/validate-token.dto';
import type { Response } from 'express';
import type { RequestWithContext } from '../platform/request-context/request-context.types';

@Controller()
export class GatewayProxyController {
  constructor(
    private readonly routeAccessPolicy: RouteAccessPolicyService,
    private readonly gatewayAuthService: GatewayAuthService,
    private readonly gatewayProxyService: GatewayProxyService,
  ) {}

  @Post('auth/register')
  @ApiTags('gateway-auth')
  @ApiOperation({
    summary: 'Sign up a new user through the gateway',
    description:
      'Public route. Creates a new auth user. After registration, call /auth/login to receive a JWT.',
  })
  async register(
    @Body() _registerDto: RegisterDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('auth/login')
  @HttpCode(200)
  @ApiTags('gateway-auth')
  @ApiOperation({
    summary: 'Sign in and receive a JWT access token',
    description:
      'Public route. Accepts a username or email plus password and returns a Bearer token for protected gateway routes.',
  })
  async login(
    @Body() _loginDto: LoginDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('auth/profile')
  @ApiTags('gateway-auth')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get the authenticated user profile',
  })
  async profile(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('auth/validate')
  @HttpCode(200)
  @ApiTags('gateway-auth')
  @ApiOperation({
    summary: 'Validate a JWT and return its decoded identity',
  })
  async validate(
    @Body() _validateTokenDto: ValidateTokenDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('auth/health')
  @ApiTags('gateway-auth')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Forward auth-service health through the gateway' })
  async authHealth(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('members/health')
  @ApiTags('gateway-members')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Forward member-service health through the gateway',
  })
  async memberHealth(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('members/:memberId/eligibility')
  @ApiTags('gateway-members')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Check whether a member is eligible to borrow' })
  async memberEligibility(
    @Param('memberId') _memberId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('members')
  @ApiTags('gateway-members')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new member' })
  async createMember(
    @Body() _createMemberDto: CreateMemberDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('members')
  @ApiTags('gateway-members')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List members with optional filters' })
  async listMembers(
    @Query() _query: ListMembersQueryDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('members/:memberId')
  @ApiTags('gateway-members')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a member by id' })
  async getMemberById(
    @Param('memberId') _memberId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Put('members/:memberId')
  @ApiTags('gateway-members')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a member by id' })
  async updateMember(
    @Param('memberId') _memberId: string,
    @Body() _updateMemberDto: UpdateMemberDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Delete('members/:memberId')
  @ApiTags('gateway-members')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Deactivate a member by id' })
  async removeMember(
    @Param('memberId') _memberId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('categories/health')
  @ApiTags('gateway-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Forward category-service health through the gateway',
  })
  async categoryHealth(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('categories/:categoryId/existence')
  @ApiTags('gateway-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Check whether a category exists and is active',
  })
  async categoryExistence(
    @Param('categoryId') _categoryId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('categories')
  @ApiTags('gateway-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new category' })
  async createCategory(
    @Body() _createCategoryDto: CreateCategoryDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('categories')
  @ApiTags('gateway-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List categories with optional filters' })
  async listCategories(
    @Query() _query: ListCategoriesQueryDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('categories/:categoryId')
  @ApiTags('gateway-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a category by id' })
  async getCategoryById(
    @Param('categoryId') _categoryId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Put('categories/:categoryId')
  @ApiTags('gateway-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a category by id' })
  async updateCategory(
    @Param('categoryId') _categoryId: string,
    @Body() _updateCategoryDto: UpdateCategoryDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Delete('categories/:categoryId')
  @ApiTags('gateway-categories')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Deactivate a category by id' })
  async removeCategory(
    @Param('categoryId') _categoryId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('books/health')
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Forward book-service health through the gateway' })
  async bookHealth(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('books/:bookId/availability')
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Check whether a book is available to borrow' })
  async bookAvailability(
    @Param('bookId') _bookId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('books')
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new book record' })
  async createBook(
    @Body() _createBookDto: CreateBookDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('books')
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List books with optional filters' })
  async listBooks(
    @Query() _query: ListBooksQueryDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('books/:bookId')
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a book by id' })
  async getBookById(
    @Param('bookId') _bookId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Put('books/:bookId')
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a book by id' })
  async updateBook(
    @Param('bookId') _bookId: string,
    @Body() _updateBookDto: UpdateBookDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Delete('books/:bookId')
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Deactivate a book by id' })
  async removeBook(
    @Param('bookId') _bookId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('books/:bookId/inventory/decrement')
  @HttpCode(200)
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Decrease available book copies' })
  async decrementBookInventory(
    @Param('bookId') _bookId: string,
    @Body() _inventoryAdjustDto: InventoryAdjustDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('books/:bookId/inventory/increment')
  @HttpCode(200)
  @ApiTags('gateway-books')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Increase available book copies' })
  async incrementBookInventory(
    @Param('bookId') _bookId: string,
    @Body() _inventoryAdjustDto: InventoryAdjustDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('borrows/health')
  @ApiTags('gateway-borrows')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Forward borrow-service health through the gateway',
  })
  async borrowHealth(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('borrows')
  @ApiTags('gateway-borrows')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a borrow record and decrement book inventory',
  })
  async createBorrow(
    @Body() _createBorrowDto: CreateBorrowDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('borrows')
  @ApiTags('gateway-borrows')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List borrow records with optional filters' })
  async listBorrows(
    @Query() _query: ListBorrowsQueryDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('borrows/:borrowId')
  @ApiTags('gateway-borrows')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a borrow record by id' })
  async getBorrowById(
    @Param('borrowId') _borrowId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Put('borrows/:borrowId')
  @ApiTags('gateway-borrows')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a borrow record by id' })
  async updateBorrow(
    @Param('borrowId') _borrowId: string,
    @Body() _updateBorrowDto: UpdateBorrowDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('borrows/:borrowId/return')
  @HttpCode(200)
  @ApiTags('gateway-borrows')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Return a borrowed book and generate overdue fine if needed',
  })
  async returnBorrowedBook(
    @Param('borrowId') _borrowId: string,
    @Body() _returnBookDto: ReturnBookDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('borrows/:borrowId/overdue-status')
  @ApiTags('gateway-borrows')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get overdue status for a borrow record' })
  async getBorrowOverdueStatus(
    @Param('borrowId') _borrowId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('fines/health')
  @ApiTags('gateway-fines')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Forward fine-payment-service health through the gateway',
  })
  async fineHealth(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('fines')
  @ApiTags('gateway-fines')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a fine record' })
  async createFine(
    @Body() _createFineDto: CreateFineDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('fines')
  @ApiTags('gateway-fines')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List fines with optional filters' })
  async listFines(
    @Query() _query: ListFinesQueryDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('fines/borrow/:borrowId')
  @ApiTags('gateway-fines')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a fine by borrow id' })
  async getFineByBorrowId(
    @Param('borrowId') _borrowId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('fines/member/:memberId')
  @ApiTags('gateway-fines')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List fines for a member id' })
  async getFinesByMemberId(
    @Param('memberId') _memberId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Get('fines/:fineId')
  @ApiTags('gateway-fines')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get a fine by id' })
  async getFineById(
    @Param('fineId') _fineId: string,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @Post('fines/:fineId/payments')
  @ApiTags('gateway-fines')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Record a payment against a fine' })
  async recordFinePayment(
    @Param('fineId') _fineId: string,
    @Body() _recordFinePaymentDto: RecordFinePaymentDto,
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  @All([
    'auth',
    'auth/*path',
    'members',
    'members/*path',
    'categories',
    'categories/*path',
    'books',
    'books/*path',
    'borrows',
    'borrows/*path',
    'fines',
    'fines/*path',
  ])
  @ApiExcludeEndpoint()
  async forwardFallback(
    @Req() request: RequestWithContext,
    @Res() response: Response,
  ): Promise<void> {
    await this.forwardRequest(request, response);
  }

  private async forwardRequest(
    request: RequestWithContext,
    response: Response,
  ): Promise<void> {
    if (!this.routeAccessPolicy.isPublicRoute(request.method, request.path)) {
      await this.gatewayAuthService.authenticateRequest(request);
    }

    await this.gatewayProxyService.forward(request, response);
  }
}
