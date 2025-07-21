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
  findAll(): Promise<AddressDocument[]>
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
}

export const IAddressRepository = Symbol('IAddressRepository')
