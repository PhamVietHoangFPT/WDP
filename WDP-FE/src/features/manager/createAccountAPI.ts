import { apiSlice } from '../../apis/apiSlice'

const createAccountAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoleList: builder.query({
      query: ({ pageNumber, pageSize }) => ({
        url: '/managers/roles',
        method: 'GET',
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (res) => res,
      providesTags: ['create-account'],
    }),

    createAccount: builder.mutation({
      query: (data) => ({
        url: '/managers/create-account',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['create-account'],
    }),
  }),
})

export const { useGetRoleListQuery, useCreateAccountMutation } =
  createAccountAPI
