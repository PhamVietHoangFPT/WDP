import {
    Controller,
    Get,
    Inject,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common'
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { IKitShipmentHistoryService } from './interfaces/iKitShipmentHistory.service'
import { KitShipmentHistoryDocument } from './schemas/KitShipmentHistory.schema'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'

@ApiTags('kit-shipment-histories')
@Controller('kit-shipment-histories')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(RoleEnum.DELIVERY_STAFF, RoleEnum.CUSTOMER)
export class KitShipmentHistoryController {
    constructor(
        @Inject(IKitShipmentHistoryService)
        private readonly KitShipmentHistoryService: IKitShipmentHistoryService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Lấy tất cả lịch sử xét nghiệm ADN' })
    @ApiQuery({
        name: 'pageSize',
        required: false,
        type: Number,
        description: 'Số lượng mục trên mỗi trang',
    })
    @ApiQuery({
        name: 'pageNumber',
        required: false,
        type: Number,
        description: 'Số trang',
    })
    @ApiQuery({
        name: 'customerId',
        required: true,
        type: String,
        description: 'ID của tài khoản để lọc lịch sử xét nghiệm',
    })
    @ApiQuery({
        name: 'kitShipmentId',
        required: false,
        type: String,
        description: 'ID của trường hợp dịch vụ để lọc lịch sử xét nghiệm',
    })
    @ApiResponse({
        status: 200,
        description: 'Lịch sử xét nghiệm adn được lấy thành công',
        type: PaginatedResponseDto<KitShipmentHistoryDocument>,
    })
    async findAll(
        @Query() paginationQuery: PaginationQueryDto,
        @Query('customerId') customerId: string,
        @Query('kitShipmentId') kitShipmentId: string,
    ): Promise<PaginatedResponse<KitShipmentHistoryDocument>> {
        return this.KitShipmentHistoryService.findAllKitShipmentHistory(
            paginationQuery.pageNumber,
            paginationQuery.pageSize,
            customerId,
            kitShipmentId,
        )
    }
}
