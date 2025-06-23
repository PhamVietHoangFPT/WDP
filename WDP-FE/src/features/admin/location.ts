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
    getDistrictList: builder.query({
      query: ({ pageNumber, pageSize, province_code }) => ({
        url: `/location/districts/${province_code}`,
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
          province_code, // Thêm tham số lọc theo mã huyện
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['districts'],
    }),
    getWardList: builder.query({
      query: ({ pageNumber, pageSize, district_code }) => ({
        url: `/location/wards/${district_code}`,
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
          district_code, // Thêm tham số lọc theo mã xã
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
      invalidatesTags: ['wards', 'districts', 'provinces'],
    }),
    createFacility: builder.mutation({
      query: ({ data }) => ({
        url: `/facilities`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: [
        'facilities',
        'wards',
        'districts',
        'provinces',
        'addresses',
        'facility-addresses',
      ],
    }),

    checkFacilityDuplicate: builder.query({
      query: ({ facilityName, phoneNumber, fullAddress }) => ({
        url: `/facilities/check-duplicate`,
        method: 'POST',
        body: { facilityName, phoneNumber, fullAddress },
      }),
      transformResponse: (res) => res,
      providesTags: ['facilities'],
    }),
    // getBlogsDetail: builder.query({
    //   query: (id) => ({
    //     url: `/blogs/${id}`,
    //     method: 'GET',
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['blogs'],
    // }),
    // getBlogsMinimalList: builder.query({
    //   query: ({ pageNumber, pageSize }) => ({
    //     url: '/blogs/minimal',
    //     method: 'GET',
    //     params: {
    //       pageNumber,
    //       pageSize,
    //     },
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['blogs'],
    // }),
    // createSlots: builder.mutation({
    //   query: (data) => ({
    //     url: '/admin/slot-generation/trigger',
    //     method: 'POST',
    //     body: data,
    //   }),
    //   transformResponse: (res) => res,
    //   invalidatesTags: ['blogs'],
    // }),
    // getBlogsDetail: builder.query({
    //   query: (id) => ({
    //     url: `/blogs/${id}`,
    //     method: 'GET',
    //   }),
    //   transformResponse: (res) => res,
    //   providesTags: ['blogs'],
    // }),
    // updateBlogs: builder.mutation({
    //   query: ({ data, id }) => ({
    //     url: `/blogs/${id}`,
    //     method: 'PUT',
    //     body: data,
    //   }),
    //   transformResponse: (res) => res,
    //   invalidatesTags: ['blogs'],
    // }),
    // deleteBlogs: builder.mutation({
    //   query: (id) => ({
    //     url: `/blogs/${id}`,
    //     method: 'DELETE',
    //   }),
    //   transformResponse: (res) => res,
    //   invalidatesTags: ['blogs'],
    // }),
  }),
})

export const {
  useGetProvinceListQuery,
  useGetDistrictListQuery,
  useGetWardListQuery,
  useCreateFacilityAddressMutation,
  useCreateFacilityMutation,
  useLazyCheckFacilityDuplicateQuery,
  //   useGetBlogsMinimalListQuery,
  //   useCreateSlotsMutation,
  //   useGetBlogsDetailQuery,
  //   useUpdateBlogsMutation,
  //   useDeleteBlogsMutation,
} = locationAPI
