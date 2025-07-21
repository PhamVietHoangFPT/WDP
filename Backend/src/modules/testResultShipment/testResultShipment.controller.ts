import {
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Param,
    Inject,
    UseGuards,
    Body,
    Req,
} from '@nestjs/common'
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RoleEnum } from 'src/common/enums/role.enum'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { ITestResultShipmentService } from './interfaces/iTestResultShipment.service'
import { TestResultShipmentResponseDto } from './dto/TestResultShipmentResponse.dto'
import { CreateTestResultShipmentDto } from './dto/createTestResultShipment.dto'
import { UpdateTestResultShipmentDto } from './dto/updateTestResultShipment.dto'
@ApiTags('result-shipment')
@Controller('result-shipment')
export class TestResultShipmentController {
    constructor(
        @Inject(ITestResultShipmentService)
        private readonly TestResultShipmentService: ITestResultShipmentService, // Inject the service
    ) { }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tao mới test result shipment' })
    @ApiResponse({
        status: 201,
        description: 'Test result shipment đã được tạo thành công',
        type: ApiResponseDto<TestResultShipmentResponseDto>,
    })
    @ApiBody({ type: CreateTestResultShipmentDto })
    async create(
        @Body() createTestResultShipmentDto: CreateTestResultShipmentDto,
        @Req() req: any,
    ): Promise<ApiResponseDto<TestResultShipmentResponseDto>> {
        const user = req.user.id
        const shipment = await this.TestResultShipmentService.create(
            createTestResultShipmentDto,
            user,
        )
        return new ApiResponseDto<TestResultShipmentResponseDto>({
            statusCode: 201,
            message: 'Trạng thái vận chuyển đã được tạo thành công',
            data: [shipment],
        })
    }

    @Get()
    @ApiOperation({ summary: 'Lấy tất cả test result shipment' })
    @ApiResponse({
        status: 200,
        description: 'Danh sách tất cả test result shipment',
        type: ApiResponseDto<TestResultShipmentResponseDto>,
    })
    async findAll(): Promise<ApiResponseDto<TestResultShipmentResponseDto>> {
        const types = await this.TestResultShipmentService.findAll()
        return new ApiResponseDto<TestResultShipmentResponseDto>({
            statusCode: 200,
            message: 'Danh sách tất cả test result shipment',
            data: types,
        })
    }

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cập nhật test result shipment theo ID' })
    @ApiBody({ type: UpdateTestResultShipmentDto })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật test result shipment thành công',
        type: ApiResponseDto<TestResultShipmentResponseDto>,
    })
    async update(
        @Param('id') id: string,
        @Body() updateTestResultShipmentDto: UpdateTestResultShipmentDto,
        @Req() req: any,
    ): Promise<ApiResponseDto<TestResultShipmentResponseDto>> {
        const user = req.user.id
        const updatedType = await this.TestResultShipmentService.update(
            id,
            updateTestResultShipmentDto,
            user,
        )
        return new ApiResponseDto<TestResultShipmentResponseDto>({
            statusCode: 200,
            message: 'Cập nhật test result shipment thành công',
            data: [updatedType],
        })
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xóa test result shipment theo ID' })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({
        status: 204,
        description: 'Xóa test result shipment thành công',
    })
    async delete(
        @Param('id') id: string,
        @Req() req: any,
    ): Promise<ApiResponseDto<null>> {
        const user = req.user.id
        await this.TestResultShipmentService.delete(id, user)
        return new ApiResponseDto<null>({
            statusCode: 204,
            message: 'Xóa test result shipment thành công',
            data: null,
        })
    }
}
