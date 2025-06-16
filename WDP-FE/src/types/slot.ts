export interface Slots {
  id: number
  daysToGenerate: number
  startDate: Date
}

export interface Slot {
  _id: string;
  slotDate: string; 
  startTime: string;
  endTime: string;   
}
