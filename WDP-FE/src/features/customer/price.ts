import { apiSlice } from '../../apis/apiSlice'

export const priceAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Lấy danh sách ngân hàng VNPay
    getAllServiceCasePrice: builder.query({
      query: () => ({
        url: '/services',
        method: 'GET',
      }),
    }),   
  }),
})

export const { useGetAllServiceCasePriceQuery } = priceAPI
