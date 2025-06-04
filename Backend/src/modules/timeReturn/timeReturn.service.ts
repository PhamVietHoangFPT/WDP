import { TimeReturnRepository } from './timeReturn.repository'
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { CreateTimeReturnDto } from './dto/createTimeReturn.dto'
import { ITimeReturnService } from './interfaces/itimeReturn.service'
import { ITimeReturnRepository } from './interfaces/itimeReturn.repository'
import { TimeReturn } from './schemas/timeReturn.schema'
import { TimeReturnResponseDto } from './dto/timeReturn.response.dto'
import { UpdateTimeReturnDto } from './dto/updateTimeReturn.dto'
@Injectable()
export class TimeReturnService implements ITimeReturnService {
  constructor(
    @Inject(ITimeReturnRepository)
    private readonly timeReturnRepository: ITimeReturnRepository,
  ) { }
  private mapToResponseDto(timeReturn: TimeReturn): TimeReturnResponseDto {
    return new TimeReturnResponseDto({
      _id: timeReturn._id,
      timeReturn: timeReturn.timeReturn,
      timeReturnFee: timeReturn.timeReturnFee,
      description: timeReturn.description,
      deleted_at: timeReturn.deleted_at,
      deleted_by: timeReturn.deleted_by,
    })
  }

  async findTimeReturnById(id: string): Promise<TimeReturnResponseDto> {
    //this variable is used to check if the time return already exists
    const existingTimeReturn = await this.timeReturnRepository.findOneById(id)
    if (!existingTimeReturn) {
      throw new ConflictException('Tình trạng mẫu thử không tồn tại')
    }
    return this.mapToResponseDto(existingTimeReturn)
  }


  async createTimeReturn(
    userId: string,
    createTimeReturnDto: CreateTimeReturnDto,
  ): Promise<CreateTimeReturnDto> {
    try {
      let newTimeReturn = await this.timeReturnRepository.create(
        userId,
        createTimeReturnDto,
      )
      return this.mapToResponseDto(newTimeReturn)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thời gian trả mẫu thử.')
    }
  }

  async findAllTimeReturn(): Promise<TimeReturnResponseDto[]> {
    const timeReturns = await this.timeReturnRepository.findAll()
    if (!timeReturns || timeReturns.length === 0) {
      throw new ConflictException('Không tìm thấy ngày trả mẫu thử nào.')
    } else {
      try {
        return timeReturns.map((timeReturn) => this.mapToResponseDto(timeReturn))
      } catch (error) {
        throw new InternalServerErrorException(
          'Lỗi khi lấy danh sách ngày trả mẫu thử.',
        )
      }
    }
  }
  
  async updateTimeReturn(
    id: string,
    userId: string,
    updateTimeReturnDto: UpdateTimeReturnDto,
  ): Promise<any> {
    const existingTimeReturn = await this.findTimeReturnById(id)
    if (
      existingTimeReturn.timeReturn === updateTimeReturnDto.timeReturn &&
      existingTimeReturn.timeReturnFee === updateTimeReturnDto.timeReturnFee &&
      existingTimeReturn.description === updateTimeReturnDto.description
    ) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }

    try {
      const updated = await this.timeReturnRepository.updateTimeReturnById(
        id,
        userId,
        { ...updateTimeReturnDto }
      )
      if (!updated) {
        throw new ConflictException('Không thể cập nhật thông tin ngày trả mẫu thử.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi thay đổi thông tin mẫu thử.',
      )
    }
  }
  async deleteTimeReturn(id: string, userId: string): Promise<any> {
    //this variable is used to check if the condition already exists
    const existingTimeReturn = await this.findTimeReturnById(id)

    if (
      existingTimeReturn.deleted_at !== null ||
      existingTimeReturn.deleted_by !== null
    ) {
      throw new ConflictException('Ngày trả mẫu thử đã bị xóa trước đó.')
    }

    try {
      const updated = await this.timeReturnRepository.deleteTimeReturnById(
        id,
        userId,
      )
      if (!updated) {
        throw new ConflictException('Không thể xóa ngày trả mẫu thử.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa ngày trả mẫu thử.')
    }
  }
}
