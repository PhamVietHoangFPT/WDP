import { CreateManagerDto } from './dto/createManager.dto'
import {
  Account,
  AccountDocument,
} from 'src/modules/account/schemas/account.schema'
import { FacilityDocument } from 'src/modules/facility/schemas/facility.schema'
import { IAdminService } from './interfaces/iadmin.service'
import { IAdminRepository } from './interfaces/iadmin.repository'
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { IRoleRepository } from '../role/interfaces/irole.repository'
import { AccountResponseDto } from '../account/dto/accountResponse.dto'
import { FacilityResponseDto } from '../facility/dto/facilityResponse.dto'
import { isMongoId } from 'class-validator'

@Injectable()
export class AdminService implements IAdminService {
  constructor(
    @Inject(IAdminRepository)
    private readonly adminRepository: IAdminRepository,
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
  ) {}

  private mapToResponseAccountDto(user: Account): AccountResponseDto {
    return new AccountResponseDto({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      facility: user.facility,
    })
  }

  private mapToResponseFacilityDto(
    facility: FacilityDocument,
  ): FacilityResponseDto {
    return new FacilityResponseDto({
      _id: facility._id,
      facilityName: facility.facilityName,
      address: facility.address,
      phoneNumber: facility.phoneNumber,
      account: facility.account,
    })
  }

  async getAllManagers(): Promise<AccountResponseDto[]> {
    const managerRoleId = await this.roleRepository.getRoleIdByName('Manager')
    if (!managerRoleId) {
      throw new NotFoundException('Role "Manager" không tồn tại')
    }
    const managers = await this.adminRepository.getAllManagers(managerRoleId)
    return managers.map((manager) => this.mapToResponseAccountDto(manager))
  }

  async getAllFacilities(withManager: boolean): Promise<FacilityResponseDto[]> {
    const facilities = await this.adminRepository.getAllFacilities(withManager)
    if (!facilities || facilities.length === 0) {
      if (withManager) {
        throw new NotFoundException('Không tìm thấy cơ sở nào có quản lý')
      }
      throw new NotFoundException('Không tìm thấy cơ sở nào chưa có quản lý')
    }
    return facilities.map((facility) => this.mapToResponseFacilityDto(facility))
  }

  async createManagerAccount(
    createManagerDto: CreateManagerDto,
    userId: string,
  ): Promise<AccountDocument> {
    const managerRoleId = await this.roleRepository.getRoleIdByName('Manager')
    if (!managerRoleId) {
      throw new NotFoundException('Role "Manager" không tồn tại')
    }
    return this.adminRepository.createManagerAccount(createManagerDto, userId)
  }

  async deleteManagerAccount(
    id: string,
    userId: string,
  ): Promise<AccountDocument | null> {
    if (!isMongoId(id)) {
      throw new NotFoundException('ID không hợp lệ')
    }
    return this.adminRepository.deleteManagerAccount(id, userId)
  }

  async assignManagerToFacility(
    managerId: string,
    facilityId: string,
    userId: string,
  ): Promise<AccountDocument | null> {
    if (!isMongoId(managerId) || !isMongoId(facilityId)) {
      throw new NotFoundException('ID không hợp lệ')
    }
    return this.adminRepository.assignManagerToFacility(
      managerId,
      facilityId,
      userId,
    )
  }

  async unassignManagerFromFacility(
    facilityId: string,
    managerId: string,
    userId: string,
  ): Promise<FacilityDocument | null> {
    if (!isMongoId(facilityId) || !isMongoId(managerId)) {
      throw new NotFoundException('ID không hợp lệ')
    }
    return this.adminRepository.unassignManagerFromFacility(
      facilityId,
      managerId,
      userId,
    )
  }
}
