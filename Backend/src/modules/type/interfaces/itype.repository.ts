import { TypeDocument } from '../schemas/type.schema'
import { CreateTypeDto } from '../dto/createType.dto'
import { UpdateTypeDto } from '../dto/updateType.dto'

export interface ITypeRepository {
  create(data: CreateTypeDto, userId: string): Promise<TypeDocument>
  findAll(): Promise<TypeDocument[]>
  findById(id: string): Promise<TypeDocument | null>
  update(
    id: string,
    data: UpdateTypeDto,
    userId: string,
  ): Promise<TypeDocument | null>
  delete(id: string, userId: string): Promise<boolean>
  findTypeByName(name: string): Promise<TypeDocument | null>
}
export const ITypeRepository = Symbol('ITypeRepository')
