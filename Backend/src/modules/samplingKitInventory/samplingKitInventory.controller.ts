import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Inject,
  UseGuards,
} from '@nestjs/common'
import { ISamplingKitInventoryService } from './interfaces/isamplingKitInventory.service'
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'
import { CreateSamplingKitInventoryDto } from './dto/createSamplingKitInventory.dto'
import { SamplingKitInventoryResponseDto } from './dto/samplingKitInventoryResponse.dto'
import { SamplingKitInventory } from './schemas/samplingKitInventory.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { FacilityAccessGuard } from 'src/common/guard/facility.guard'
import { RoleEnum } from 'src/common/enums/role.enum'
import { Roles } from 'src/common/decorators/roles.decorator'

@ApiTags('sampling-kit-inventory')
@Controller('sampling-kit-inventory')
@UseGuards(AuthGuard, RolesGuard, FacilityAccessGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.STAFF)
export class SamplingKitInventoryController {
  constructor(
    @Inject(ISamplingKitInventoryService)
    private readonly samplingKitInventoryService: ISamplingKitInventoryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sample kit mới' })
  @ApiBody({
    type: CreateSamplingKitInventoryDto,
  })
  create() {
    // Logic for creating a new sampling kit inventory
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả sample kit' })
  findAll() {
    // Logic for retrieving all sampling kit inventories
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sample kit theo ID' })
  findById() {
    // Logic for retrieving a sampling kit inventory by ID
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sample kit theo ID' })
  update() {
    // Logic for updating a sampling kit inventory by ID
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sample kit theo ID' })
  delete() {
    // Logic for deleting a sampling kit inventory by ID
  }
}
