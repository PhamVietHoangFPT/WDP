import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
// Import class schema chính
import { Locations } from './schemas/location.schema'
import { ProvinceDto } from './dto/province.dto'
import { WardDto } from './dto/ward.dto'

@Injectable()
export class LocationService {
  // Chỉ cần inject một model duy nhất
  constructor(
    @InjectModel(Locations.name) private locationsModel: Model<Locations>,
  ) {}

  /**
   * Lấy tất cả các tỉnh/thành phố
   */
  async getProvinces(): Promise<ProvinceDto[]> {
    // Dùng projection `{ Wards: 0 }` để loại bỏ mảng Wards,
    // giúp query nhẹ hơn rất nhiều.
    return this.locationsModel.find({}, { Wards: 0 }).exec()
  }

  /**
   * Lấy các phường/xã theo mã tỉnh/thành phố
   */
  async getWardsByProvinceCode(provinceCode: string): Promise<WardDto[]> {
    // 1. Tìm document của tỉnh/thành phố có mã tương ứng
    const locationDoc = await this.locationsModel
      .findOne({ Code: provinceCode })
      .exec()

    // 2. Nếu tìm thấy, trả về mảng Wards bên trong nó. Nếu không, trả về mảng rỗng.
    if (locationDoc) {
      return locationDoc.Wards
    }

    return []
  }
}
