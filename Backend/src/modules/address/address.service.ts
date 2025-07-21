import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  IAddressRepository,
  CreateCompleteAddressData,
  UpdateCompleteAddressData,
} from './interfaces/iaddress.repository'
import { IAddressService } from './interfaces/iaddress.service'
import { AddressResponseDto } from './dto/address.response.dto'
import { CreateAddressDto } from './dto/create-address.dto'
import { UpdateAddressDto } from './dto/updateAddress.dto'
import { UpdateFacilityAddressDto } from './dto/updateFacilityAddress.dto'
import { Address, Point } from './schemas/address.schema'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { CreateAddressFacilityDto } from './dto/createAddressFacility.dto'
@Injectable()
export class AddressService implements IAddressService {
  constructor(
    @Inject(IAddressRepository)
    private readonly addressRepo: IAddressRepository,
    private readonly httpService: HttpService,
  ) {}

  private mapToResponseDto(address: Address): AddressResponseDto {
    return new AddressResponseDto({
      _id: address._id,
      fullAddress: address.fullAddress,
      isKitShippingAddress: address.isKitShippingAddress,
      account: address.account,
      location: address.location,
    })
  }

  // --- HÀM LẤY TỌA ĐỘ ĐÃ ĐƯỢC VIẾT LẠI HOÀN TOÀN ---
  private async getCoordinatesFromAddress(address: string): Promise<Point> {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodedAddress}`
    try {
      // Gọi đến API của Nominatim
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            // Chính sách của OSM yêu cầu một User-Agent tùy chỉnh
            'User-Agent': 'NestJS-GeoCoding-App/1.0 (contact@example.com)',
          },
        }),
      )

      // Kiểm tra kết quả
      if (!response.data || response.data.length === 0) {
        throw new HttpException(
          `Không thể tìm thấy địa chỉ: "${address}"`,
          HttpStatus.BAD_REQUEST,
        )
      }

      // Lấy kết quả đầu tiên (phù hợp nhất)
      const { lat, lon } = response.data[0]
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)

      return { type: 'Point', coordinates: [longitude, latitude] } // [kinh độ, vĩ độ]
    } catch (error) {
      if (error instanceof HttpException) throw error
      console.error('Lỗi khi gọi OpenStreetMap Nominatim API:', error.message)
      throw new HttpException(
        'Lỗi từ dịch vụ định vị OpenStreetMap.',
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }
  }

  // === CÁC HÀM CÔNG KHAI BÊN DƯỚI GIỮ NGUYÊN HOÀN TOÀN ===
  // Chúng chỉ gọi đến hàm private `getCoordinatesFromAddress`, nên không cần sửa gì cả.

  async create(
    dto: CreateAddressFacilityDto,
    userId: string,
  ): Promise<AddressResponseDto> {
    const location = await this.getCoordinatesFromAddress(dto.fullAddress)
    const completeData: CreateCompleteAddressData = {
      ...dto,
      location,
      created_by: userId,
    }
    const result = await this.addressRepo.create(completeData)
    return this.mapToResponseDto(result)
  }

  async createForFacility(
    dto: CreateAddressDto,
    userId: string,
  ): Promise<AddressResponseDto> {
    const location = await this.getCoordinatesFromAddress(dto.fullAddress)
    const completeData: CreateCompleteAddressData = {
      ...dto,
      location,
      created_by: userId,
    }
    const result = await this.addressRepo.createForFacility(completeData)
    return this.mapToResponseDto(result)
  }

  async updateAddressById(
    id: string,
    data: UpdateAddressDto,
    userId: string,
  ): Promise<AddressResponseDto | null> {
    const updatePayload: UpdateCompleteAddressData = {
      ...data,
      updated_by: userId,
    }
    if (data.fullAddress && data.fullAddress.trim() !== '') {
      updatePayload.location = await this.getCoordinatesFromAddress(
        data.fullAddress,
      )
    }
    const updatedAddress = await this.addressRepo.updateAddressById(
      id,
      updatePayload,
    )
    if (!updatedAddress) return null
    return this.mapToResponseDto(updatedAddress)
  }

  async updateFacilityAddress(
    id: string,
    userId: string,
    data: UpdateFacilityAddressDto,
  ): Promise<AddressResponseDto | null> {
    const updatePayload: UpdateCompleteAddressData = {
      ...data,
      updated_by: userId,
    }
    if (data.fullAddress && data.fullAddress.trim() !== '') {
      updatePayload.location = await this.getCoordinatesFromAddress(
        data.fullAddress,
      )
    }
    const updatedAddress = await this.addressRepo.updateFacilityAddress(
      id,
      updatePayload,
    )
    if (!updatedAddress) return null
    return this.mapToResponseDto(updatedAddress)
  }

  // Các hàm còn lại đã đúng
  async findAll(): Promise<AddressResponseDto[]> {
    const data = await this.addressRepo.findAll()
    return data.map((item) => this.mapToResponseDto(item))
  }
  async findById(id: string): Promise<AddressResponseDto> {
    const address = await this.addressRepo.findById(id)
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ')
    return this.mapToResponseDto(address)
  }
}
