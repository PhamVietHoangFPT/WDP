import { UpdateRelationshipDto } from '../dto/updateRelationship.dto'
import { CreateRelationshipDto } from '../dto/createRelationship.dto'
import { RelationshipDocument } from '../schemas/relationship1.schema'

export interface IRelationshipRepository {
  create(
    userId: string,
    createRelationshipDto: CreateRelationshipDto,
  ): Promise<RelationshipDocument>
  findOneByName(name: string): Promise<RelationshipDocument | null>
  findOneById(id: string): Promise<RelationshipDocument | null>
  findAll(): Promise<RelationshipDocument[]>
  updateRelationshipById(
    id: string,
    userId: string,
    updateRelationshipDto: Partial<UpdateRelationshipDto>,
  ): Promise<RelationshipDocument | null>
  restore(
    id: string,
    userId: string,
    updateRelationshipDto: Partial<UpdateRelationshipDto>,
  ): Promise<RelationshipDocument | null>
  deleteRelationshipById(
    id: string,
    userId: string,
  ): Promise<RelationshipDocument | null>
}
export const IRelationshipRepository = Symbol('IRelationshipRepository')
