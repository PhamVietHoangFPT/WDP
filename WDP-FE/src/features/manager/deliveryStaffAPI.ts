import { apiSlice } from '../../apis/apiSlice'

const deliveryStaffAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDeliveryStaffList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/managers/delivery-staff',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['delivery-staff'],
    }),

    getServiceCaseNoDeliveryStaffList: builder.query({
      query: ({ pageNumber, pageSize, bookingDate }) => ({
        url: '/managers/service-cases-result-without-delivery-staff',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
          bookingDate,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['delivery-staff'],
    }),

    addDeliveryStaffToServiceCase: builder.mutation({
      query: ({ data, serviceCaseId, deliveryStaffId }) => ({
        url: `/managers/service-cases/${serviceCaseId}/delivery-staff/${deliveryStaffId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['delivery-staff'],
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
  useGetDeliveryStaffListQuery,
  useAddDeliveryStaffToServiceCaseMutation,
  useGetServiceCaseNoDeliveryStaffListQuery
} = deliveryStaffAPI
