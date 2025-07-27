/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from '../../apis/apiSlice'

// 💡 Gợi ý: Hãy đảm bảo trong file apiSlice.ts, bạn đã khai báo tagTypes: ['KitShipment']

export const kitShipmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /kit-shipment: Tạo một kit shipment mới
     */
    createKitShipment: builder.mutation<any, any>({
      query: (newKitShipment) => ({
        url: '/kit-shipment',
        method: 'POST',
        body: newKitShipment,
      }),
      invalidatesTags: ['kit-shippments'],
    }),

    /**
     * GET /kit-shipment: Xem tất cả kit shipment (hỗ trợ phân trang)
     */
    getKitShipments: builder.query<
      any,
      { pageNumber?: number; pageSize?: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: '/kit-shipment',
        method: 'GET',
        params: { pageNumber, pageSize },
      }),
      providesTags: ['kit-shippments'],
    }),

    /**
     * GET /kit-shipment/{id}: Tìm kit shipment theo ID
     */
    getKitShipmentById: builder.query<any, string>({
      query: (id) => `/kit-shipment/${id}`,
      providesTags: ['kit-shippments'],
    }),

    /**
     * PUT /kit-shipment/{id}: Cập nhật thông tin kit shipment
     */
    updateKitShipment: builder.mutation<any, any>({
      query: ({ _id, ...patch }) => ({
        url: `/kit-shipment/${_id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['kit-shippments'],
    }),

    /**
     * DELETE /kit-shipment/{id}: Xóa kit shipment
     */
    deleteKitShipment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/kit-shipment/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['kit-shippments'],
    }),

    /**
     * PATCH /kit-shipment/{id}/status/{currentStatus}: Cập nhật trạng thái
     */
    updateKitShipmentStatus: builder.mutation<
      any,
      { id: string; currentStatus: string }
    >({
      query: ({ id, currentStatus }) => ({
        url: `/kit-shipment/${id}/status/${currentStatus}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['kit-shippments'],
    }),

    getKitShipmentForShipper: builder.query({
      query: ({ currentStatus }) => ({
        url: '/kit-shipment/shipper',
        method: 'GET',
        params: {
          currentStatus,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['kit-shippments'],
    }),
    getKitShipmentStatus: builder.query({
      query: () => ({
        url: '/kit-shipment-status',
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['kit-shippments-status'],
    }),
  }),
})

// Export các hook được tạo tự động để sử dụng trong các component
export const {
  useCreateKitShipmentMutation,
  useGetKitShipmentsQuery,
  useGetKitShipmentByIdQuery,
  useUpdateKitShipmentMutation,
  useDeleteKitShipmentMutation,
  useUpdateKitShipmentStatusMutation,
  useGetKitShipmentForShipperQuery,
  useGetKitShipmentStatusQuery
} = kitShipmentApi
