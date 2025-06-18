import { apiSlice } from '../../apis/apiSlice'

export const blogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Lấy danh sách blog
    getBlogs: builder.query({
      query: () => ({
        url: '/blogs',
        method: 'GET',
      }),
      providesTags: ['blogs'],
    }),

    // ✅ Lấy blog theo ID
    getBlogById: builder.query({
      query: (id: string) => ({
        url: `/blogs/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'blogs', id }],
    }),

    // ✅ Tạo blog mới
    createBlog: builder.mutation({
      query: (data) => ({
        url: '/blogs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['blogs'],
    }),

    // ✅ Cập nhật blog
    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/blogs/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'blogs', id }],
    }),

    // ✅ Xoá mềm blog
    deleteBlog: builder.mutation({
      query: (id: string) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['blogs'],
    }),
  }),
})

export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi
