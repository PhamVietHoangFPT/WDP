export interface Facility {
  _id: string;
  facilityName: string;
  address: {
    fullAddress: string;
  };
  phoneNumber: string | null;
}

export interface FacilityInfo {
  facilityName: string;
  address: string; // If `address` is just an ID reference
  phoneNumber: string;
}

export interface Address {
  _id: string;
  fullAddress: string;
}