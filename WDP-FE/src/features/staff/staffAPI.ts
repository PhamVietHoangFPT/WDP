import { apiSlice } from '../../apis/apiSlice'
import type { useUpdateServiceCaseStatusMutation } from '../sampleCollector/sampleCollectorAPI'

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

    getCustomerServiceCaseByEmail: builder.query({
      query: ({email, currentStatus}) => {
        return {
          url:  `/staff/service-cases?email=${email}&currentStatus=${currentStatus}`,
          method: 'GET',
        }
      },
      // Cung cấp tag với id cụ thể để caching hiệu quả hơn
      transformResponse: (res) => res,
      providesTags: ['staff'],
    }),

    getAllStatusForCustomer: builder.query({
      query: () => '/test-request-status',
      // Cũng cung cấp tag 'addresses' để nó được làm mới khi danh sách thay đổi
      providesTags: ['staff'],
    }),

    updateServiceCaseStatusForStaff: builder.mutation({
      query: ({ id, currentStatus }) => ({
        url: `/service-cases/${id}/status/${currentStatus}`,
        method: 'PATCH',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['staff'],
    }),
  }),
})

// Export ra hook được tự động tạo bởi RTK Query
export const { 
  useGetServiceCasesByCustomerQuery,
  useGetAllStatusForCustomerQuery,
  useGetCustomerServiceCaseByEmailQuery,
  useUpdateServiceCaseStatusForStaffMutation
} = StaffApi
