import { apiSlice } from '../../apis/apiSlice'

export const addressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /addresses -> Tạo địa chỉ mới cho người dùng
    createAddress: builder.mutation({
      query: (data) => ({
        url: '/addresses',
        method: 'POST',
        body: data,
      }),
      // Sau khi tạo thành công, làm mới lại danh sách địa chỉ
      invalidatesTags: ['addresses'],
    }),

    // GET /addresses -> Lấy tất cả địa chỉ
    getAddresses: builder.query({
      query: () => '/addresses',
      // Cung cấp tag 'addresses' để caching
      providesTags: ['addresses'],
    }),

    // GET /addresses/default -> Lấy địa chỉ mặc định của tài khoản
    getDefaultAddress: builder.query({
      query: () => '/addresses/default',
      // Cũng cung cấp tag 'addresses' để nó được làm mới khi danh sách thay đổi
      providesTags: ['addresses'],
    }),

    // GET /addresses/{id} -> Lấy địa chỉ theo ID
    getAddressById: builder.query({
      query: (id) => `/addresses/${id}`,
      // Cung cấp tag với id cụ thể để caching hiệu quả hơn
      providesTags: ['addresses'],
    }),

    // PATCH /addresses/{id} -> Cập nhật địa chỉ cá nhân theo ID
    updateAddress: builder.mutation({
      query: ({ id, data }) => ({
        url: `/addresses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      // Làm mới lại cả danh sách và cache của địa chỉ cụ thể này
      invalidatesTags: ['addresses'],
    }),

    // DELETE /addresses/{id} -> Xóa địa chỉ theo ID
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      // Làm mới lại danh sách sau khi xóa
      invalidatesTags: ['addresses'],
    }),

    // PATCH /addresses/default/{addressId} -> Cập nhật địa chỉ mặc định
    setDefaultAddress: builder.mutation({
      query: (addressId: string) => ({
        url: `/addresses/default/${addressId}`,
        method: 'PATCH',
      }),
      // Thay đổi mặc định ảnh hưởng đến cả danh sách, nên làm mới lại tất cả
      invalidatesTags: ['addresses'],
    }),
  }),
})

export const {
  useCreateAddressMutation,
  useGetAddressesQuery,
  useGetDefaultAddressQuery,
  useGetAddressByIdQuery,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi
