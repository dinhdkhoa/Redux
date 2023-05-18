import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Post } from 'types/blog.type'

export const blogApi = createApi({
  reducerPath: 'blogApi',
  tagTypes: ['Posts'], // những kiểu tag cho phép dùng trong api để gọi ép gọi lại api cho việc cappj nhật state
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/',
    prepareHeaders(headers) {
      headers.set('authorization', 'Bearer ABCXYZ')
      return headers
    }
  }),
  endpoints: (build) => ({
    // Generic type có kiểu response (Post[]) và argument void
    getPosts: build.query<Post[], void>({
      query: () => 'posts', // methd k có argument
      /**
       * providesTags có thể là array hoặc callback return array
       * Nếu có bất kỳ một invalidatesTag nào match với providesTags này
       * thì sẽ làm cho getPosts method chạy lại
       * và cập nhật lại danh sách các bài post cũng như các tags phía dưới
       */
      providesTags(result) {
        /**
         * Cái callback này sẽ chạy mỗi khi getPosts chạy
         * Mong muốn là sẽ return về một mảng kiểu
         * ```ts
         * interface Tags: {
         *    type: "Posts";
         *    id: string;
         *  }[]
         *```
         * vì thế phải thêm as const vào để báo hiệu type là Read only, không thể mutate
         */
        if (result) {
          const final = [
            ...result.map(({ id }) => ({ type: 'Posts' as const, id })),
            { type: 'Posts' as const, id: 'LIST' }
          ]
          return final
        }
        // const final = [{ type: 'Posts' as const, id: 'LIST' }]
        // return final //return k mutate đc nên đảm bảo ts
        return [{ type: 'Posts', id: 'LIST' }]
      }
    }),
    /**
     * Chúng ta dùng mutation đối với các trường hợp POST, PUT, DELETE
     * Post là response trả về và Omit<Post, 'id'> là body gửi lên
     */
    addPost: build.mutation<Post, Omit<Post, 'id'>>({
      query(body) {
        return {
          url: 'posts',
          method: 'POST',
          body
        }
      },
      /**
       * invalidatesTags cung cấp các tag để báo hiệu cho những method nào có providesTags
       * match với nó sẽ bị gọi lại
       * Trong trường hợp này getPosts sẽ chạy lại
       */
      invalidatesTags: (result, error, body) => [{ type: 'Posts', id: 'LIST' }]
    }),
    getPost: build.query<Post, string>({
      //<a,b> a là dữ liệu trả về, b là cái truyền lên, vd nhận về 1 cái post và truyền lên id:string từ api
      query: (id) => ({
        url: `posts/${id}`,
        headers: {
          hello: 'Hi'
        },
        params: {
          'first-name': 'du',
          'last-name': 'duoc'
        }
      })
    }),
    updatePost: build.mutation<Post, { id: string; body: Post }>({
      query(data) {
        return {
          url: `posts/${data.id}`,
          method: 'PUT',
          body: data.body
        }
      },
      //trong trường hợp này thì getPosts sẽ chạy lại
      invalidatesTags: (result, error, data) => [{ type: 'Posts', id: data.id }]
    }),
    deletePost: build.mutation<{}, string>({
      // check = postman khi delete trả về {}
      query(id) {
        return {
          url: `posts/${id}`,
          method: 'DELETE'
        }
      },
      // Trong trường hợp này thì getPosts sẽ chạy lại
      invalidatesTags: (result, error, id) => [{ type: 'Posts', id }]
    })
  })
})

export const { useGetPostsQuery, useAddPostMutation, useGetPostQuery, useUpdatePostMutation, useDeletePostMutation } =
  blogApi
