import { apiSlice } from '../../apis/apiSlice'

export const serviceAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServiceList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/services',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
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
  }),
})
export const { useGetServiceListQuery, useGetServiceDetailQuery } = serviceAPI
