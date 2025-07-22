export interface Ward {
  FullName: string
  Code: string
  ProvinceCode: string
}

export interface Province {
  FullName: string
  Code: string
  districts: Ward[]
}
