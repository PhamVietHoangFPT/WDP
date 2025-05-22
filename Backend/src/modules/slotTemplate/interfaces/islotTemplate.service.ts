import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { CreateSlotTemplateDto } from '../dto/CreateSlotTemplate.dto'
export interface ISlotTemplateService {
  findAllSlotTemplates(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<any>>

  findSlotTemplateById(id: string): Promise<any> // Có thể throw lỗi nếu không tìm thấy

  createSlotTemplate(createSlotTemplateDto: CreateSlotTemplateDto): Promise<any>

  updateSlotTemplate(
    id: string,
    updateSlotTemplateDto: Partial<any>,
  ): Promise<any> // Có thể throw lỗi

  deleteSlotTemplate(id: string): Promise<void> // Có thể throw lỗi
}
export const ISlotTemplateService = Symbol('ISlotTemplateService')
