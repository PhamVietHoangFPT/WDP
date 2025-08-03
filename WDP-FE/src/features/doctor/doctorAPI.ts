import { apiSlice } from '../../apis/apiSlice'

const doctorAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách trạng thái yêu cầu
    getAllRequestStatusList: builder.query({
      query: () => ({
        url: '/doctors/test-request-statuses',
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['doctor'],
    }),

    // Lấy danh sách hồ sơ dịch vụ chưa có tài liệu ADN
    getServiceCasesWithoutAdn: builder.query({
      query: ({ currentStatus, resultExists }) => ({
        url: '/doctors/service-cases-without-adn-documentation',
        method: 'GET',
        params: { currentStatus, resultExists },
      }),
      transformResponse: (res) => res,
      providesTags: ['doctor'],
    }),

    // Tạo tài liệu ADN mới
    createAdnDocumentation: builder.mutation({
      query: (data) => ({
        url: '/doctors/adn-documentation',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['doctor'],
    }),

    // Lấy tài liệu ADN theo ID
    getAdnDocumentationById: builder.query({
      query: (id) => `/doctors/adn-documentation/${id}`,
      transformResponse: (res) => res,
      providesTags: ['doctor'],
    }),

    // Lấy tài liệu ADN theo serviceCaseId
    getAdnDocumentationByServiceCaseId: builder.query({
      query: (serviceCaseId) =>
        `/doctors/adn-documentation/service-case/${serviceCaseId}`,
      transformResponse: (res) => res,
      providesTags: ['doctor'],
    }),

    // Cập nhật condition của hồ sơ
    updateServiceCaseCondition: builder.mutation({
      query: ({ serviceCaseId, condition }) => ({
        url: `/doctors/serviceCase/${serviceCaseId}/condition/${condition}`,
        method: 'PATCH',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['doctor'],
    }),
    // Cập nhật trạng thái của hồ sơ
    updateServiceCaseStatus: builder.mutation({
      query: ({ id, currentStatus }) => ({
        url: `/service-cases/${id}/status/${currentStatus}`,
        method: 'PATCH',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['doctor'],
    }),

    // Lấy kết quả xét nghiệm ADN theo ID
    getResultById: builder.query({
      query: (resultId) => ({
        url: `/results/for-customer/${resultId}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['results'],
    }),
  }),
})

export const {
  useGetAllRequestStatusListQuery,
  useGetServiceCasesWithoutAdnQuery,
  useCreateAdnDocumentationMutation,
  useGetAdnDocumentationByIdQuery,
  useGetAdnDocumentationByServiceCaseIdQuery,
  useUpdateServiceCaseConditionMutation,
  useUpdateServiceCaseStatusMutation,
  useGetResultByIdQuery,
} = doctorAPI
