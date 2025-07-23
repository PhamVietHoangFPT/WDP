import { apiSlice } from '../../apis/apiSlice'

export const conditionAPI = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConditionList: builder.query({
            query: () => ({
                url: '/condition',
                method: 'GET',
            }),
            transformResponse: (res) => res,
            providesTags: ['conditions'],
        }),
    }),
})

export const { useGetConditionListQuery } = conditionAPI
