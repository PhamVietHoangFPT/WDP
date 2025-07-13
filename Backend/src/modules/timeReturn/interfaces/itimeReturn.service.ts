import { CreateTimeReturnDto } from '../dto/createTimeReturn.dto'
import { TimeReturnResponseDto } from '../dto/timeReturn.response.dto'
import { UpdateTimeReturnDto } from '../dto/updateTimeReturn.dto'

export interface ITimeReturnService {
  createTimeReturn(
    userId: string,
    createTimeReturnDto: CreateTimeReturnDto,
  ): Promise<CreateTimeReturnDto>
  findAllTimeReturn(): Promise<TimeReturnResponseDto[]>
  updateTimeReturn(
    id: string,
    userId: string,
    updateTimeReturnDto: UpdateTimeReturnDto,
  ): Promise<any>
  deleteTimeReturn(id: string, userId: string): Promise<any>
  findById(id: string): Promise<TimeReturnResponseDto>
}
export const ITimeReturnService = Symbol('ITimeReturnService')
