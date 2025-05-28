import mongoose from 'mongoose'
import { TestTakerRelationship } from '../schemas/testTakerRelationship.schema'

export interface ITestTakerRelationshipRepository {
  create(data: Partial<TestTakerRelationship>): Promise<TestTakerRelationship>

  findAll(): Promise<TestTakerRelationship[]>

  findById(id: string): Promise<TestTakerRelationship | null>

  delete(id: string, userId: string): Promise<TestTakerRelationship | null>

  countDocuments(filter: Record<string, unknown>): Promise<number>

  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<TestTakerRelationship[], TestTakerRelationship>

  find(filter: Record<string, unknown>): Promise<TestTakerRelationship[]>

  findByIdAndUpdate(
    id: string,
    updateData: Partial<TestTakerRelationship>,
    userId: string,
  ): Promise<TestTakerRelationship | null>

  checkDeleted(id: string): Promise<boolean>
}

export const ITestTakerRelationshipRepository = Symbol(
  'ITestTakerRelationshipRepository',
)
