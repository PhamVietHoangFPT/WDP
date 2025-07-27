import { current } from '@reduxjs/toolkit'
import { apiSlice } from '../../apis/apiSlice'
import type { useGetCustomerServiceCaseByEmailQuery } from '../staff/staffAPI'

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



    getServiceCaseByEmailForStaff: builder.query({
      query: ({
        serviceCaseStatus, email,
      }: {
        serviceCaseStatus: string, email: string
      }) => ({
        url: `/staff/service-cases?email=${email}&currentStatus=${serviceCaseStatus}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['staff'],
    }),

    createServiceCaseImage: builder.mutation({
      query: (data) => ({
        url: '/images/uploadForServiceCase',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['delivery-staff','sample-collector','staff'],
    }),
  }),

  
})

export const {
  useGetAllServiceCasesForDeliveryQuery,
  useGetServiceCaseStatusListForDeliveryQuery,
  useUpdateServiceCaseStatusForDeliveryMutation,
  useGetServiceCaseByEmailForStaffQuery,
  useCreateServiceCaseImageMutation
} = deliveryAPI
