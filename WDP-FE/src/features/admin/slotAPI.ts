import { apiSlice } from '../../apis/apiSlice'

const slotApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSlotsList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/slots',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['blogs'],
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
  useCreateSlotsMutation,
  useGetBlogsDetailQuery,
  useUpdateBlogsMutation,
  useDeleteBlogsMutation,
} = slotApi