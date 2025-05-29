import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Condition } from './schemas/condition.schema'
import { CreateConditionDto } from './dto/create-condition.dto'
import { IConditionService } from './interfaces/icondition.service'
import { ConditionResponseDto } from './dto/condition-response.dto'
@Injectable()
export class ConditionService implements IConditionService {
  constructor(
    @InjectModel(Condition.name) private conditionModel: Model<Condition>,
  ) { }

  private mapToResponseDto(condition: Condition): ConditionResponseDto {
    return new ConditionResponseDto({
      _id: condition._id,
      name: condition.name,
      conditionFee: condition.conditionFee,
      created_at: condition.created_at,
      created_by: condition.created_by,
    })
  }

  async createCondition(
    userId: string,
    createConditionDto: CreateConditionDto,
  ): Promise<ConditionResponseDto> {
    const existingCondition = await this.conditionModel.findOne({
      name: createConditionDto.name,
    })
    if (existingCondition) {
      throw new ConflictException('Tình trạng của mẫu thử đã tồn tại.')
    }

    try {
      let newCondition = await this.conditionModel.create({
        name: createConditionDto.name,
        conditionFee: createConditionDto.conditionFee,
        created_at: new Date(),
        created_by: userId
      })
      return this.mapToResponseDto(newCondition)
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi tạo tình trạng của mẫu thử.',
      )
    }
  }

  //  async findAllAccounts(
  //     pageNumber: number,
  //     pageSize: number,
  //   ): Promise<PaginatedResponse<ConditionResponseDto>> {
  //     const skip = (pageNumber - 1) * pageSize
  //     const filter = {}
  //     // Fetch users and total count in parallel
  //     const [users, totalItems] = await Promise.all([
  //       this.conditionModel
  //         .findWithQuery(filter) // Returns a query object
  //         .skip(skip)
  //         .limit(pageSize)
  //         .exec(), // Execute the query
  //       this.accountsRepository.countDocuments(filter), // Use repository for count
  //     ])

  //     const totalPages = Math.ceil(totalItems / pageSize)
  //     const data = users.map((user: Account) => this.mapToResponseDto(user)) // Explicitly type `user`
  //     return {
  //       data,
  //       pagination: {
  //         totalItems,
  //         totalPages,
  //         currentPage: pageNumber,
  //         pageSize,
  //       },
  //     }
  //   }
}
