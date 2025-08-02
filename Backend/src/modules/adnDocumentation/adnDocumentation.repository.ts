import {
  AdnDocumentation,
  AdnDocumentationDocument,
} from './schemas/adnDocumentation.schema'
import { IAdnDocumentationRepository } from './interfaces/iadnDocumentation.repository'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { CreateAdnDocumentationDto } from './dto/createAdnDocumentation.dto'
@Injectable()
export class AdnDocumentationRepository implements IAdnDocumentationRepository {
  constructor(
    @InjectModel(AdnDocumentation.name)
    private readonly AdnDocModel: Model<AdnDocumentationDocument>,
  ) {}

  async create(
    data: CreateAdnDocumentationDto,
    userId: string,
  ): Promise<AdnDocumentationDocument> {
    const document = new this.AdnDocModel({
      ...data,
      created_by: new mongoose.Types.ObjectId(userId),
      created_at: new Date(),
    })
    return document.save()
  }

  async findById(id: string): Promise<AdnDocumentationDocument | null> {
    return this.AdnDocModel.findById(id).exec()
  }

  async findByServiceCaseId(
    serviceCaseId: string,
  ): Promise<AdnDocumentationDocument | null> {
    // Kiểu trả về giờ là object hoặc null
    return this.AdnDocModel.findOne({ serviceCaseId }).exec()
  }
}
