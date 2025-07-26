import { IDashboardService } from './interfaces/idashboard.service'
import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { IDashboardRepository } from './interfaces/idashboard.repository'

@Injectable()
export class DashboardService implements IDashboardService {
  constructor(
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async getDashboardData(
    startDate: Date,
    endDate: Date,
    facilityId?: string,
  ): Promise<any> {
    // 2. Gọi hàm gốc để lấy dữ liệu
    const statistics = await this.dashboardRepository.getDashboardData(
      startDate,
      endDate,
      'day', // groupBy là 'day' cho ngày hôm nay
      facilityId,
    )

    // 3. Gói dữ liệu lại với thông tin về ngày
    return {
      info: {
        type: 'today',
        date: startDate.toISOString().split('T')[0], // Trả về ngày dạng YYYY-MM-DD
      },
      statistics,
    }
  }

  async getDashboardDataByWeek(
    week: number,
    year: number,
    facilityId?: string,
  ): Promise<any> {
    const firstDayOfYear = new Date(Date.UTC(year, 0, 1))
    const daysOffset = (week - 1) * 7
    const firstMonday = new Date(firstDayOfYear)
    firstMonday.setUTCDate(
      firstMonday.getUTCDate() + (1 - (firstDayOfYear.getUTCDay() || 7)),
    )

    const startDate = new Date(firstMonday)
    startDate.setUTCDate(firstMonday.getUTCDate() + daysOffset)

    const endDate = new Date(startDate)
    endDate.setUTCDate(startDate.getUTCDate() + 6)
    endDate.setUTCHours(23, 59, 59, 999)

    const statistics = await this.dashboardRepository.getDashboardData(
      startDate,
      endDate,
      'day',
      facilityId,
    )

    return {
      info: {
        type: 'week',
        week,
        year,
        startDate,
        endDate,
      },
      statistics,
    }
  }

  /**
   * ## 3. Lấy dữ liệu thống kê theo Tháng
   */
  async getDashboardDataByMonth(
    month: number,
    year: number,
    facilityId?: string,
  ): Promise<any> {
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

    const statistics = await this.dashboardRepository.getDashboardData(
      startDate,
      endDate,
      'week',
      facilityId,
    )

    return {
      info: {
        type: 'month',
        month,
        year,
      },
      statistics,
    }
  }

  /**
   * ## 4. Lấy dữ liệu thống kê theo Quý
   */
  async getDashboardDataByQuarter(
    quarter: number,
    year: number,
    facilityId?: string,
  ): Promise<any> {
    const startMonth = (quarter - 1) * 3
    const startDate = new Date(Date.UTC(year, startMonth, 1))
    const endDate = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999))

    const statistics = await this.dashboardRepository.getDashboardData(
      startDate,
      endDate,
      'month',
      facilityId,
    )

    return {
      info: {
        type: 'quarter',
        quarter,
        year,
      },
      statistics,
    }
  }

  /**
   * ## 5. Lấy dữ liệu thống kê theo Năm
   */
  async getDashboardDataByYear(
    year: number,
    facilityId?: string,
  ): Promise<any> {
    const startDate = new Date(Date.UTC(year, 0, 1))
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))

    const statistics = await this.dashboardRepository.getDashboardData(
      startDate,
      endDate,
      'month',
      facilityId,
    )

    return {
      info: {
        type: 'year',
        year,
      },
      statistics,
    }
  }
}
