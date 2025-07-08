import { apiSlice } from '../../apis/apiSlice'

const doctorAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDoctorList: builder.query({
      query: ({
        pageNumber,
        pageSize,
      }) => ({
        url: '/managers/doctors',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['doctor'],
    }),

    getServiceCaseNoDoctorList: builder.query({
      query: ({
        pageNumber,
        pageSize,
      }) => ({
        url: '/managers/service-cases-without-doctor',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['doctor'],
    }),

    addDoctorToServiceCase: builder.mutation({
      query: ({ data, serviceCaseId, doctorId }) => ({
        url: `/managers/service-cases/${serviceCaseId}/doctor/${doctorId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['doctor'],
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
    useGetDoctorListQuery,
    useGetServiceCaseNoDoctorListQuery,
    useAddDoctorToServiceCaseMutation,
} = doctorAPI
