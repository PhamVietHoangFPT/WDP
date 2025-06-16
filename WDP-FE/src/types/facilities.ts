export interface Facility {
  _id: string;
  facilityName: string;
  address: {
    fullAddress: string;
  };
  phoneNumber: string | null;
}