/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, Inject } from '@nestjs/common'
import { IKitShipmentRepository } from './interfaces/ikitShipment.repository'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model, Types } from 'mongoose'
import { KitShipment, KitShipmentDocument } from './schemas/kitShipment.schema'
import { CreateKitShipmentDto } from './dto/createKitShipment.dto'
import { UpdateKitShipmentDto } from './dto/updateKitShipment.dto'
import { IKitShipmentHistoryRepository } from '../kitShipmentHistory/interfaces/iKitShipmentHistory.repository'
import { ICaseMemberRepository } from '../caseMember/interfaces/icaseMember.repository'
import { ITestTakerRepository } from '../testTaker/interfaces/itestTaker.repository'
import { IBookingRepository } from '../booking/interfaces/ibooking.repository'
@Injectable()
export class KitShipmentRepository implements IKitShipmentRepository {
  constructor(
    @InjectModel(KitShipment.name)
    private kitShipmentModel: Model<KitShipmentDocument>,
    @Inject(IKitShipmentHistoryRepository)
    private kitShipmentHistoryRepository: IKitShipmentHistoryRepository,
    @Inject(ICaseMemberRepository)
    private caseMemberRepository: ICaseMemberRepository,
    @Inject(ITestTakerRepository)
    private testTakerRepository: ITestTakerRepository,
    @Inject(IBookingRepository)
    private bookingRepository: IBookingRepository,
  ) {}
  async findKitShipmentForDeliveryStaff(
    deliveryStaffId: string,
    currentStatus: string,
  ): Promise<KitShipmentDocument[]> {
    return await this.kitShipmentModel.aggregate([
      // B1: Match deliveryStaff và currentStatus
      {
        $match: {
          deliveryStaff: new Types.ObjectId(deliveryStaffId),
          currentStatus: new Types.ObjectId(currentStatus),
        },
      },
      // B2: Debug - Kiểm tra dữ liệu ban đầu
      // B3: Join caseMembers (thử với pipeline và let để debug)
      {
        $lookup: {
          from: 'casemembers',
          let: { caseMemberId: '$caseMember' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$caseMemberId'],
                },
              },
            },
          ],
          as: 'caseMembers',
        },
      },
      { $unwind: { path: '$caseMembers', preserveNullAndEmptyArrays: true } },
      // B4: Join addresses
      {
        $lookup: {
          from: 'addresses',
          let: { addressId: '$caseMembers.address' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$addressId'],
                },
              },
            },
          ],
          as: 'addresses',
        },
      },
      { $unwind: { path: '$addresses', preserveNullAndEmptyArrays: true } },
      // B6: Join bookings
      {
        $lookup: {
          from: 'bookings',
          localField: 'caseMembers.booking',
          foreignField: '_id',
          as: 'bookings',
        },
      },
      { $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'slots',
          let: { slotId: { $toObjectId: '$bookings.slot' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$slotId'],
                },
              },
            },
          ],
          as: 'slots',
        },
      },
      { $unwind: { path: '$slots', preserveNullAndEmptyArrays: true } },
      // B7: Join accounts
      {
        $lookup: {
          from: 'accounts',
          localField: 'bookings.account',
          foreignField: '_id',
          as: 'accounts',
        },
      },
      { $unwind: { path: '$accounts', preserveNullAndEmptyArrays: true } },
      // B8: Project kết quả
      {
        $project: {
          _id: 1,
          currentStatus: 1,
          caseMember: {
            _id: '$caseMembers._id',
            booking: {
              bookingDate: '$bookings.bookingDate',
              bookingTime: '$slots.startTime',
              account: {
                name: '$accounts.name',
                email: '$accounts.email',
                phoneNumber: '$accounts.phoneNumber',
              },
            },
            address: {
              _id: '$addresses._id',
              fullAddress: '$addresses.fullAddress',
            },
          },
        },
      },
    ])
  }

  async getAccountIdByKitShipmentId(
    kitShipmentId: string,
  ): Promise<string | null> {
    try {
      // Sử dụng aggregate để join tất cả các collection cần thiết một lần
      const result = await this.kitShipmentModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(kitShipmentId),
          },
        },
        {
          $lookup: {
            from: 'casemembers',
            let: { caseMemberId: '$caseMember' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$caseMemberId'],
                  },
                },
              },
            ],
            as: 'caseMemberData',
          },
        },
        {
          $unwind: {
            path: '$caseMemberData',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: 'bookings',
            let: { bookingId: '$caseMemberData.booking' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$_id', '$$bookingId'],
                  },
                },
              },
            ],
            as: 'bookingData',
          },
        },
        {
          $unwind: { path: '$bookingData', preserveNullAndEmptyArrays: false },
        },
        {
          $project: {
            accountId: '$bookingData.account',
          },
        },
      ])

      return result.length > 0 && result[0].accountId
        ? result[0].accountId.toString()
        : null
    } catch (error) {
      // Xử lý lỗi (có thể log lỗi hoặc throw custom error)
      throw new Error(`Failed to get accountId: ${error.message}`)
    }
  }

  async getCurrentStatusId(id: string): Promise<string | null> {
    const currentStatus = await this.kitShipmentModel
      .findOne({ _id: id })
      .select('currentStatus')
      .exec()
    return currentStatus?.currentStatus
      ? currentStatus.currentStatus.toString()
      : null
  }

  async getCaseMemberId(id: string): Promise<string | null> {
    const caseMember = await this.kitShipmentModel
      .findOne({ _id: id })
      .select('caseMember')
      .exec()
    return caseMember?.caseMember ? caseMember.caseMember.toString() : null
  }
  async getDeliveryStaffId(id: string): Promise<string | null> {
    const deliveryStaff = await this.kitShipmentModel
      .findOne({ _id: id })
      .select('deliveryStaff')
      .exec()
    return deliveryStaff?.deliveryStaff
      ? deliveryStaff.deliveryStaff.toString()
      : null
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.kitShipmentModel.countDocuments(filter).exec()
  }

  async create(
    userId: string,
    createKitShipmentDto: CreateKitShipmentDto,
    currentStatus: string,
  ): Promise<KitShipmentDocument> {
    const newKitShipment = new this.kitShipmentModel({
      ...createKitShipmentDto,
      currentStatus: new mongoose.Types.ObjectId(currentStatus),
      created_by: userId,
      created_at: new Date(),
    })
    return await newKitShipment.save()
  }

  async updateCurrentStatus(
    id: string,
    currentStatus: string,
    customerId: string,
  ): Promise<KitShipmentDocument | null> {
    const updatedKitShipment = await this.kitShipmentModel.findByIdAndUpdate(
      id,
      {
        currentStatus: new mongoose.Types.ObjectId(currentStatus),
      },
      { new: true },
    )
    await this.kitShipmentHistoryRepository.createKitShipmentHistory(
      currentStatus,
      updatedKitShipment?._id.toString(),
      customerId,
    )
    return updatedKitShipment
  }

  findAllKitShipments(
    filter: Record<string, unknown>,
  ): mongoose.Query<KitShipmentDocument[], KitShipmentDocument> {
    return this.kitShipmentModel
      .find(filter)
      .sort({ created_at: -1 })
      .populate({ path: 'currentStatus', select: '_id status' })
      .populate({ path: 'caseMember' })
      .populate({
        path: 'deliveryStaff',
        select: '-_id name email phoneNumber gender',
      })
      .lean()
  }

  async updateKitShipmentById(
    id: string,
    userId: string,
    updateKitShipmentDto: UpdateKitShipmentDto,
  ): Promise<KitShipmentDocument> {
    return this.kitShipmentModel
      .findByIdAndUpdate(
        id,
        { ...updateKitShipmentDto, updated_by: userId, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async deleteKitShipmentById(
    id: string,
    userId: string,
  ): Promise<KitShipmentDocument> {
    return this.kitShipmentModel
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
    updateKitShipmentDto: UpdateKitShipmentDto,
  ): Promise<KitShipmentDocument> {
    return this.kitShipmentModel
      .findByIdAndUpdate(
        id,
        {
          ...updateKitShipmentDto,
          updated_by: userId,
          updated_at: new Date(),
          deleted_at: null,
          deleted_by: null,
        },
        { new: true },
      )
      .exec()
  }

  async findById(id: string): Promise<KitShipmentDocument | null> {
    return this.kitShipmentModel
      .findOne({ _id: id, deleted_at: null, deleted_by: null })
      .populate({ path: 'currentStatus', select: '_id status' })
      .populate({ path: 'caseMember' })
      .populate({
        path: 'samplingKitInventory',
        select: '_id ',
        populate: { path: 'facility', select: 'facilityName -_id' },
      })
      .populate({ path: 'address', select: 'fullAddress -_id' })
      .populate({
        path: 'deliveryStaff',
        select: '-_id name email phoneNumber gender',
      })
      .exec()
  }

  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<KitShipmentDocument[], KitShipmentDocument> {
    return this.kitShipmentModel
      .find(filter)
      .lean()
      .populate({ path: 'currentStatus', select: '_id status' })
      .populate({ path: 'caseMember' })
      .populate({
        path: 'samplingKitInventory',
        select: '_id ',
        populate: { path: 'facility', select: 'facilityName -_id' },
      })
      .populate({ path: 'address', select: 'fullAddress -_id' })
      .populate({
        path: 'deliveryStaff',
        select: '-_id name email phoneNumber gender',
      })
  }
}
