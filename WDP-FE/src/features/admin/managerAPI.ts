import { apiSlice } from '../../apis/apiSlice'

const managerAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getManagerList: builder.query({
      query: () => ({
        url: `/admin/managers`,
        method: 'GET',
      }),
      transformResponse: (res) => res,
      providesTags: ['admin'],
    }),

    getFacilitiesWithManagerList: builder.query({
      query: ({ withManager }) => ({
        url: `/admin/facilities`,
        method: 'GET',
        params: {
          withManager
        }
      }),
      transformResponse: (res) => res,
      providesTags: ['admin'],
    }),

    createManager: builder.mutation({
      query: ({ data }) => ({
        url: `/admin/create-manager`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['admin'],
    }),

    assignManager: builder.mutation({
      query: ({ facilityId, managerId }) => ({
        url: `/admin/assign-manager/${managerId}/${facilityId}`,
        method: 'PUT',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['admin'],
    }),

    unAssignManager: builder.mutation({
      query: ({ facilityId, managerId }) => ({
        url: `/admin/unassign-manager/${managerId}/${facilityId}`,
        method: 'PUT',
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['admin'],
    }),

    deleteManager: builder.mutation({
      query: (id: string) => ({
        url: `/admin/delete-manager/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['admin'],
    }),
  }),
})

export const {
  useAssignManagerMutation,
  useCreateManagerMutation,
  useDeleteManagerMutation,
  useGetFacilitiesWithManagerListQuery,
  useGetManagerListQuery,
  useUnAssignManagerMutation
} = managerAPI
