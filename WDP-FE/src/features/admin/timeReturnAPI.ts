import { apiSlice } from '../../apis/apiSlice'

// Đổi tên biến để phù hợp với chức năng
const timeReturnAPI = apiSlice.injectEndpoints({
  // Thêm tagTypes để quản lý cache hiệu quả
  overrideExisting: false, // Thêm dòng này nếu bạn có nhiều slice
  endpoints: (builder) => ({
    // 1. GET /time-return: Lấy danh sách
    getTimeReturns: builder.query({
      query: () => ({
        url: `/time-return`,
        method: 'GET',
      }),
      // Cung cấp tag cho danh sách và từng item để tự động cập nhật
      providesTags: ['time-return'],
    }),

    // GET /time-return/{id}: Lấy chi tiết một item (rất nên có)
    getTimeReturnDetail: builder.query({
      query: (id) => `/time-return/${id}`,
      providesTags: ['time-return'],
    }),

    // 2. POST /time-return: Tạo mới
    createTimeReturn: builder.mutation({
      query: (newTimeReturn) => ({
        url: '/time-return',
        method: 'POST',
        body: newTimeReturn,
      }),
      // Làm mới lại danh sách sau khi tạo thành công
      invalidatesTags: ['time-return'],
    }),

    // 3. PUT /time-return/{id}: Cập nhật
    updateTimeReturn: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/time-return/${id}`,
        method: 'PUT',
        body: patch,
      }),
      // Làm mới lại item đã cập nhật và cả danh sách
      invalidatesTags: ['time-return'],
    }),

    // 4. DELETE /time-return/{id}: Xóa
    deleteTimeReturn: builder.mutation({
      query: (id) => ({
        url: `/time-return/${id}`,
        method: 'DELETE',
      }),
      // Làm mới lại danh sách sau khi xóa
      invalidatesTags: ['time-return'],
    }),
  }),
})

// Xuất ra các hook tương ứng
export const {
  useGetTimeReturnsQuery,
  useGetTimeReturnDetailQuery,
  useCreateTimeReturnMutation,
  useUpdateTimeReturnMutation,
  useDeleteTimeReturnMutation,
} = timeReturnAPI
