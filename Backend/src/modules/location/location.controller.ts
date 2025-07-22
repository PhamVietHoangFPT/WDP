import { Controller, Get, Inject, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger'
import { ILocationService } from './interfaces/ilocation.service'

@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(
    @Inject(ILocationService)
    private readonly locationService: ILocationService,
  ) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Lấy danh sách tỉnh/thành' })
  getProvinces() {
    return this.locationService.getProvinces()
  }

  @Get('wards/:provinceCode')
  @ApiOperation({ summary: 'Lấy danh sách phường/xã theo mã tỉnh' })
  @ApiParam({ name: 'provinceCode', type: String })
  getWards(@Param('provinceCode') code: string) {
    return this.locationService.getWardsByProvinceCode(code)
  }
}
