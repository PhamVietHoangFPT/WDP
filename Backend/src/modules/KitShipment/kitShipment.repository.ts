import { Injectable, Inject } from '@nestjs/common'
import { IKitShipmentRepository } from './interfaces/ikitShipment.repository'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { KitShipment, KitShipmentDocument } from './schemas/kitShipment.schema'
import { CreateKitShipmentDto } from './dto/createKitShipment.dto'
import { UpdateKitShipmentDto } from './dto/updateKitShipment.dto'
@Injectable()
export class KitShipmentRepository implements IKitShipmentRepository {
  constructor(
    @InjectModel(KitShipment.name)
    private kitShipmentModel: Model<KitShipmentDocument>,
  ) {}

  async getCurrentStatusId(id: string): Promise<string | null> {
    const currentStatus = await this.kitShipmentModel
      .findOne({ _id: id })
      .select('currentStatus')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return currentStatus?.currentStatus
      ? currentStatus.currentStatus.toString()
      : null
  }

  async getCaseMemberId(id: string): Promise<string | null> {
    const caseMember = await this.kitShipmentModel
      .findOne({ _id: id })
      .select('caseMember')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return caseMember?.caseMember ? caseMember.caseMember.toString() : null
  }
  async getSamplingKitInventoryId(id: string): Promise<string | null> {
    const samplingKitInventory = await this.kitShipmentModel
      .findOne({ _id: id })
      .select('samplingKitInventory')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return samplingKitInventory?.samplingKitInventory
      ? samplingKitInventory.samplingKitInventory.toString()
      : null
  }
  async getAddressId(id: string): Promise<string | null> {
    const address = await this.kitShipmentModel
      .findOne({ _id: id })
      .select('address')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return address?.address ? address.address.toString() : null
  }
  async getDeliveryStaffId(id: string): Promise<string | null> {
    const deliveryStaff = await this.kitShipmentModel
      .findOne({ _id: id })
      .select('deliveryStaff')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
  // async findOneById(id: string): Promise<KitShipmentDocument | null> {
  //     return this.kitShipmentModel
  //         .findOne({ _id: id, deleted_at: null })
  //         .populate({ path: 'timeReturn', select: '-_id timeReturn timeReturnFee' })
  //         .populate({ path: 'sample', select: '-_id name' })
  //         .exec()
  // }

  async findAll(): Promise<KitShipmentDocument[] | null> {
    return await this.kitShipmentModel
      .find({ deleted_at: null })
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
