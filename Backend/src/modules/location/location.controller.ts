import { Controller, Get, Param } from '@nestjs/common'
import { LocationService } from './location.service'
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger'

@ApiTags('location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Lấy danh sách tỉnh/thành' })
  getProvinces() {
    return this.locationService.getProvinces()
  }

  @Get('districts/:provinceCode')
  @ApiOperation({ summary: 'Lấy danh sách quận/huyện theo mã tỉnh' })
  @ApiParam({ name: 'provinceCode', type: String })
  getDistricts(@Param('provinceCode') code: string) {
    return this.locationService.getDistrictsByProvinceCode(code)
  }

  @Get('wards/:districtCode')
  @ApiOperation({ summary: 'Lấy danh sách phường/xã theo mã quận' })
  @ApiParam({ name: 'districtCode', type: String })
  getWards(@Param('districtCode') code: string) {
    return this.locationService.getWardsByDistrictCode(code)
  }
}
