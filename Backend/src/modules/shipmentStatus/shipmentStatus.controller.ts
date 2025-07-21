import {
    Controller,
    Get,
    HttpStatus,
    Inject,
    Param,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { IShipmentStatusService } from './interfaces/ishipmentStatus.service'
import { ShipmentStatusResponseDto } from './dto/shipmentStatusResponse.dto'

@ApiTags('Shipment Status')
@Controller('shipment-status')
export class ShipmentStatusController {
    constructor(
        @Inject(IShipmentStatusService)
        private readonly shipmentStatusService: IShipmentStatusService, // <-- Thay đổi cách inject
    ) { }

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Xem tất cả Shipment Status' })
    @ApiResponse({ status: HttpStatus.OK, type: [ShipmentStatusResponseDto] })
    async findAll() {
        const result = await this.shipmentStatusService.findAllShipmentStatus()
        return result
    }

    @Get(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tìm Shipment Status' })
    @ApiResponse({ status: HttpStatus.OK, type: ShipmentStatusResponseDto })
    async findById(@Param('id') id: string): Promise<ShipmentStatusResponseDto> {
        return await this.shipmentStatusService.findShipmentStatusById(id)
    }
}
