import { apiSlice } from '../../apis/apiSlice'

const locationAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProvinceList: builder.query({
      query: ({ pageNumber, pageSize, code }) => ({
        url: '/location/provinces',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
          code, // Thêm tham số lọc theo mã tỉnh
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['provinces'],
    }),
    // getDistrictList: builder.query({
    //   query: ({ pageNumber, pageSize, province_code }) => ({
    //     url: `/location/districts/${province_code}`,
    //     method: 'GET',
    //     params: {
    //       pageNumber,
    //       pageSize,
    //       province_code, // Thêm tham số lọc theo mã huyện
    //     },
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['districts'],
    // }),
    getWardList: builder.query({
      query: ({ pageNumber, pageSize, province_code }) => ({
        url: `/location/wards/${province_code}`,
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
          province_code, // Thêm tham số lọc theo mã xã
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['wards'],
    }),
    createFacilityAddress: builder.mutation({
      query: ({ data }) => ({
        url: `/addresses/for-facility`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['facilities', 'addresses'],
    }),
    updateAddressFacility: builder.mutation({
      query: ({ id, data }) => ({
        url: `/facilities/address/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['facilities', 'addresses'],
    }),
    updateFullAddressFacility: builder.mutation({
      query: ({ id, data }) => ({
        url: `/addresses/facility/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['facilities', 'addresses'],
    }),
  }),
})

export const {
  useGetProvinceListQuery,
  // useGetDistrictListQuery,
  useGetWardListQuery,
  useCreateFacilityAddressMutation,
  useUpdateAddressFacilityMutation,
  useUpdateFullAddressFacilityMutation,
} = locationAPI
