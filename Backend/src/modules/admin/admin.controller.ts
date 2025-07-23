import {
  Get,
  Put,
  Post,
  Delete,
  Controller,
  UseGuards,
  Body,
  Req,
  Query,
  Param,
} from '@nestjs/common'
import { IAdminService } from './interfaces/iadmin.service'
import { CreateManagerDto } from './dto/createManager.dto'
import { AccountResponseDto } from '../account/dto/accountResponse.dto'
import { FacilityResponseDto } from '../facility/dto/facilityResponse.dto'
import { Inject } from '@nestjs/common'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import {
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { AccountDocument } from '../account/schemas/account.schema'

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
export class AdminController {
  constructor(
    @Inject(IAdminService) private readonly adminService: IAdminService,
  ) {}

  @Get('managers')
  @ApiOperation({ summary: 'Lấy danh sách quản lý' })
  @ApiResponse({
    status: 200,
    type: ApiResponseDto<AccountResponseDto[]>,
  })
  async getManagers(): Promise<ApiResponseDto<AccountResponseDto>> {
    const data = await this.adminService.getAllManagers()
    return {
      data: data.map((item) => new AccountResponseDto(item)),
      success: true,
      message: 'Lấy danh sách quản lý thành công',
      statusCode: 200,
    }
  }

  @Get('facilities')
  @ApiOperation({ summary: 'Lấy danh sách cơ sở theo trạng thái' })
  @ApiQuery({ name: 'withManager', required: false, type: Boolean })
  async getFacilities(
    @Query('withManager') withManager: boolean = false,
  ): Promise<ApiResponseDto<FacilityResponseDto>> {
    const data = await this.adminService.getAllFacilities(withManager)
    return {
      data: data.map((item) => new FacilityResponseDto(item)),
      success: true,
      message: 'Lấy danh sách cơ sở thành công',
      statusCode: 200,
    }
  }

  @Post('create-manager')
  @ApiBody({ type: CreateManagerDto })
  async createManager(
    @Body() createManagerDto: CreateManagerDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<AccountDocument>> {
    const userId = req.user.id // Assuming user ID is available in the request
    const data = await this.adminService.createManagerAccount(
      createManagerDto,
      userId,
    )
    return {
      data: [data],
      success: true,
      message: 'Tạo tài khoản quản lý thành công',
      statusCode: 201,
    }
  }

  @Put('assign-manager/:managerId/:facilityId')
  @ApiParam({ name: 'managerId', type: String, description: 'ID của quản lý' })
  @ApiParam({ name: 'facilityId', type: String, description: 'ID của cơ sở' })
  async assignManager(
    @Param('managerId') managerId: string,
    @Param('facilityId') facilityId: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<any>> {
    const userId = req.user.id // Assuming user ID is available in the request
    const data = await this.adminService.assignManagerToFacility(
      managerId,
      facilityId,
      userId,
    )
    return {
      data: [data],
      success: true,
      message: 'Gán quản lý cho cơ sở thành công',
      statusCode: 200,
    }
  }

  @Put('unassign-manager/:managerId/:facilityId')
  @ApiParam({ name: 'facilityId', type: String, description: 'ID của cơ sở' })
  @ApiParam({ name: 'managerId', type: String, description: 'ID của quản lý' })
  async unassignManager(
    @Param('facilityId') facilityId: string,
    @Param('managerId') managerId: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<any>> {
    const userId = req.user.id // Assuming user ID is available in the request
    const data = await this.adminService.unassignManagerFromFacility(
      facilityId,
      managerId,
      userId,
    )
    return {
      data: [data],
      success: true,
      message: 'Hủy gán quản lý khỏi cơ sở thành công',
      statusCode: 200,
    }
  }

  @Delete('delete-manager/:id')
  @ApiParam({ name: 'id', type: String, description: 'ID của quản lý' })
  async deleteManager(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<AccountDocument | null>> {
    const userId = req.user.id // Assuming user ID is available in the request
    const data = await this.adminService.deleteManagerAccount(id, userId)
    return {
      data: [data],
      success: true,
      message: 'Xóa tài khoản quản lý thành công',
      statusCode: 200,
    }
  }
}
