import { apiSlice } from '../../apis/apiSlice'

const sampleTypeAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /sample-types: Lấy danh sách
    getSampleTypes: builder.query({
      query: () => ({
        url: `/sample-types`,
        method: 'GET',
      }),
      providesTags: ['sample-type'],
    }),

    // 2. GET /sample-types/{id}: Lấy chi tiết
    getSampleTypeDetail: builder.query({
      query: (id) => `/sample-types/${id}`,
      providesTags: ['sample-type'],
    }),

    // 3. POST /sample-types: Tạo mới
    createSampleType: builder.mutation({
      query: (newSampleType) => ({
        url: '/sample-types',
        method: 'POST',
        body: newSampleType,
      }),
      invalidatesTags: ['sample-type'],
    }),

    // 4. PUT /sample-types/{id}: Cập nhật
    updateSampleType: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/sample-types/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['sample-type'],
    }),

    // 5. DELETE /sample-types/{id}: Xóa
    deleteSampleType: builder.mutation({
      query: (id) => ({
        url: `/sample-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['sample-type'],
    }),
  }),
})

// Xuất ra các hook tương ứng
export const {
  useGetSampleTypesQuery,
  useGetSampleTypeDetailQuery,
  useCreateSampleTypeMutation,
  useUpdateSampleTypeMutation,
  useDeleteSampleTypeMutation,
} = sampleTypeAPI
