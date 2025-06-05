import { CreateRelationshipDto } from "../dto/createRelationship.dto"
import { RelationshipResponseDto } from "../dto/relationshipResponse.dto"
import { UpdateRelationshipDto } from "../dto/updateRelationship.dto"

export interface IRelationshipService {
    createRelationship(
        userId: string,
        createRelationshipDto: CreateRelationshipDto,
    ): Promise<CreateRelationshipDto>
    findAllRelationships(): Promise<RelationshipResponseDto[]>
    updateRelationship(
        id: string,
        userId: string,
        updateRelationshipDto: UpdateRelationshipDto,
    ): Promise<any>
    deleteRelationship(id: string, userId: string): Promise<any>
}

export const IRelationshipService = Symbol('IRelationshipService')
