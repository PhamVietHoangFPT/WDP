import { apiSlice } from '../../apis/apiSlice'

const facilitiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFacilitiesList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/facilities',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['facilities'],
    }),

    getFacilityDetail: builder.query({
      query: (id) => ({
        url: `/facilities/${id}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['facilities'],
    }),
    // getBlogsMinimalList: builder.query({
    //   query: ({ pageNumber, pageSize }) => ({
    //     url: '/blogs/minimal',
    //     method: 'GET',
    //     params: {
    //       pageNumber,
    //       pageSize,
    //     },
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['blogs'],
    // }),
    // createSlots: builder.mutation({
    //   query: (data) => ({
    //     url: '/admin/slot-generation/trigger',
    //     method: 'POST',
    //     body: data,
    //   }),
    //   transformResponse: (res) => res,
    //   invalidatesTags: ['blogs'],
    // }),
    // getBlogsDetail: builder.query({
    //   query: (id) => ({
    //     url: `/blogs/${id}`,
    //     method: 'GET',
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['blogs'],
    // }),
    // updateBlogs: builder.mutation({
    //   query: ({ data, id }) => ({
    //     url: `/blogs/${id}`,
    //     method: 'PUT',
    //     body: data,
    //   }),
    //   transformResponse: (res) => res,
    //   invalidatesTags: ['blogs'],
    // }),
    // deleteBlogs: builder.mutation({
    //   query: (id) => ({
    //     url: `/blogs/${id}`,
    //     method: 'DELETE',
    //   }),
    //   transformResponse: (res) => res,
    //   invalidatesTags: ['blogs'],
    // }),
  }),
})

export const {
  useGetFacilitiesListQuery,
//   useGetBlogsMinimalListQuery,
//   useCreateSlotsMutation,
//   useGetBlogsDetailQuery,
//   useUpdateBlogsMutation,
//   useDeleteBlogsMutation,
} = facilitiesApi
