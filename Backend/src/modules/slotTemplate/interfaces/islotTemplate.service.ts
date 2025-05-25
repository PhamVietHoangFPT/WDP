import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { CreateSlotTemplateDto } from '../dto/createSlotTemplate.dto'
export interface ISlotTemplateService {
  findAllSlotTemplates(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<any>>

  findSlotTemplateById(id: string): Promise<any> // Có thể throw lỗi nếu không tìm thấy

  createSlotTemplate(
    createSlotTemplateDto: CreateSlotTemplateDto,
    userId: string,
  ): Promise<any>

  updateSlotTemplate(
    id: string,
    updateSlotTemplateDto: Partial<any>,
    userId: string,
  ): Promise<any> // Có thể throw lỗi

  deleteSlotTemplate(id: string, userId: string): Promise<void> // Có thể throw lỗi

  findSlotByFacilityId: (facilityId: string) => Promise<any[]>
}
export const ISlotTemplateService = Symbol('ISlotTemplateService')
