import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  TestResultShipment,
  TestResultShipmentDocument,
} from './schemas/TestResultShipment.schema'
import { ITestResultShipmentRepository } from './interfaces/iTestResultShipment.repository'
import { CreateTestResultShipmentDto } from './dto/createTestResultShipment.dto'
import { UpdateTestResultShipmentDto } from './dto/updateTestResultShipment.dto'

@Injectable()
export class TestResultShipmentRepository
  implements ITestResultShipmentRepository
{
  constructor(
    @InjectModel(TestResultShipment.name)
    private testResultShipmentModel: Model<TestResultShipmentDocument>,
  ) {}
  async create(
    createTestResultShipmentDto: CreateTestResultShipmentDto,
    userId: string,
  ): Promise<TestResultShipmentDocument> {
    const newResultShipment = new this.testResultShipmentModel({
      ...createTestResultShipmentDto,
      created_at: new Date(),
      created_by: userId,
    })
    return await newResultShipment.save()
  }

  async findAll(): Promise<TestResultShipmentDocument[]> {
    return this.testResultShipmentModel.find({ deleted_at: null }).exec()
  }

  async findById(id: string): Promise<TestResultShipmentDocument | null> {
    return this.testResultShipmentModel
      .findOne({
        _id: id,
        deleted_at: null,
      })
      .exec()
  }

  async update(
    id: string,
    updateTestResultShipmentDto: UpdateTestResultShipmentDto,
    userId: string,
  ): Promise<TestResultShipmentDocument | null> {
    return this.testResultShipmentModel
      .findByIdAndUpdate(
        id,
        {
          ...updateTestResultShipmentDto,
          updated_at: new Date(),
          updated_by: userId,
        },
        { new: true },
      )
      .exec()
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.testResultShipmentModel
      .findByIdAndUpdate(
        id,
        { deleted_at: new Date(), deleted_by: userId },
        { new: true },
      )
      .exec()
    return !!result
  }
}
