import { CreateConditionDto } from "../dto/create-condition.dto";

export interface IConditionService {
    // Tạo điều kiện mới
    createCondition(createConditionDto: CreateConditionDto): Promise<CreateConditionDto>;

    //   // Lấy tất cả các điều kiện với phân trang
    //   findAllConditions(pageNumber: number, pageSize: number): Promise<any>;

    //   // Lấy điều kiện theo ID
    //   findConditionById(id: string): Promise<any>;

    //   // Cập nhật điều kiện
    //   updateCondition(id: string, updateConditionDto: any): Promise<any>;

    //   // Xóa điều kiện
    //   deleteCondition(id: string): Promise<void>;
}

export const IConditionService = Symbol('IConditionService')