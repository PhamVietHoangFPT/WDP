import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { Condition } from './schemas/condition.schema'
import { CreateConditionDto } from './dto/create-condition.dto'
import { IConditionService } from './interfaces/icondition.service'
import { ConditionResponseDto } from './dto/condition-response.dto'
import { IConditionRepository } from './interfaces/icondition.repository'
@Injectable()
export class ConditionService implements IConditionService {
  private readonly logger = new Logger(ConditionService.name)
  constructor(
    @Inject(IConditionRepository)
    private readonly conditionRepository: IConditionRepository, // <-- Inject the repository
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

  //this function create a new condition by checking if the condition already exists
  // if it exists, it throws a ConflictException
  // if it does not exist, it creates a new condition and returns the created condition
  async createCondition(
    userId: string,
    createConditionDto: CreateConditionDto,
  ): Promise<ConditionResponseDto> {

    //this variable is used to check if the condition already exists
    const existingCondition = await this.conditionRepository.findOneByName(createConditionDto.name)

    if (existingCondition) {
      throw new ConflictException('Tình trạng của mẫu thử đã tồn tại.')
    }

    try {
      let newCondition = await this.conditionRepository.create(
        userId,
        createConditionDto
      )
      return this.mapToResponseDto(newCondition)
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi tạo tình trạng của mẫu thử.',
      )
    }

  }

  // this function returns all conditions
  // if there are no conditions, it throws an ConflictException
  async findAllConditions(): Promise<ConditionResponseDto[]> {
    try {
      const conditions = await this.conditionRepository.findAll()
      if (!conditions || conditions.length === 0) {
        throw new ConflictException('Không tìm thấy tình trạng mẫu thử nào.')
      }
      return conditions.map((condition) => this.mapToResponseDto(condition))
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy danh sách tình trạng mẫu thử.')
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
