import { CreateTypeDto } from '../dto/create-type.dto'
import { UpdateTypeDto } from '../dto/update-response.dto'
import { TypeDocument } from '../schemas/type.schema'

export interface ITypeRepository {
  create(userId: string, createTypeDto: CreateTypeDto): Promise<TypeDocument>
  findOneByName(name: string): Promise<TypeDocument | null>
  findOneById(id: string): Promise<TypeDocument | null>
  findAll(): Promise<TypeDocument[]>
  updateTypeById(
    id: string,
    userId: string,
    updateTypeDto: Partial<UpdateTypeDto>,
  ): Promise<TypeDocument | null>
  restore(
    id: string,
    userId: string,
    updateTypeDto: Partial<UpdateTypeDto>,
  ): Promise<TypeDocument | null>
  deleteTypeById(id: string, userId: string): Promise<TypeDocument | null>
}
export const ITypeRepository = Symbol('ITypeRepository')
