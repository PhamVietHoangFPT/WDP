import type { Sample } from './sample'
import type { TimeReturn } from './timeReturn'

export interface Service {
  _id: string
  name: string
  fee: number
  timeReturn: TimeReturn
  sample: Sample
  isAdministration: boolean
  isSelfSampling: boolean
  isAgnate: boolean
  delete_by: string
  delete_at: Date
}
