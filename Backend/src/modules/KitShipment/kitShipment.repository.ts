/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, Inject } from '@nestjs/common'
import { IKitShipmentRepository } from './interfaces/ikitShipment.repository'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { KitShipment, KitShipmentDocument } from './schemas/kitShipment.schema'
import { CreateKitShipmentDto } from './dto/createKitShipment.dto'
import { UpdateKitShipmentDto } from './dto/updateKitShipment.dto'
import { IKitShipmentHistoryRepository } from '../kitShipmentHistory/interfaces/iKitShipmentHistory.repository'
import { ICaseMemberRepository } from '../caseMember/interfaces/icaseMember.repository'
import { ITestTakerRepository } from '../testTaker/interfaces/itestTaker.repository'
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
  ) {}

  async getAccountIdByKitShipmentId(
    kitShipmentId: string,
  ): Promise<string | null> {
    try {
      // Tìm kitShipment bằng ID
      const kitShipment = await this.kitShipmentModel
        .findOne({ _id: kitShipmentId })
        .exec()

      if (!kitShipment || !kitShipment.caseMember) {
        return null
      }

      // Tìm caseMember bằng caseMemberId
      const caseMember = await this.caseMemberRepository.findById(
        kitShipment.caseMember.toString(),
      )

      if (!caseMember || !caseMember.testTaker) {
        return null
      }

      // Tìm testTaker bằng testTakerId
      const testTaker = await this.testTakerRepository.findById(
        caseMember.testTaker.toString(),
      )

      return testTaker?.account.toString() || null
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
  ): Promise<KitShipmentDocument> {
    const newKitShipment = new this.kitShipmentModel({
      ...createKitShipmentDto,
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
