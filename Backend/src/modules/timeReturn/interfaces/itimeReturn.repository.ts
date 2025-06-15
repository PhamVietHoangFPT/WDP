import { CreateTimeReturnDto } from '../dto/createTimeReturn.dto'
import { UpdateTimeReturnDto } from '../dto/updateTimeReturn.dto'
import { TimeReturnDocument } from '../schemas/timeReturn.schema'

export interface ITimeReturnRepository {
  create(
    userId: string,
    createTimeReturnDto: CreateTimeReturnDto,
  ): Promise<TimeReturnDocument>
  findOneById(id: string): Promise<TimeReturnDocument | null>
  findAll(): Promise<TimeReturnDocument[]>
  updateTimeReturnById(
    id: string,
    userId: string,
    updateTimeReturnDto: Partial<UpdateTimeReturnDto>,
  ): Promise<TimeReturnDocument | null>
  restore(
    id: string,
    userId: string,
    updateTimeReturnDto: Partial<UpdateTimeReturnDto>,
  ): Promise<TimeReturnDocument | null>
  deleteTimeReturnById(
    id: string,
    userId: string,
  ): Promise<TimeReturnDocument | null>
  getTimeReturnFeeById(id: string): Promise<number | null>
}
export const ITimeReturnRepository = Symbol('ITimeReturnRepository')
