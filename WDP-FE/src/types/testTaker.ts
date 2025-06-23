import type { UserData } from './auth'

export interface TestTaker {
  _id: string
  name: string
  personalId: string
  dateOfBirth: Date
  account: UserData
  gender: boolean
}
