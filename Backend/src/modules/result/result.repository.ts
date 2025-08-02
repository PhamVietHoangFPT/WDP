import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Result, ResultDocument } from './schemas/result.schema'
import { CreateResultDto } from './dto/createResult.dto'
import { UpdateResultDto } from './dto/updateResult.dto'
import { IResultRepository } from './interfaces/iresult.repository'
import { IServiceCaseRepository } from '../serviceCase/interfaces/iserviceCase.repository'
@Injectable()
export class ResultRepository implements IResultRepository {
  constructor(
    @InjectModel(Result.name)
    private resultModel: Model<ResultDocument>,
    @Inject(IServiceCaseRepository)
    private serviceCaseRepository: IServiceCaseRepository,
  ) {}

  async create(createResultDto: CreateResultDto): Promise<ResultDocument> {
    const newResult = new this.resultModel({
      adnPercentage: createResultDto.adnPercentage,
      conclusion: createResultDto.conclusion,
      certifierId: createResultDto.certifierId,
      created_by: createResultDto.certifierId,
      created_at: new Date(),
    })
    // Cập nhật service case với ID của kết quả mới
    await this.serviceCaseRepository.updateResultId(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      createResultDto.serviceCase.toString(),
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      newResult._id.toString(),
    )
    return await newResult.save()
  }

  async findById(id: string): Promise<ResultDocument | null> {
    return this.resultModel
      .findById(id)
      .select('adnPercentage conclusion')
      .populate({
        path: 'certifierId',
        select: 'name',
      })
      .exec()
  }

  async update(
    id: string,
    updateResultDto: UpdateResultDto,
  ): Promise<ResultDocument | null> {
    return this.resultModel
      .findByIdAndUpdate(
        id,
        {
          adnPercentage: updateResultDto.adnPercentage,
          conclusion: updateResultDto.conclusion,
          updated_by: updateResultDto.certifierId,
          updated_at: new Date(),
          certifierId: updateResultDto.certifierId,
        },
        { new: true },
      )
      .exec()
  }

  async checkIsUpdated(id: string): Promise<boolean | null> {
    const result = await this.resultModel.findById(id).exec()
    if (!result) {
      return null
    }
    return result.updated_at !== null
  }
}
