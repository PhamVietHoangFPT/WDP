import { apiSlice } from '../../apis/apiSlice'

export const caseMemberAPI = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCaseMember: builder.mutation({
      query: ({ data }) => ({
        url: '/case-members',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res,
      invalidatesTags: ['case-members'],
    }),
  }),
})
export const { useCreateCaseMemberMutation } = caseMemberAPI
