import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateTypeDto } from './dto/create-type.dto';
import { ITypeService } from './interfaces/itype.service'
import { ITypeRepository } from './interfaces/itype.repository';
import { Type } from './schemas/type.schema';
import { TypeResponseDto } from './dto/type-response.dto';

export class TypeService implements ITypeService {
    private readonly logger = new Logger(TypeService.name)
    constructor(
        @Inject(ITypeRepository)
        private readonly typeRepository: ITypeRepository, // <-- Inject the repository
    ) { }
    private mapToResponseDto(type: Type): TypeResponseDto {
        return new TypeResponseDto({
            _id: type._id,
            name: type.name,
            typeFee: type.typeFee,
            isSpecial: type.isSpecial,
            condition: type.condition,
            description: type.description,
            isAdminstration: type.isAdminstration,
        })
    }

    async createType(
        userId: string,
        createTypeDto: CreateTypeDto,
    ): Promise<TypeResponseDto> {
        //this variable is used to check if the condition already exists
        try {
            let newCondition = await this.typeRepository.create(
                userId,
                createTypeDto,
            )
            return this.mapToResponseDto(newCondition)
        } catch (error) {
            throw new InternalServerErrorException(
                'Lỗi khi tạo tình trạng của mẫu thử.',
            )
        }
    }
}
