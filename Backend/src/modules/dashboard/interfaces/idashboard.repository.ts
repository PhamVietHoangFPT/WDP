export interface IDashboardRepository {
  getDashboardData(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' | 'quarter',
    facilityId?: string,
  ): Promise<any>
}

export const IDashboardRepository = Symbol('IDashboardRepository')
