import { TypeDocument } from '../schemas/type.schema';
import { CreateTypeDto } from '../dto/create-type.dto';
export interface ITypeRepository {
    create(
        userId: string,
        createTypeDto: CreateTypeDto,
    ): Promise<TypeDocument>
}

export const ITypeRepository = Symbol('ITypeRepository')
