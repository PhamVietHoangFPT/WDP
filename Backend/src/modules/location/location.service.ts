import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom } from 'rxjs'
import { ProvinceDto } from './dto/province.dto'
import { DistrictDto } from './dto/district.dto'
import { WardDto } from './dto/ward.dto'

@Injectable()
export class LocationService {
  private readonly baseUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('PROVINCE_API')
  }

  async getProvinces(): Promise<ProvinceDto[]> {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/p`),
    )
    return response.data as ProvinceDto[]
  }

  async getDistrictsByProvinceCode(code: string): Promise<DistrictDto[]> {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/p/${code}?depth=2`),
    )
    return response.data.districts as DistrictDto[]
  }

  async getWardsByDistrictCode(code: string): Promise<WardDto[]> {
    const response = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/d/${code}?depth=2`),
    )
    return response.data.wards as WardDto[]
  }
}
