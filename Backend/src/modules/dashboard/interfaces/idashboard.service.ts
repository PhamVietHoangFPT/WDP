export interface IDashboardService {
  getDashboardData(
    startDate: Date,
    endDate: Date,
    facilityId?: string,
  ): Promise<any>

  getDashboardDataByWeek(
    week: number,
    year: number,
    facilityId?: string,
  ): Promise<any>

  getDashboardDataByMonth(
    month: number,
    year: number,
    facilityId?: string,
  ): Promise<any>

  getDashboardDataByQuarter(
    quarter: number,
    year: number,
    facilityId?: string,
  ): Promise<any>

  getDashboardDataByYear(year: number, facilityId?: string): Promise<any>
}

export const IDashboardService = Symbol('IDashboardService')
