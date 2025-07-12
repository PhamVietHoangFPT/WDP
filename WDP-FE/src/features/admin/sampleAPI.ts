import { apiSlice } from '../../apis/apiSlice'

const sampleAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /samples: Lấy danh sách
    getSamples: builder.query({
      query: () => ({
        url: `/samples`,
        method: 'GET',
      }),
      // Cung cấp một tag chung cho tất cả dữ liệu 'Sample'
      providesTags: ['sample'],
    }),

    // 2. GET /samples/{id}: Lấy chi tiết
    getSampleDetail: builder.query({
      query: (id) => `/samples/${id}`,
      providesTags: ['sample'],
    }),

    // 3. POST /samples: Tạo mới
    createSample: builder.mutation({
      query: (newSample) => ({
        url: '/samples',
        method: 'POST',
        body: newSample,
      }),
      // Làm mới lại tất cả các query có tag 'sample'
      invalidatesTags: ['sample'],
    }),

    // 4. PUT /samples/{id}: Cập nhật
    updateSample: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/samples/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['sample'],
    }),

    // 5. DELETE /samples/{id}: Xóa
    deleteSample: builder.mutation({
      query: (id) => ({
        url: `/samples/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['sample'],
    }),
  }),
})

// Xuất ra các hook tương ứng
export const {
  useGetSamplesQuery,
  useGetSampleDetailQuery,
  useCreateSampleMutation,
  useUpdateSampleMutation,
  useDeleteSampleMutation,
} = sampleAPI
