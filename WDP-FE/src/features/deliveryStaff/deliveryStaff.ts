import { current } from '@reduxjs/toolkit'
import { apiSlice } from '../../apis/apiSlice'

const deliveryAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServiceCaseStatusListForDelivery: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/delivery-staff/service-case-statuses',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['delivery-staff'],
    }),

    getAllServiceCasesForDelivery: builder.query({
      query: ({
        serviceCaseStatus,
      }: {
        serviceCaseStatus: string
      }) => ({
        url: `/delivery-staff/service-cases?currentStatus=${serviceCaseStatus}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['delivery-staff'],
    }),

    updateServiceCaseStatusForDelivery: builder.mutation({
      query: ({ id, currentStatus }) => ({
        url: `/service-cases/${id}/status/${currentStatus}`,
        method: 'PATCH',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['delivery-staff'],
    }),
  }),
})

export const {
  useGetAllServiceCasesForDeliveryQuery,
  useGetServiceCaseStatusListForDeliveryQuery,
  useUpdateServiceCaseStatusForDeliveryMutation
} = deliveryAPI
