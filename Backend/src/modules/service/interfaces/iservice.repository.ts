import { CreateServiceDto } from "../dto/createService.dto"
import { UpdateServiceDto } from "../dto/updateService.dto"
import { ServiceDocument } from "../schemas/service.schema"

export interface IServiceRepository {
    create(
        userId: string,
        createServiceDto: CreateServiceDto,
    ): Promise<ServiceDocument>
    findOneById(id: string): Promise<ServiceDocument | null>
    findAll(): Promise<ServiceDocument[]>
    updateServiceById(
        id: string,
        userId: string,
        updateServiceDto: Partial<UpdateServiceDto>,
    ): Promise<ServiceDocument | null>
    restore(
        id: string,
        userId: string,
        updateServiceDto: Partial<UpdateServiceDto>,
    ): Promise<ServiceDocument | null>
    deleteServiceById(id: string, userId: string): Promise<ServiceDocument | null>
}
export const IServiceRepository = Symbol('IServiceRepository')
