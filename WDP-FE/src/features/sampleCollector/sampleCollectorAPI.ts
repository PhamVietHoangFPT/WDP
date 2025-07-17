import { apiSlice } from '../../apis/apiSlice'

const sampleCollectorAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServiceCaseStatusList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/sample-collector/service-case-status',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['sample-collector'],
    }),

    getAllServiceCases: builder.query({
      query: ({
        serviceCaseStatus,
        isAtHome,
      }: {
        serviceCaseStatus: string
        isAtHome: boolean
      }) => ({
        url: `/sample-collector/service-cases?serviceCaseStatus=${serviceCaseStatus}&isAtHome=${isAtHome}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['sample-collector'],
    }),

    updateServiceCaseStatus: builder.mutation({
      query: ({ id, currentStatus }) => ({
        url: `/service-cases/${id}/status/${currentStatus}`,
        method: 'PATCH',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['sample-collector'],
    }),
  }),
})

export const {
  useGetServiceCaseStatusListQuery,
  useGetAllServiceCasesQuery,
  useUpdateServiceCaseStatusMutation,
} = sampleCollectorAPI
