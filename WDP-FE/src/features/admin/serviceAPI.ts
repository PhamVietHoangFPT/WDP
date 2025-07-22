import { apiSlice } from '../../apis/apiSlice'

const serviceAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServicesList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: `/services?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['services'],
    }),

    getServiceDetail: builder.query({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['services'],
    }),

    updateService: builder.mutation({
      query: ({ data, id }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['services'],
    }),

    createService: builder.mutation({
      query: ({ data }) => ({
        url: `/services`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['services'],
    }),
  }),
})

export const {
  useGetServicesListQuery,
  useGetServiceDetailQuery,
  useUpdateServiceMutation,
  useCreateServiceMutation,
} = serviceAPI
