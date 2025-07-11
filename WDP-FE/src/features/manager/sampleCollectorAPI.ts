import { apiSlice } from '../../apis/apiSlice'

const sampleCollectorAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSampleCollectorList: builder.query({
      query: ({
        pageNumber,
        pageSize,
      }) => ({
        url: '/managers/sample-collectors',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['sample-collectors'],
    }),

    getServiceNoSampleCollectorList: builder.query({
      query: (isAtHome) => ({
        url: `managers/service-cases-without-sample-collector/${isAtHome}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['sample-collectors'],
    }),
  }),
})

export const {
  useGetSampleCollectorListQuery,
  useGetServiceNoSampleCollectorListQuery,
} = sampleCollectorAPI
