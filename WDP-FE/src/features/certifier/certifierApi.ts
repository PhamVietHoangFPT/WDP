import { apiSlice } from '../../apis/apiSlice'

const certifierAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách hồ sơ dịch vụ chưa có kết quả
    getServiceCasesWithoutResult: builder.query({
      query: ({ currentStatus, resultExists }) => ({
        url: '/certifiers/service-cases-without-result',
        method: 'GET',
        params: {
          currentStatus,
          resultExists,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['certifier'],
    }),

    // Lấy danh sách trạng thái yêu cầu xét nghiệm
    getTestRequestStatuses: builder.query({
      query: () => ({
        url: '/certifiers/test-request-statuses',
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['certifier'],
    }),

    // Lấy tài liệu ADN theo ID hồ sơ dịch vụ
    getAdnDocumentationByServiceCaseId: builder.query({
      query: (serviceCaseId) => ({
        url: `/certifiers/documentation/${serviceCaseId}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['certifier'],
    }),

    // Tạo kết quả cho hồ sơ dịch vụ
    createCertifierResult: builder.mutation({
      query: (data) => ({
        url: '/certifiers/create-result',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['certifier'],
    }),
  }),
})

export const {
  useGetServiceCasesWithoutResultQuery,
  useGetTestRequestStatusesQuery,
  useGetAdnDocumentationByServiceCaseIdQuery,
  useCreateCertifierResultMutation,
} = certifierAPI
