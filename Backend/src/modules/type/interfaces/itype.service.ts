import { CreateTypeDto } from '../dto/create-type.dto'
import { TypeResponseDto } from '../dto/type-response.dto'
import { UpdateTypeDto } from '../dto/update-response.dto'

export interface ITypeService {
  createType(
    userId: string,
    createTypeDto: CreateTypeDto,
  ): Promise<CreateTypeDto>

  findAllTypes(): Promise<TypeResponseDto[]>

  updateType(
    id: string,
    userId: string,
    updateTypeDto: UpdateTypeDto,
  ): Promise<any>

  deleteType(id: string, userId: string): Promise<any>
}

export const ITypeService = Symbol('ITypeService')
