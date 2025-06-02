import { Body, Controller, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { ITypeService } from "./interfaces/itype.service";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/common/decorators/roles.decorator";
import { RoleEnum } from "src/common/enums/role.enum";
import { ApiBearerAuth, ApiBody, ApiOperation } from "@nestjs/swagger";
import { CreateTypeDto } from "./dto/create-type.dto";

@Controller('types')
export class TypeController {
    constructor(
        @Inject(ITypeService)
        private readonly typeService: ITypeService, // <-- Thay đổi cách inject
    ) { }

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

}
