// src/features/customer/bookingApi.ts
import { apiSlice } from '../../apis/apiSlice'

export const serviceCaseAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createServiceCase: builder.mutation({
      query: ({ data }) => ({
        url: '/service-cases',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['service-cases'],
    }),
  }),
})

export const { useCreateServiceCaseMutation } = serviceCaseAPI
