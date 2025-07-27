// src/features/testTaker/testTakerApi.ts
import { apiSlice } from '../../apis/apiSlice'

export const testTakerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách test takers
    getTestTakers: builder.query({
      query: ({ accountId, pageSize, pageNumber }) => ({
        url: '/test-takers',
        params: { accountId, pageSize, pageNumber },
      }),
      providesTags: ['testTakers'],
    }),

    // Lấy test taker theo ID
    getTestTakerById: builder.query({
      query: (id: string) => ({
        url: `/test-takers/${id}`,
        method: 'GET',
      }),
      providesTags: ['testTakers'],
    }),

    // Tạo test taker mới
    createTestTaker: builder.mutation({
      query: (data) => ({
        url: '/test-takers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['testTakers'],
    }),

    // Xoá test taker
    deleteTestTaker: builder.mutation({
      query: (id: string) => ({
        url: `/test-takers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['testTakers'],
    }),
  }),
})

export const {
  useGetTestTakersQuery,
  useGetTestTakerByIdQuery,
  useCreateTestTakerMutation,
  useDeleteTestTakerMutation,
} = testTakerApi
