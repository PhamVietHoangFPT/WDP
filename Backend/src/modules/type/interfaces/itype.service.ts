import { CreateTypeDto } from '../dto/createType.dto'
import { UpdateTypeDto } from '../dto/updateType.dto'
import { TypeResponseDto } from '../dto/typeResponse.dto'

export interface ITypeService {
  create(data: CreateTypeDto, userId: string): Promise<TypeResponseDto>
  findAll(): Promise<TypeResponseDto[]>
  findById(id: string): Promise<TypeResponseDto | null>
  update(
    id: string,
    data: UpdateTypeDto,
    userId: string,
  ): Promise<TypeResponseDto | null>
  delete(id: string, userId: string): Promise<boolean>
}
export const ITypeService = Symbol('ITypeService')
