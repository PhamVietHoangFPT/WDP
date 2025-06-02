import { TypeResponseDto } from '../dto/type-response.dto';
import { CreateTypeDto } from '../dto/create-type.dto';
export interface ITypeService {
    createType(
        userId: string,
        createTypeDto: CreateTypeDto,
    ): Promise<TypeResponseDto>;

}

export const ITypeService = Symbol('ITypeService')
