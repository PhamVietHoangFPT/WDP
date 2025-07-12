import { apiSlice } from '../../apis/apiSlice'

const doctorAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServiceCaseWithoutResultsList: builder.query({
      query: ({ currentStatus, resultExists }) => ({
        url: `doctors/service-cases-without-results?currentStatus=${currentStatus}&resultExists=${resultExists}`, 
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['doctor'],
    }),

    getAllRequestStatusList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/doctors/test-request-statuses',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['doctor'],
    }),

    updateServiceCaseStatus: builder.mutation({
      query: ({ id, currentStatus }) => ({
        url: `/service-cases/${id}/status/${currentStatus}`,
        method: 'PATCH',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['doctor'],
    }),

    getTestTaker: builder.query({
      query: (id: string) => ({
        url: `/test-takers/${id}`,
        method: 'GET',
      }),
      // QUAN TRỌNG: transformResponse để lấy data[0]
      transformResponse: (res: any) => res.data?.[0], // API trả về {data: [{...}]}, cần lấy object bên trong
      providesTags: (result, error, id) => [{ type: 'doctor', id }], // Caching từng testTaker theo ID
    }),

    createServiceCaseResult: builder.mutation({
      query: (data) => ({
        url: '/doctors/results',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['doctor'],
    }),
  }),
})

export const {
  useGetServiceCaseWithoutResultsListQuery,
    useGetAllRequestStatusListQuery,
    useUpdateServiceCaseStatusMutation,
  useGetTestTakerQuery,
  useCreateServiceCaseResultMutation,
} = doctorAPI
