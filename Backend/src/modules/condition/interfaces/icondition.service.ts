import { ConditionResponseDto } from '../dto/condition-response.dto';
import { CreateConditionDto } from '../dto/create-condition.dto'

export interface IConditionService {
  // Tạo điều kiện mới
  createCondition(
    userId: string,
    createConditionDto: CreateConditionDto,
  ): Promise<CreateConditionDto>

  findAllConditions(): Promise<ConditionResponseDto[]>;

  //   // Lấy điều kiện theo ID
  //   findConditionById(id: string): Promise<any>;

  //   // Cập nhật điều kiện
  //   updateCondition(id: string, updateConditionDto: any): Promise<any>;

  //   // Xóa điều kiện
  //   deleteCondition(id: string): Promise<void>;
}

export const IConditionService = Symbol('IConditionService')
