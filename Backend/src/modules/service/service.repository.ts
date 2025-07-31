import { Inject, Injectable } from '@nestjs/common'
import { IServiceRepository } from './interfaces/iservice.repository'
import { InjectModel } from '@nestjs/mongoose'
import { Service, ServiceDocument } from './schemas/service.schema'
import mongoose, { Model } from 'mongoose'
import { CreateServiceDto } from './dto/createService.dto'
import { UpdateServiceDto } from './dto/updateService.dto'
import { ITimeReturnRepository } from '../timeReturn/interfaces/itimeReturn.repository'
import { ISampleRepository } from '../sample/interfaces/isample.repository'

@Injectable()
export class ServiceRepository implements IServiceRepository {
  constructor(
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
    @Inject(ITimeReturnRepository)
    private readonly timeReturnRepository: ITimeReturnRepository,
    @Inject(ISampleRepository)
    private readonly sampleRepository: ISampleRepository,
  ) {}

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.serviceModel.countDocuments(filter).exec()
  }
  async create(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceDocument> {
    const newService = new this.serviceModel({
      ...createServiceDto,
      created_by: userId,
      created_at: new Date(),
    })
    return await newService.save()
  }
  async findOneById(id: string): Promise<ServiceDocument | null> {
    return this.serviceModel
      .findOne({ _id: id, deleted_at: null })
      .populate({ path: 'timeReturn', select: 'timeReturn timeReturnFee' })
      .populate({
        path: 'sample',
        select: ' name fee',
      })
      .exec()
  }

  async findAll(): Promise<ServiceDocument[] | null> {
    return await this.serviceModel
      .find({ deleted_at: null })
      .populate({ path: 'timeReturn', select: 'timeReturn timeReturnFee' })
      .populate({
        path: 'sample',
        select: 'name fee',
      })
      .exec()
  }

  async updateServiceById(
    id: string,
    userId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceDocument> {
    return this.serviceModel
      .findByIdAndUpdate(
        id,
        { ...updateServiceDto, updated_by: userId, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async deleteServiceById(
    id: string,
    userId: string,
  ): Promise<ServiceDocument> {
    return this.serviceModel
      .findByIdAndUpdate(
        id,
        { deleted_by: userId, deleted_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async restore(
    id: string,
    userId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceDocument> {
    return this.serviceModel
      .findByIdAndUpdate(
        id,
        {
          ...updateServiceDto,
          updated_by: userId,
          updated_at: new Date(),
          deleted_at: null,
          deleted_by: null,
        },
        { new: true },
      )
      .exec()
  }

  async findById(id: string): Promise<ServiceDocument | null> {
    return this.serviceModel
      .findOne({ _id: id, deleted_at: null })
      .populate({ path: 'timeReturn', select: '_id timeReturn timeReturnFee' })
      .populate({
        path: 'sample',
        select: '_id name fee',
      })
      .exec()
  }
  async findByName(name: string): Promise<ServiceDocument | null> {
    return this.serviceModel
      .findOne({ name, deleted_at: null })
      .populate({ path: 'timeReturn', select: '_id timeReturn timeReturnFee' })
      .populate({
        path: 'sample',
        select: '_id name fee',
      })
      .exec()
  }

  async getSampleId(id: string): Promise<string | null> {
    const service = await this.serviceModel
      .findOne({ _id: id, deleted_at: null })
      .select('sample')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return service?.sample ? service.sample.toString() : null
  }

  async getSampleIds(id: string[]): Promise<string[] | null> {
    const services = await this.serviceModel
      .find({ _id: { $in: id }, deleted_at: null })
      .select('sample')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return services.map((service) => service.sample.toString()) || null
  }

  async checkIsAdministration(id: string): Promise<boolean> {
    const service = await this.serviceModel
      .findOne({ _id: id, deleted_at: null })
      .select('isAdministration')
      .exec()
    return !!(service && service.isAdministration)
  }

  async getTotalFeeService(
    id: string,
    timeReturnId: string,
    numberOfTestTaker: number,
  ): Promise<number | null> {
    const serviceFee = await this.serviceModel
      .findOne({ _id: id, deleted_at: null })
      .select('fee')
      .exec()

    const timeReturnFee =
      await this.timeReturnRepository.getTimeReturnFeeById(timeReturnId)

    const sampleId = await this.getSampleId(id)

    const sampleFee = await this.sampleRepository.getSampleTotalPrice(sampleId)
    let totalFee: number
    if (numberOfTestTaker === 2) {
      totalFee = serviceFee ? serviceFee.fee + timeReturnFee + sampleFee : null
    }
    if (numberOfTestTaker === 3) {
      totalFee = serviceFee
        ? serviceFee.fee * 1.5 + timeReturnFee + sampleFee
        : null
    }

    return totalFee
  }

  async getTimeReturnId(id: string): Promise<string | null> {
    const service = await this.serviceModel
      .findOne({ _id: id })
      .select('timeReturn')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return service?.timeReturn ? service.timeReturn.toString() : null
  }

  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<ServiceDocument[], ServiceDocument> {
    return this.serviceModel
      .find(filter)
      .lean()
      .populate({ path: 'timeReturn', select: ' timeReturn timeReturnFee' })
      .populate({
        path: 'sample',
        select: ' name fee',
      })
  }
  aggregate(pipeline: any[]): mongoose.Aggregate<any[]> {
    return this.serviceModel.aggregate(pipeline)
  }

  aggregateOne(pipeline: any[]): mongoose.Aggregate<any> {
    return this.serviceModel.aggregate(pipeline)
  }

  async findByIds(serviceIds: string[]): Promise<ServiceDocument[]> {
    return this.serviceModel
      .find({
        _id: { $in: serviceIds },
      })
      .exec()
  }

  async getServiceWithSampleInventory(
    serviceId: string,
    facilityId: string,
  ): Promise<any> {
    const result = await this.serviceModel.aggregate([
      // Giai đoạn 1: Tìm chính xác service cần lấy
      {
        $match: { _id: new mongoose.Types.ObjectId(serviceId) },
      },
      // Giai đoạn 2: Join với collection 'samples'
      {
        $lookup: {
          from: 'samples',
          localField: 'sample',
          foreignField: '_id',
          as: 'sampleDetails',
        },
      },
      // ✅ GIAI ĐOẠN 2.1: Join với collection 'timereturns'
      {
        $lookup: {
          from: 'timereturns', // Giả sử tên collection là 'timereturns'
          localField: 'timeReturn',
          foreignField: '_id',
          as: 'timeReturnDetails',
        },
      },
      // Giai đoạn 3: Join với 'samplingkitinventories'
      {
        $lookup: {
          from: 'samplingkitinventories',
          let: { sampleId: '$sample' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$sample', '$$sampleId'] },
                    {
                      $eq: [
                        '$facility',
                        new mongoose.Types.ObjectId(facilityId),
                      ],
                    },
                    // Thêm điều kiện lọc deleted_at tại đây
                    { $eq: ['$deleted_at', null] },
                  ],
                },
              },
            },
          ],
          as: 'inventoryDetails',
        },
      },
      // Giai đoạn 4: Dùng $unwind an toàn cho tất cả các kết quả join
      {
        $unwind: { path: '$sampleDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: {
          path: '$timeReturnDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$inventoryDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Giai đoạn 5: Định dạng lại kết quả cuối cùng
      {
        $project: {
          _id: 1,
          name: 1,
          fee: 1,
          isAgnate: 1, // Bổ sung thêm các trường khác nếu cần
          isAdministration: 1,
          isSelfSampling: 1,
          // ✅ Cập nhật lại các trường trả về
          sample: {
            _id: '$sampleDetails._id',
            name: '$sampleDetails.name',
            fee: '$sampleDetails.fee',
          },
          timeReturn: {
            _id: '$timeReturnDetails._id',
            timeReturn: '$timeReturnDetails.timeReturn',
            timeReturnFee: '$timeReturnDetails.timeReturnFee',
            description: '$timeReturnDetails.description',
          },
          sampleInventory: {
            _id: '$inventoryDetails._id',
            lotNumber: '$inventoryDetails.lotNumber',
            expirationDate: '$inventoryDetails.expDate',
            inventory: '$inventoryDetails.inventory',
          },
        },
      },
    ])

    // aggregate luôn trả về một mảng
    return result.length > 0 ? result[0] : null
  }
}
