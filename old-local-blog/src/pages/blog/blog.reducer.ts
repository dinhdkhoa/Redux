import { createReducer, createAction } from '@reduxjs/toolkit'
import { initalPostList } from 'constant/blog'
import { Post } from 'types/blog.type'

//ts
interface BlogState {
  postList: Post[]
  editingPost: Post | null
}

// tạo reducer

const initState: BlogState = {
  postList: initalPostList,
  editingPost: null
}

// createAction
export const addPost = createAction<Post>('blog/addPost')
export const deletePost = createAction<string>('blog/deletePost')
export const editPost = createAction<string>('blog/editPost')
export const cancelEditPost = createAction('blog/cancelEditPost')
export const updatePost = createAction<Post>('blog/updatePost')

//ts
const blogReducer = createReducer(initState, (builder) => {
  builder
    .addCase(addPost, (state, action) => {
      const post = action.payload
      state.postList.push(post)
    })
    .addCase(deletePost, (state, action) => {
      const postID = action.payload
      const postIndex = state.postList.findIndex((post) => post.id === postID)
      if (postIndex !== -1) state.postList.splice(postIndex, 1)
    })
    .addCase(editPost, (state, action) => {
      const postID = action.payload
      const foundPost = state.postList.find((post) => post.id === postID) || null
      state.editingPost = foundPost
    })
    .addCase(cancelEditPost, (state) => {
      state.editingPost = null
    })
    .addCase(updatePost, (state, action) => {
      const payloadPost = action.payload
      state.postList.forEach((post, i) => {
        if (post.id === payloadPost.id) state.postList[i] = action.payload
      })
    })
})

export default blogReducer
