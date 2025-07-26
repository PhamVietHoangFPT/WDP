/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from '../../apis/apiSlice' // Import apiSlice gốc của bạn

// 💡 Gợi ý: Hãy đảm bảo trong file apiSlice.ts, bạn đã khai báo tagTypes: ['Dashboard']
// Ví dụ: tagTypes: ['KitShipment', 'Dashboard'],

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /dashboard/by-date: Lấy dữ liệu dashboard cho một ngày cụ thể
     */
    getDashboardDataByDate: builder.query<
      any,
      { date: string; facilityId?: string }
    >({
      query: ({ date, facilityId }) => ({
        url: '/dashboard/by-date',
        method: 'GET',
        params: { date, facilityId },
      }),
      providesTags: ['dashboard'],
    }),

    /**
     * GET /dashboard/by-week: Lấy dữ liệu dashboard theo tuần
     */
    getDashboardDataByWeek: builder.query<
      any,
      { week: number; year: number; facilityId?: string }
    >({
      query: ({ week, year, facilityId }) => ({
        url: '/dashboard/by-week',
        method: 'GET',
        params: { week, year, facilityId },
      }),
      providesTags: ['dashboard'],
    }),

    /**
     * GET /dashboard/by-month: Lấy dữ liệu dashboard theo tháng
     */
    getDashboardDataByMonth: builder.query<
      any,
      { month: number; year: number; facilityId?: string }
    >({
      query: ({ month, year, facilityId }) => ({
        url: '/dashboard/by-month',
        method: 'GET',
        params: { month, year, facilityId },
      }),
      providesTags: ['dashboard'],
    }),

    /**
     * GET /dashboard/by-quarter: Lấy dữ liệu dashboard theo quý
     */
    getDashboardDataByQuarter: builder.query<
      any,
      { quarter: number; year: number; facilityId?: string }
    >({
      query: ({ quarter, year, facilityId }) => ({
        url: '/dashboard/by-quarter',
        method: 'GET',
        params: { quarter, year, facilityId },
      }),
      providesTags: ['dashboard'],
    }),

    /**
     * GET /dashboard/by-year: Lấy dữ liệu dashboard theo năm
     */
    getDashboardDataByYear: builder.query<
      any,
      { year: number; facilityId?: string }
    >({
      query: ({ year, facilityId }) => ({
        url: '/dashboard/by-year',
        method: 'GET',
        params: { year, facilityId },
      }),
      providesTags: ['dashboard'],
    }),
  }),
})

// Export các hook được tạo tự động để sử dụng trong các component
export const {
  useGetDashboardDataByDateQuery,
  useGetDashboardDataByWeekQuery,
  useGetDashboardDataByMonthQuery,
  useGetDashboardDataByQuarterQuery,
  useGetDashboardDataByYearQuery,
} = dashboardApi
