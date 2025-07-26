export interface KitShipment {
    _id: string
    account: Account
    status?: string
    facility: Facility
    bookingDate: string
    bookingTime: string
}

export interface Facility {
    _id: string
    name: string
}

export interface Account {
    _id: string
    name: string
    email: string
    phoneNumber: string
}