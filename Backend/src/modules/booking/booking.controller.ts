/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Inject,
  Query,
  Req,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import { IBookingService } from './interfaces/ibooking.service'
import { CreateBookingDto } from './dto/createBooking.dto'
import { UpdateBookingDto } from './dto/updateBooking.dto'
import { BookingResponseDto } from './dto/bookingResponse.dto'
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
@ApiTags('bookings')
@Controller('bookings')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(
    @Inject(IBookingService)
    private readonly bookingService: IBookingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một booking mới' })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookingResponseDto })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: any,
  ): Promise<BookingResponseDto> {
    const userId = req.user.id
    return this.bookingService.create(createBookingDto, userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin booking theo ID' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  findById(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<BookingResponseDto> {
    const userId = req.user.id
    return this.bookingService.findById(id, userId)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả lịch hẹn' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng mục trên mỗi trang (mặc định: -1)',
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: -1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách mẫu khung giờ.',
    type: PaginatedResponseDto<BookingResponseDto>,
  })
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paginationQuery: PaginationQueryDto,
    @Req() req: any,
  ): Promise<PaginatedResponseDto<BookingResponseDto>> {
    const { pageNumber, pageSize } = paginationQuery
    const userId = req.user.id
    const bookings = await this.bookingService.findAll(
      pageNumber || 1,
      pageSize || 100,
      userId,
    )
    return {
      ...bookings,
      data: bookings.data.map(
        (booking) => new BookingResponseDto({ ...booking }),
      ),
      success: true,
      message: 'Lấy danh sách mẫu khung giờ thành công',
      statusCode: HttpStatus.OK,
    }
  }

  @Put('change-slot/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin một lịch hẹn' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: any,
  ): Promise<BookingResponseDto> {
    const userId = req.user.id
    return this.bookingService.update(id, updateBookingDto, userId)
  }

  @Put('cancel/:id')
  @ApiOperation({ summary: 'Hủy một lịch hẹn' })
  @ApiResponse({ status: HttpStatus.OK, type: BookingResponseDto })
  async cancel(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<BookingResponseDto>> {
    const userId = req.user.id
    const data = await this.bookingService.cancel(id, userId)
    return new ApiResponseDto<BookingResponseDto>({
      data: [data],
      success: true,
      message: 'Hủy lịch hẹn thành công',
      statusCode: HttpStatus.OK,
    })
  }
}
