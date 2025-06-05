import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { IRelationshipService } from "./interfaces/irelationship.service";
import { AuthGuard } from "src/common/guard/auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { RoleEnum } from "src/common/enums/role.enum";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";
import { ApiResponseDto } from "src/common/dto/api-response.dto";
import { CreateRelationshipDto } from "./dto/createRelationship.dto";
import { UpdateRelationshipDto } from "./dto/updateRelationship.dto";

@Controller('relationships')
@UseGuards(AuthGuard)
@Roles(RoleEnum.ADMIN)
@ApiBearerAuth()
export class RelationshipController {
  constructor(
    @Inject(IRelationshipService)
    private readonly relationshipService: IRelationshipService
  ) { }

  @Post()
  @ApiBody({ type: CreateRelationshipDto })
  @ApiOperation({ summary: 'Tạo mối quan hệ mới' })
  create(@Body() createRelationshipDto: CreateRelationshipDto, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.relationshipService.createRelationship(user, createRelationshipDto)
  }

  @Get()
  @ApiOperation({ summary: 'Xem tất cả mối quan hệ' })
  findAllRelationships() {
    return this.relationshipService.findAllRelationships()
  }

  @Put(':id')
  @ApiBody({ type: UpdateRelationshipDto })
  @ApiOperation({ summary: 'Thay đổi thông tin mối quan hệ ' })
  update(
    @Param('id') id: string,
    @Body() updateRelationshipDto: UpdateRelationshipDto,
    @Req() req: any,
  ) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.relationshipService.updateRelationship(id, user, updateRelationshipDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mối quan hệ' })
  async deleteRelationship(@Param('id') id: string, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    await this.relationshipService.deleteRelationship(id, user)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa mối quan hệ thành công',
      statusCode: HttpStatus.OK,
    })
  }
}