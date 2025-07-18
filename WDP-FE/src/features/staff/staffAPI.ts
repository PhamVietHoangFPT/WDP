import { apiSlice } from '../../apis/apiSlice'

// Định nghĩa kiểu dữ liệu cho các tham số truyền vào để code chặt chẽ hơn
interface GetServiceCasesArgs {
  facilityId: string
  email: string
  currentStatus?: string // currentStatus là tùy chọn
}

const StaffApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Endpoint để lấy danh sách các hồ sơ dịch vụ (service cases)
     * dựa trên email của khách hàng và cơ sở của nhân viên.
     */
    getServiceCasesByCustomer: builder.query<any, GetServiceCasesArgs>({
      query: ({ facilityId, email, currentStatus }) => {
        return {
          url: `/staff/service-cases?facilityId=${facilityId}&email=${email}&currentStatus=${currentStatus || ''}`,
          method: 'GET',
        }
      },
      transformResponse: (res) => res,
      providesTags: ['staff'],
    }),
  }),
})

// Export ra hook được tự động tạo bởi RTK Query
export const { useGetServiceCasesByCustomerQuery } = StaffApi
