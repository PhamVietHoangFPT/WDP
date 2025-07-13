import mongoose from 'mongoose'
import { CreateServiceDto } from '../dto/createService.dto'
import { UpdateServiceDto } from '../dto/updateService.dto'
import { Service, ServiceDocument } from '../schemas/service.schema'

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
  findById(id: string): Promise<ServiceDocument | null>
  getSampleId(id: string): Promise<string | null>
  checkIsAdministration(id: string): Promise<boolean>
  getTotalFeeService(
    id: string,
    timeReturnId: string,
    numberOfTestTaker: number,
  ): Promise<number | null>
  getTimeReturnId(id: string): Promise<string | null>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<Service[], Service>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  findByName(name: string): Promise<ServiceDocument | null>
  aggregate(pipeline: any[]): mongoose.Aggregate<any[]>;
  aggregateOne(pipeline: any[]): mongoose.Aggregate<any>;
}
export const IServiceRepository = Symbol('IServiceRepository')
