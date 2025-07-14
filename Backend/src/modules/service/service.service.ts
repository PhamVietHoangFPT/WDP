import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { IServiceService } from './interfaces/iservice.service'
import { IServiceRepository } from './interfaces/iservice.repository'
import { ServiceResponseDto } from './dto/serviceResponse.dto'
import { Service } from './schemas/service.schema'
import { CreateServiceDto } from './dto/createService.dto'
import { UpdateServiceDto } from './dto/updateService.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { isMongoId } from 'class-validator'
import { FindAllServiceQueryDto } from './dto/find-all-service-query.dto'
import { ITimeReturnRepository } from '../timeReturn/interfaces/itimeReturn.repository'
import mongoose from 'mongoose'

@Injectable()
export class ServiceService implements IServiceService {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: IServiceRepository,
    @Inject(ITimeReturnRepository)
    private readonly timeReturnRepository: ITimeReturnRepository,
  ) {}

  private mapToResponseDto(service: Service): ServiceResponseDto {
    return new ServiceResponseDto({
      _id: service._id,
      fee: service.fee,
      timeReturn: service.timeReturn,
      sample: service.sample,
      isAdministration: service.isAdministration,
      isAgnate: service.isAgnate,
      name: service.name,
      isSelfSampling: service.isSelfSampling,
      deleted_at: service.deleted_at,
      deleted_by: service.deleted_by,
    })
  }

  async findServiceById(id: string): Promise<ServiceResponseDto> {
    if (!id) {
      throw new ConflictException('ID không được để trống')
    }
    if (!isMongoId(id)) {
      throw new ConflictException('ID không hợp lệ')
    }
    const existingService = await this.serviceRepository.findOneById(id)
    if (!existingService) {
      throw new ConflictException('Dịch vụ không tồn tại')
    }
    return this.mapToResponseDto(existingService)
  }

  //this function create a new condition by checking if the Service already exists
  // if it exists, it throws a ConflictException
  // if it does not exist, it creates a new Service and returns the created Service
  async createService(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    const existingService = await this.serviceRepository.findByName(
      createServiceDto.name,
    )
    if (existingService) {
      throw new ConflictException('Tên dịch vụ đã tồn tại.')
    }
    try {
      const newService = await this.serviceRepository.create(userId, {
        ...createServiceDto,
      })
      return this.mapToResponseDto(newService)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tạo dịch vụ.')
    }
  }

  // this function returns all Services
  // if there are no Services, it throws an ConflictException
  async findAllService(
    pageNumber: number,
    pageSize: number,
    filters: Partial<FindAllServiceQueryDto>,
  ): Promise<PaginatedResponse<ServiceResponseDto>> {
    const skip = (pageNumber - 1) * pageSize

    // Buildup match condition
    const matchStage: any = {}

    if (filters.isAgnate !== undefined) {
      matchStage.isAgnate = filters.isAgnate
    }
    if (filters.isAdministration !== undefined) {
      matchStage.isAdministration = filters.isAdministration
    }
    if (filters.isSelfSampling !== undefined) {
      matchStage.isSelfSampling = filters.isSelfSampling
    }
    if (filters.name !== undefined) {
      matchStage.name = {
        $regex: filters.name,
        $options: 'i',
      }
    }

    // timeReturn
    if (filters.timeReturn !== undefined) {
      const timeReturnDoc = await this.timeReturnRepository.findOneByTimeReturn(
        filters.timeReturn,
      )
      if (timeReturnDoc) {
        matchStage.timeReturn = timeReturnDoc._id
      } else {
        // Không có timeReturn phù hợp => empty result
        throw new ConflictException('Không tìm thấy dịch vụ nào.')
      }
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'timereturns',
          localField: 'timeReturn',
          foreignField: '_id',
          as: 'timeReturn',
        },
      },
      {
        $unwind: {
          path: '$timeReturn',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'samples',
          localField: 'sample',
          foreignField: '_id',
          as: 'sample',
        },
      },
      {
        $unwind: {
          path: '$sample',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'sampletypes',
          localField: 'sample.sampleType',
          foreignField: '_id',
          as: 'sample.sampleType',
        },
      },
      {
        $unwind: {
          path: '$sample.sampleType',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]

    // Gộp filter sampleName và sampleTypeId
    const nestedMatch: any = {}

    if (filters.sampleName) {
      nestedMatch['sample.name'] = {
        $regex: filters.sampleName,
        $options: 'i',
      }
    }

    if (filters.sampleTypeId) {
      nestedMatch['sample.sampleType._id'] = new mongoose.Types.ObjectId(
        filters.sampleTypeId,
      )
    }

    // Push nested match if exists
    if (Object.keys(nestedMatch).length > 0) {
      pipeline.push({ $match: nestedMatch })
    }

    // Push root match
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage })
    }

    // Count total documents
    const totalPipeline = [...pipeline, { $count: 'total' }]
    const [totalResult] = await this.serviceRepository
      .aggregate(totalPipeline)
      .exec()
    const totalItems = totalResult?.total || 0
    const totalPages = Math.ceil(totalItems / pageSize)

    // Projection để bỏ các field không mong muốn
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        fee: 1,
        isAgnate: 1,
        isAdministration: 1,
        isSelfSampling: 1,
        timeReturn: {
          timeReturn: '$timeReturn.timeReturn',
          timeReturnFee: '$timeReturn.timeReturnFee',
        },
        sample: {
          name: '$sample.name',
          fee: '$sample.fee',
          sampleType: {
            name: '$sample.sampleType.name',
            sampleTypeFee: '$sample.sampleType.sampleTypeFee',
          },
        },
      },
    })

    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: pageSize })

    const services = await this.serviceRepository.aggregate(pipeline).exec()

    if (!services || services.length === 0) {
      throw new ConflictException('Không tìm thấy dịch vụ nào.')
    }

    const data = services.map((service: any) => this.mapToResponseDto(service))

    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }

  async updateService(
    id: string,
    userId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const existingService = await this.findServiceById(id)
    if (
      existingService.fee === updateServiceDto.fee &&
      existingService.sample === updateServiceDto.sample &&
      existingService.isAdministration === updateServiceDto.isAdministration &&
      existingService.isAgnate === existingService.isAgnate &&
      existingService.timeReturn === existingService.timeReturn
    ) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }
    try {
      const updated = await this.serviceRepository.updateServiceById(
        id,
        userId,
        {
          ...updateServiceDto,
        },
      )
      if (!updated) {
        throw new ConflictException('Không thể cập nhật dịch vụ.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thay đổi dịch vụ.')
    }
  }
  async deleteService(id: string, userId: string): Promise<ServiceResponseDto> {
    //this variable is used to check if the Service already exists
    const existingService = await this.findServiceById(id)

    if (existingService.deleted_at !== null) {
      throw new ConflictException('Dịch vụ đã bị xóa trước đó.')
    }
    try {
      const updated = await this.serviceRepository.deleteServiceById(id, userId)
      if (!updated) {
        throw new ConflictException('Không thể xóa dịch vụ.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa dịch vụ.')
    }
  }
}
