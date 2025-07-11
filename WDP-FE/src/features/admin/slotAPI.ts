import { apiSlice } from '../../apis/apiSlice'

const slotApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSlotsList: builder.query({
      query: ({
        pageNumber,
        pageSize,
        facilityId,
        startDate,
        endDate,
        isAvailable,
      }) => ({
        url: '/slots',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
          facilityId, // Thêm tham số lọc cơ sở
          startDate, // Thêm tham số ngày bắt đầu
          endDate, // Thêm tham số ngày kết thúc
          isAvailable,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['slots'],
    }),

    createSlotTemplate: builder.mutation({
      query: (data) => ({
        url: '/slot-templates',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['slots'],
    }),

    getSlotTemplateForFacility: builder.query({
      query: (facilityId) => ({
        url: `/slot-templates/facility/${facilityId}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['slots'],
    }),

    getBlogsMinimalList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/blogs/minimal',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['blogs'],
    }),
    createSlots: builder.mutation({
      query: (data) => ({
        url: '/admin/slot-generation/trigger',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['blogs'],
    }),
    getBlogsDetail: builder.query({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['blogs'],
    }),
    updateBlogs: builder.mutation({
      query: ({ data, id }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['blogs'],
    }),
    deleteBlogs: builder.mutation({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['blogs'],
    }),
  }),
})

export const {
  useGetSlotsListQuery,
  useGetBlogsMinimalListQuery,
  useCreateSlotTemplateMutation,
  useCreateSlotsMutation,
  useGetBlogsDetailQuery,
  useUpdateBlogsMutation,
  useDeleteBlogsMutation,
  useGetSlotTemplateForFacilityQuery,
} = slotApi
