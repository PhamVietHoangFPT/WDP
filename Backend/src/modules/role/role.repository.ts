import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role, RoleDocument } from './schemas/role.schema'
import { IRoleRepository } from './interfaces/irole.repository'

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async getRoleIdByName(roleName: string): Promise<string | null> {
    const role = await this.roleModel.findOne({ role: roleName }).exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return role ? role._id.toString() : null
  }
}
