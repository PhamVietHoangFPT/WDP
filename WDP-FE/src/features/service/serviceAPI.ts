import { apiSlice } from '../../apis/apiSlice'

export const serviceAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServiceList: builder.query({
      query: ({
        name,
        sampleName,
        timeReturn,
        isSelfSampling,
        isAdministration,
        isAgnate,
        pageNumber,
        pageSize,
      }) => ({
        url: '/services',
        method: 'GET',
        params: {
          name,
          sampleName,
          timeReturn,
          isSelfSampling,
          isAdministration,
          isAgnate,
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['services'],
    }),
    getServiceDetail: builder.query({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['services'],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['services'],
    }),
    createService: builder.mutation({
      query: (data) => ({
        url: '/services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['services'],
    }),
    updateService: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['services'],
    }),
  }),
})
export const {
  useGetServiceListQuery,
  useGetServiceDetailQuery,
  useDeleteServiceMutation,
  useCreateServiceMutation,
  useUpdateServiceMutation,
} = serviceAPI
