import { apiSlice } from '../../apis/apiSlice'

const facilitiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFacilitiesList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: `/facilities?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['facilities'],
    }),

    getFacilityDetail: builder.query({
      query: (id) => ({
        url: `/facilities/${id}`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['facilities'],
    }),

    updateFacility: builder.mutation({
      query: ({ data, id }) => ({
        url: `/facilities/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['facilities'],
    }),

    createFacility: builder.mutation({
      query: ({ data }) => ({
        url: `/facilities`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['facilities'],
    }),
  }),
})

export const {
  useGetFacilitiesListQuery,
  useGetFacilityDetailQuery,
  useUpdateFacilityMutation,
} = facilitiesApi
