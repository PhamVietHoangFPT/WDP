import { ConditionResponseDto } from '../dto/condition-response.dto';
import { CreateConditionDto } from '../dto/create-condition.dto'
import { UpdateConditionDto } from '../dto/update-condition.dto';

export interface IConditionService {
  // Tạo điều kiện mới
  createCondition(
    userId: string,
    createConditionDto: CreateConditionDto,
  ): Promise<CreateConditionDto>

  findAllConditions(): Promise<ConditionResponseDto[]>;

  //   // Cập nhật điều kiện
  updateCondition(id: string, userId: string, updateConditionDto: UpdateConditionDto): Promise<any>;

  //   // Xóa điều kiện
  deleteCondition(id: string, userId: string): Promise<any>;
}

export const IConditionService = Symbol('IConditionService')
