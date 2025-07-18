import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'
// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_ENDPOINT,
  prepareHeaders: (headers) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const token = Cookies.get('userToken') || ''
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  },
})
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQuery,
  tagTypes: [
    'test',
    'account',
    'facilities',
    'blogs',
    'customers',
    'packages',
    'staff',
    'dashboard',
    'slots',
    'provinces',
    'districts',
    'wards',
    'testTakers',
    'addresses',
    'facility-addresses',
    'PaymentHistory',
    'services',
    'bookings',
    'case-members',
    'service-cases',
    'sample-collectors',
    'create-account',
    'sample-collector',
    'doctor',
    'time-return',
    'sample-type',
    'sample',
    'slot-templates',
    'sampling-kit-inventory',
    'staff',
  ],

  endpoints: () => ({}),
})
