// src/features/customer/bookingApi.ts
import { apiSlice } from '../../apis/apiSlice'

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (data) => ({
        url: '/bookings',
        method: 'POST',
        body: data,
      }),
    }),
    getBookingStatus: builder.query({
      query: (isUsed) => ({
        url: `/bookings/status/${isUsed}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['bookings'],
    }),
  }),
})

export const {
  useCreateBookingMutation,
  useGetBookingStatusQuery
} = bookingApi
