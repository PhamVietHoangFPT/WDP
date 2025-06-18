import { apiSlice } from '../../apis/apiSlice'

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách ngân hàng VNPay
    getVnpayBanks: builder.query({
      query: () => ({
        url: '/vnpay/banks',
        method: 'GET',
      }),
    }),

    // Tạo URL thanh toán (tùy biến nếu cần dùng chung)
    createPaymentUrl: builder.mutation<string, any>({
      query: (data) => ({
        url: '/vnpay/payment-url',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json', // Đảm bảo gửi dạng JSON
          Accept: 'text/plain', // ⬅️ Quan trọng: yêu cầu nhận về dạng text
        },
        responseHandler: (response) => response.text(),
      }),
    }),

    // Tạo URL thanh toán dành cho đặt lịch
    createBookingPayment: builder.mutation({
      query: (data) => ({
        url: '/vnpay/payment-for-booking',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res.redirectUrl,
    }),

    // Tạo URL thanh toán cho dịch vụ
    createServicePayment: builder.mutation({
      query: (data) => ({
        url: '/vnpay/payment-for-service-case',
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useGetVnpayBanksQuery,
  useCreatePaymentUrlMutation,
  useCreateBookingPaymentMutation,
  useCreateServicePaymentMutation,
} = paymentApi
