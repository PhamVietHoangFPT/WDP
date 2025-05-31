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
import { UpdateConditionDto } from './dto/update-condition.dto'
import { isNumber } from 'class-validator'
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
      updated_at: condition.updated_at,
      updated_by: condition.updated_by,
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


  async updateCondition(id: string, userId: string, updateConditionDto: UpdateConditionDto): Promise<ConditionResponseDto> {
    //this variable is used to check if the condition already exists
    const existingCondition = await this.conditionRepository.findOneById(id)

    if (!existingCondition) {
      throw new ConflictException('Mẫu thử không tồn tại')
    }

    if (existingCondition.name === updateConditionDto.name && existingCondition.conditionFee === updateConditionDto.conditionFee) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }

    const updateName = updateConditionDto.name
    if (updateName == "" || updateName == null) {
      updateConditionDto.name = existingCondition.name // <-- Use the existing name if not provided
    }

    // if (!isNumber(updateConditionDto.conditionFee) || updateConditionDto.conditionFee < 0) {
    //   const updateFee = updateConditionDto.conditionFee
    //   if (updateFee == null) {
    //     updateConditionDto.conditionFee = existingCondition.conditionFee // <-- Use the existing name if not provided
    //   }
    //   throw new ConflictException('Phí tình trạng mẫu thử phải là một số .')

    // }


    try {
      const updated = await this.conditionRepository.updateConditionById(
        id,
        userId,
        { name: updateConditionDto.name, conditionFee: updateConditionDto.conditionFee } // <-- Use the DTO directly
      );
      if (!updated) {
        throw new ConflictException('Không thể cập nhật tình trạng mẫu thử.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi lấy tình trạng mẫu thử.')
    }
  }
}
