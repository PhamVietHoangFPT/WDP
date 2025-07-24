import { apiSlice } from '../../apis/apiSlice'

const samplingKitInventoryAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /sampling-kit-inventory: Lấy danh sách kit theo cơ sở
    getAllSamplingKitInventories: builder.query({
      query: ({ facilityId, pageNumber, pageSize }) => ({
        // Giả định API cần facilityId làm query param
        url: `/sampling-kit-inventory?facilityId=${facilityId}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
        method: 'GET',
      }),
      providesTags: ['sampling-kit-inventory'],
    }),

    getSamplingKitInventoriesByLotNumber: builder.query({
      query: ({ lotNumber, facilityId }) => ({
        url: `/sampling-kit-inventory/lot-number?lotNumber=${lotNumber}&facilityId=${facilityId}`,
        method: 'GET',
      }),
      providesTags: ['sampling-kit-inventory'],
    }),

    getExpiredSamplingKits: builder.query({
      query: ({ facilityId }) => ({
        url: `/sampling-kit-inventory/expired-kits?facilityId=${facilityId}`,
        method: 'GET',
      }),
      providesTags: ['sampling-kit-inventory'],
    }),

    // 2. GET /sampling-kit-inventory/{id}: Lấy chi tiết kit
    getSamplingKitInventoryDetail: builder.query({
      query: (id) => `/sampling-kit-inventory/${id}`,
      providesTags: ['sampling-kit-inventory'],
    }),

    getSamplingKitInventoryBySampleIdAndFacilityId: builder.query({
      query: ({ sampleId, facilityId }) => ({
        url: `/sampling-kit-inventory/sample-and-facility?sampleId=${sampleId}&facilityId=${facilityId}`,
        method: 'GET',
      }),
      providesTags: ['sampling-kit-inventory'],
    }),

    // 3. POST /sampling-kit-inventory: Tạo mới kit
    createSamplingKitInventory: builder.mutation({
      query: (newKit) => ({
        url: '/sampling-kit-inventory',
        method: 'POST',
        body: newKit,
      }),
      invalidatesTags: ['sampling-kit-inventory'],
    }),

    // 4. PUT /sampling-kit-inventory/{id}: Cập nhật kit
    updateSamplingKitInventory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/sampling-kit-inventory/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['sampling-kit-inventory'],
    }),

    // 5. DELETE /sampling-kit-inventory/{id}: Xóa kit
    deleteSamplingKitInventory: builder.mutation({
      query: (id) => ({
        url: `/sampling-kit-inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['sampling-kit-inventory'],
    }),

    // 6. DELETE /sampling-kit-inventory/expired: Xóa các kit đã hết hạn
    deleteExpiredSamplingKits: builder.mutation({
      query: () => ({
        url: '/sampling-kit-inventory/expired',
        method: 'DELETE',
      }),
      // Hành động này làm thay đổi toàn bộ danh sách
      invalidatesTags: ['sampling-kit-inventory'],
    }),
  }),
})

// Xuất ra các hook tương ứng
export const {
  useGetAllSamplingKitInventoriesQuery,
  useGetSamplingKitInventoryDetailQuery,
  useCreateSamplingKitInventoryMutation,
  useGetSamplingKitInventoryBySampleIdAndFacilityIdQuery,
  useUpdateSamplingKitInventoryMutation,
  useDeleteSamplingKitInventoryMutation,
  useDeleteExpiredSamplingKitsMutation,
  useGetSamplingKitInventoriesByLotNumberQuery,
  useGetExpiredSamplingKitsQuery,
} = samplingKitInventoryAPI
