import { ProvinceDto } from '../dto/province.dto'
import { WardDto } from '../dto/ward.dto'

export interface ILocationService {
  getProvinces(): Promise<ProvinceDto[]>
  getWardsByProvinceCode(provinceCode: string): Promise<WardDto[]>
}

export const ILocationService = Symbol('ILocationService')
