/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform, Type } from 'class-transformer'
import mongoose from 'mongoose'

// --- THAY ĐỔI 1: TẠO CÁC DTO NHỎ CHO CÁC OBJECT LỒNG NHAU ---
// DTO cho thông tin Slot đã được làm phẳng
class SlotDetailDto {
  @Expose()
  @ApiProperty({ example: '08:00' })
  startTime: string

  @Expose()
  @ApiProperty({ example: '08:30' })
  endTime: string
}

class AddressDto {
  @Expose()
  @ApiProperty({ example: '123 Nguyễn Du, P. Bến Nghé, Q.1, TP. HCM' })
  fullAddress: string
}

// DTO cho thông tin Facility đã được join
class FacilityDetailDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Cơ sở Y tế Quận 1' })
  name: string

  @Expose()
  @ApiProperty({ type: AddressDto })
  @Type(() => AddressDto) // Tương tự cho facility
  address: AddressDto
}

@Exclude()
export class BookingResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '2023-10-01T10:00:00Z', type: Date })
  bookingDate: Date

  @Expose()
  @ApiProperty({ example: 'Bị bệnh nền', type: String })
  note: string

  // --- THAY ĐỔI 2: THAY ĐỔI CẤU TRÚC CÁC TRƯỜNG ĐỂ KHỚP VỚI AGGREGATE ---

  @Expose()
  @ApiProperty({ type: String }) // Status giờ là string, không phải ObjectId
  status: string // Đổi tên từ bookingStatus thành status cho khớp với $project

  @Expose()
  @ApiProperty({ type: SlotDetailDto })
  @Type(() => SlotDetailDto) // Quan trọng: Giúp class-transformer biết cách biến đổi object lồng nhau
  slot: SlotDetailDto

  @Expose()
  @ApiProperty({ type: FacilityDetailDto })
  @Type(() => FacilityDetailDto) // Tương tự cho facility
  facility: FacilityDetailDto

  // Giữ lại account và payment nếu bạn muốn trả về
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  account: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value.toString(), { toPlainOnly: true })
  payment: mongoose.Schema.Types.ObjectId

  // --- THAY ĐỔI 3: CẬP NHẬT CONSTRUCTOR ---
  // Constructor giờ đây nhận vào một object bất kỳ (kết quả từ aggregate)
  constructor(partial: any) {
    Object.assign(this, partial)
  }
}
