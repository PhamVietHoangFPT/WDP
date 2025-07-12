import { apiSlice } from '../../apis/apiSlice'

const sampleCollectorAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSampleCollectorList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
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

    addSampleCollectorToServiceCase: builder.mutation({
      query: ({ data, serviceCaseId, sampleCollectorId }) => ({
        url: `/managers/service-cases/${serviceCaseId}/sample-collector/${sampleCollectorId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['sample-collectors'],
    }),

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
  useGetSampleCollectorListQuery,
  useGetServiceNoSampleCollectorListQuery,
  useAddSampleCollectorToServiceCaseMutation,
} = sampleCollectorAPI
