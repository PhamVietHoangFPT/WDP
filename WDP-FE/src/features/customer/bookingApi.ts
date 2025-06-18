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
  }),
})

export const { useCreateBookingMutation } = bookingApi
