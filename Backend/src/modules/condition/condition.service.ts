import { IConditionRepository } from './interfaces/icondition.repository';
import { IConditionService } from './interfaces/icondition.service';
import { ConflictException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common"
import { Condition } from './schemas/Condition.schema';
import { ConditionResponseDto } from './dto/conditionResponse.dto';
import { isMongoId } from 'class-validator';

@Injectable()
export class ConditionService implements IConditionService {
  constructor(
    @Inject(IConditionRepository)
    private readonly conditionRepository: IConditionRepository,

  ) { }

  private mapToResponseDto(condition: Condition): ConditionResponseDto {
    return new ConditionResponseDto({
      _id: condition._id,
      condition: condition.condition,
      conditionFee: condition.conditionFee,
      deleted_at: condition.deleted_at,
    })
  }

  async findConditionById(id: string): Promise<ConditionResponseDto> {
    if (!id) {
      throw new ConflictException('ID không được để trống')
    }
    if (!isMongoId(id)) {
      throw new ConflictException('ID không hợp lệ')
    }
    const existingCondition = await this.conditionRepository.findOneById(id)
    if (!existingCondition) {
      throw new ConflictException('Condition không tồn tại')
    }
    return this.mapToResponseDto(existingCondition)
  }


  // this function returns all Services
  // if there are no Services, it throws an ConflictException
  async findAllCondition(
  ): Promise<ConditionResponseDto[]> {
    const conditions = await this.conditionRepository.findAll()
    if (!conditions || conditions.length == 0) {
      throw new ConflictException('Không tìm thấy condition nào.')
    }
    const data = conditions.map((condition: Condition) =>
      this.mapToResponseDto(condition),
    )
    try {
      return data;
    } catch (error) {
      throw new InternalServerErrorException("Failed to find condition")
    }
  }
}
