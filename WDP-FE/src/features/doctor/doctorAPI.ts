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

    // getAllServiceCases: builder.query({
    //   query: (serviceCaseStatus) => ({
    //     url: `/sample-collector/service-cases/${serviceCaseStatus}`,
    //     method: 'GET',
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['sample-collector'],
    // }),

    // updateServiceCaseStatus: builder.mutation({
    //   query: ({ id, currentStatus }) => ({
    //     url: `/service-cases/${id}/status/${currentStatus}`,
    //     method: 'PATCH',
    //   }),
    //   transformResponse: (res) => res,
    //   invalidatesTags: ['sample-collector'],
    // }),

    // createSlotTemplate: builder.mutation({
    //   query: (data) => ({
    //     url: '/slotTemplates',
    //     method: 'POST',
    //     body: data,
    //   }),
    //   transformResponse: (res) => res,
    //   invalidatesTags: ['slots'],
    // }),

    // getSlotTemplateForFacility: builder.query({
    //   query: (facilityId) => ({
    //     url: `/slotTemplates/facility/${facilityId}`,
    //     method: 'GET',
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['slots'],
    // }),

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
    
  }),
})

export const {
  useGetServiceCaseWithoutResultsListQuery,
    useGetAllRequestStatusListQuery,
    useUpdateServiceCaseStatusMutation,
  useGetTestTakerQuery,
} = doctorAPI
