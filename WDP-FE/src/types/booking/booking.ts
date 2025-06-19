import type { Slot } from "../slot";
import type { BookingStatus } from "./bookingStatus";

export interface Booking {
    _id: string;
    slot: Slot;
    bookingStatus: BookingStatus;
    bookingDate: Date;
}
