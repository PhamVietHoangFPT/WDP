import { AddressDocument, Point } from '../schemas/address.schema'

export interface CreateCompleteAddressData {
  fullAddress: string
  location: Point
  created_by: string
  isKitShippingAddress?: boolean
  account?: string
}

export interface UpdateCompleteAddressData {
  fullAddress?: string
  location?: Point
  updated_by: string
  isKitShippingAddress?: boolean
  account?: string
}

export interface IAddressRepository {
  create(data: CreateCompleteAddressData): Promise<AddressDocument>
  findAll(account: string): Promise<AddressDocument[]>
  createForFacility(data: CreateCompleteAddressData): Promise<AddressDocument>
  updateAddressById(
    id: string,
    data: UpdateCompleteAddressData,
  ): Promise<AddressDocument | null>
  findById(id: string): Promise<AddressDocument | null>
  updateFacilityAddress(
    id: string,
    data: UpdateCompleteAddressData,
  ): Promise<AddressDocument | null>
  getDefaultAddressByAccount(account: string): Promise<AddressDocument | null>
  updateAllAddressToNotDefault(account: string): Promise<AddressDocument[]>
  updateDefaultAddressById(id: string): Promise<AddressDocument | null>
  deleteAddressById(id: string, userId: string): Promise<boolean | null>
}

export const IAddressRepository = Symbol('IAddressRepository')
