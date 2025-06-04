import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ITypeService } from './interfaces/itype.service'

import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger'
import { CreateTypeDto } from './dto/create-type.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { UpdateTypeDto } from './dto/update-response.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'

@Controller('types')
export class TypeController {
  constructor(
    @Inject(ITypeService)
    private readonly typeService: ITypeService, // <-- Thay đổi cách inject
  ) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Post()
  @ApiBody({ type: CreateTypeDto })
  @ApiOperation({ summary: 'Tạo loại mẫu thử mới' })
  create(@Body() createConditionDto: CreateTypeDto, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.typeService.createType(user, createConditionDto)
  }
  @Get()
  @ApiOperation({ summary: 'Xem tất cả loại của mẫu thử' })
  findAllConditions() {
    return this.typeService.findAllTypes()
  }
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Put(':id')
  @ApiBody({ type: UpdateTypeDto })
  @ApiOperation({ summary: 'Thay đổi thông tin loại mẫu thử' })
  update(
    @Param('id') id: string,
    @Body() updateTypeDto: UpdateTypeDto,
    @Req() req: any,
  ) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.typeService.updateType(id, user, updateTypeDto)
  }
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa loại mẫu thử' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    await this.typeService.deleteType(id, user)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa loại mẫu thử thành công',
      statusCode: HttpStatus.OK,
    })
  }
}
