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

    getUserList: builder.query({
      query: () => ({
        url: `/accounts`,
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

    getFacilitiesNameAndAddress: builder.query({
      query: () => ({
        url: `/facilities/facilities-name-address`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['facilities'],
    }),
  }),
})

export const {
  useGetFacilitiesListQuery,
  useGetFacilityDetailQuery,
  useUpdateFacilityMutation,
  useGetFacilitiesNameAndAddressQuery,
  useGetUserListQuery,
  useCreateFacilityMutation
} = facilitiesApi
