import { apiSlice } from '../../apis/apiSlice'

export const kitShipmentHistoryAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getkitShipmentHistoryList: builder.query({
      query: ({ customerId, caseMember, pageNumber = 1, pageSize = 10 }) => ({
        url: '/kit-shipment-histories',
        method: 'GET',
        params: {
          customerId,
          caseMember,
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['kit-shipment-history'],
    }),
  }),
})

export const { useGetkitShipmentHistoryListQuery } = kitShipmentHistoryAPI
