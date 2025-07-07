import { apiSlice } from '../../apis/apiSlice'

const doctorAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServiceCaseWithoutResultsList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/doctors/service-cases-without-results',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['doctor'],
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
  useGetServiceCaseWithoutResultsListQuery,
} = doctorAPI
