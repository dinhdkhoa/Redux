import { RootState, useAppDispatch } from 'store'
import PostItem from '../PostItem'
import { useSelector } from 'react-redux'
import { Post } from 'types/blog.type'
import { deletePost, startEditingPost, getPostList } from 'pages/blog/blog.slice'
import { useEffect } from 'react'
import SkeletonPost from '../SkeletonPost'
// import http from 'utils/http'

export default function PostList() {
  const postList = useSelector((state: RootState) => state.blog.postList)
  const loading = useSelector((state: RootState) => state.blog.loading)
  const dispatch = useAppDispatch()

  useEffect(() => {
    // axios
    //  const controller = new AbortController()
    // http
    //   .get('posts', {
    //     signal: controller.signal
    //   })
    //   .then((res) => {
    //     console.log(res)
    //     const postListResult = res.data
    //     dispatch({
    //       type: 'blog/getPostListSuccess',
    //       payload: postListResult
    //     })
    //   })
    //   .catch((error) => {
    //     if (!(error.code == 'ERR_CANCELED')) {
    //       dispatch({
    //         type: 'blog/getPostListFailed'
    //       })
    //     }
    //   })

    // return () => {
    //   controller.abort()
    // }
    const promise = dispatch(getPostList())
    return () => {
      promise.abort()
    }
  }, [dispatch])

  const handleDelete = (postID: string) => {
    dispatch(deletePost(postID))
  }
  const handleEditing = (postID: string) => {
    dispatch(startEditingPost(postID))
  }

  return (
    <div className='bg-white py-6 sm:py-8 lg:py-12'>
      <div className='mx-auto max-w-screen-xl px-4 md:px-8'>
        <div className='mb-10 md:mb-16'>
          <h2 className='mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl'>Được Dev Blog</h2>
          <p className='mx-auto max-w-screen-md text-center text-gray-500 md:text-lg'>
            Đừng bao giờ từ bỏ. Hôm nay khó khăn, ngày mai sẽ trở nên tồi tệ. Nhưng ngày mốt sẽ có nắng
          </p>
        </div>
        <div className='grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-2 xl:gap-8'>
          {loading && (
            <>
              <SkeletonPost />
              <SkeletonPost />
            </>
          )}
          {!loading &&
            postList.map((post: Post) => (
              <PostItem key={post.id} post={post} handleDelete={handleDelete} handleEditing={handleEditing} />
            ))}
        </div>
      </div>
    </div>
  )
}
