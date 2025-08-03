import { apiSlice } from '../../apis/apiSlice'

export const priceAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllServiceCasePrice: builder.query({
      query: (params) => ({
        url: '/services',
        method: 'GET',
        params: params,
      }),
    }),
  }),
})

export const { useGetAllServiceCasePriceQuery } = priceAPI
