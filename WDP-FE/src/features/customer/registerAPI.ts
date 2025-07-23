// src/features/customer/bookingApi.ts
import { apiSlice } from '../../apis/apiSlice'

export const registerAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerAccount: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    // getBookingStatus: builder.query({
    //   query: (isUsed) => ({
    //     url: `/bookings/status/${isUsed}`,
    //     method: 'GET',
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['bookings'],
    // }),
  }),
})

export const { useRegisterAccountMutation } = registerAPI
