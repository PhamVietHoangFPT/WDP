import { apiSlice } from '../../apis/apiSlice'

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Lấy danh sách ngân hàng VNPay
    getVnpayBanks: builder.query({
      query: () => ({
        url: '/vnpay/banks',
        method: 'GET',
      }),
    }),

    // ✅ Tạo URL thanh toán (trả về redirect URL dạng text)
    createPaymentUrl: builder.mutation<string, any>({
      query: (data) => ({
        url: '/vnpay/payment-url',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/plain', // để nhận raw URL dạng text
        },
        responseHandler: (response) => response.text(), // 👈 bắt buộc để parse text
      }),
    }),

    // ✅ Tạo lịch sử thanh toán cho dịch vụ
    createServicePaymentHistory: builder.mutation({
      query: (data) => ({
        url: '/payments/service-case',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentHistory'],
    }),

    // ✅ Lấy danh sách lịch sử thanh toán
    getPaymentList: builder.query({
      query: ({ pageSize, pageNumber }) => ({
        url: `/payments?pageSize=${pageSize}&pageNumber=${pageNumber}`,
        method: 'GET',
      }),
      providesTags: ['PaymentHistory'],
    }),

    // ✅ Lấy lịch sử thanh toán theo ID
    getPaymentById: builder.query({
      query: (id: string) => ({
        url: `/payments/${id}`,
        method: 'GET',
      }),
    }),

    // ✅ Lấy lịch sử thanh toán theo nhân viên
    getPaymentByStaff: builder.query({
      query: () => ({
        url: '/payments/staff',
        method: 'GET',
      }),
    }),
  }),
})

export const {
  useGetVnpayBanksQuery,
  useCreatePaymentUrlMutation,
  useCreateServicePaymentHistoryMutation,
  useGetPaymentListQuery,
  useGetPaymentByIdQuery,
  useGetPaymentByStaffQuery,
} = paymentApi
