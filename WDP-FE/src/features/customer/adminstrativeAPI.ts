import { apiSlice } from '../../apis/apiSlice'

export const adminstrativeAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Lấy danh sách ngân hàng VNPay
    getAllFacilitiesDetail: builder.query({
      query: () => ({
        url: '/facilities/facilities-details',
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
      invalidatesTags: ['vnpay'],
    }),

    createPaymentForCondition: builder.mutation({
      query: (data) => ({
        url: '/vnpay/payment-for-condition',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['vnpay'],
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
    // ✅ Tạo lịch sử thanh toán cho condition
    createConditionPaymentHistory: builder.mutation({
      query: (data) => ({
        url: '/payments/condition',
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

    getServiceCasesList: builder.query({
      query: ({ pageSize, pageNumber, currentStatus }) => ({
        url: `/service-cases?pageNumber=${pageNumber}&pageSize=${pageSize}&currentStatus=${currentStatus}`,
        method: 'GET',
      }),
      providesTags: ['PaymentHistory'],
    }),

    getTestRequestHistory: builder.query({
      query: ({ accountId, serviceCaseId }) => ({
        url: `/test-request-histories?accountId=${accountId}&serviceCaseId=${serviceCaseId}`,
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

export const { useGetAllFacilitiesDetailQuery } = adminstrativeAPI
