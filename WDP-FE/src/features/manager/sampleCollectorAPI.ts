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
      query: ({ isAtHome, bookingDate }) => ({
        url: `managers/service-cases-without-sample-collector`,
        method: 'GET',
        params: {
          isAtHome,
          bookingDate,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['sample-collectors'],
    }),

    getKitShipmentWithoutDeliveryStaffList: builder.query({
      query: ({ bookingDate }) => ({
        url: `managers/kit-shipments-without-delivery-staff`,
        method: 'GET',
        params: {
          bookingDate,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['kit-shippments'],
    }),

    getDeliveryStaffList: builder.query({
      query: () => ({
        url: '/managers/delivery-staff',
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['kit-shippments'],
    }),

    assignDeliveryStaffToKitShipment: builder.mutation({
      query: ({ kitShipmentId, deliveryStaffId }) => ({
        url: `/managers/kit-shipments/${kitShipmentId}/delivery-staff/${deliveryStaffId}`,
        method: 'PUT',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['kit-shippments'],
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
  }),
})

export const {
  useGetSampleCollectorListQuery,
  useGetServiceNoSampleCollectorListQuery,
  useAddSampleCollectorToServiceCaseMutation,
  useGetKitShipmentWithoutDeliveryStaffListQuery,
  useGetDeliveryStaffListQuery,
  useAssignDeliveryStaffToKitShipmentMutation,
} = sampleCollectorAPI
