import { createSlice, PayloadAction, createAsyncThunk, AsyncThunk } from '@reduxjs/toolkit'
import { Post } from 'types/blog.type'
import http from 'utils/http'

//ts
type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

interface BlogState {
  postList: Post[]
  editingPost: Post | null
  loading: boolean
  currentRequestId: undefined | string
}

// tạo reducer

const initState: BlogState = {
  postList: [],
  editingPost: null,
  loading: false,
  currentRequestId: undefined
}

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
  const response = await http.get<Post[]>('posts', {
    signal: thunkAPI.signal
  })
  return response.data
})

export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkAPI) => {
  try {
    const response = await http.post<Post>('posts', body, {
      signal: thunkAPI.signal
    })
    return response.data
  } catch (error: any) {
    if (error.name === 'AxiosError' && error.response.status === 422) {
      return thunkAPI.rejectWithValue(error.response.data)
    }
    throw error
  }
})

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ postId, body }: { postId: string; body: Post }, thunkAPI) => {
    try {
      const response = await http.put<Post>(`posts/${postId}`, body, {
        signal: thunkAPI.signal
      })
      return response.data
    } catch (error: any) {
      if (error.name === 'AxiosError' && error.response.status === 422) {
        return thunkAPI.rejectWithValue(error.response.data)
      }
      throw error
    }
  }
)
export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkAPI) => {
  const response = await http.delete<string>(`posts/${postId}`, {
    signal: thunkAPI.signal
  })
  return response.data
})

//tạo slice
const blogSlice = createSlice({
  name: 'blog',
  initialState: initState,
  reducers: {
    cancelEditPost: (state) => {
      state.editingPost = null
    },
    startEditingPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload
      const foundPost = state.postList.find((post) => post.id === postId) || null
      state.editingPost = foundPost
    }
    // updatePost: (state, action: PayloadAction<Post>) => {
    //   const payloadPost = action.payload
    //   state.postList.forEach((post, i) => {
    //     if (post.id === payloadPost.id) state.postList[i] = action.payload
    //   })
    // }
  },
  extraReducers(builder) {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.postList.push(action.payload)
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const payloadPost = action.payload
        state.postList.forEach((post, i) => {
          if (post.id === payloadPost.id) {
            state.postList[i] = action.payload
            return true
          }
          return false
        })
        state.editingPost = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postID = action.meta.arg
        const postIndex = state.postList.findIndex((post) => post.id === postID)
        if (postIndex !== -1) state.postList.splice(postIndex, 1)
      })
      .addMatcher<PendingAction>(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          state.loading = true
          state.currentRequestId = action.meta.requestId
        }
      )
      .addMatcher<FulfilledAction | RejectedAction>(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state, action) => {
          if (state.loading && state.currentRequestId === action.meta.requestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
  }
})

export const { cancelEditPost, startEditingPost } = blogSlice.actions
const blogReducer = blogSlice.reducer
export default blogReducer

// createAction
// export const addPost = createAction<Post>('blog/addPost')
// export const deletePost = createAction<string>('blog/deletePost')
// export const editPost = createAction<string>('blog/editPost')
// export const cancelEditPost = createAction('blog/cancelEditPost')
// export const updatePost = createAction<Post>('blog/updatePost')

// //create reducer
// const blogReducer = createReducer(initState, (builder) => {
//   builder
//     .addCase(addPost, (state, action) => {
//       const post = action.payload
//       state.postList.push(post)
//     })
//     .addCase(deletePost, (state, action) => {
//       const postID = action.payload
//       const postIndex = state.postList.findIndex((post) => post.id === postID)
//       if (postIndex !== -1) state.postList.splice(postIndex, 1)
//     })
//     .addCase(editPost, (state, action) => {
//       const postID = action.payload
//       const foundPost = state.postList.find((post) => post.id === postID) || null
//       state.editingPost = foundPost
//     })
//     .addCase(cancelEditPost, (state) => {
//       state.editingPost = null
//     })
//     .addCase(updatePost, (state, action) => {
//       const payloadPost = action.payload
//       state.postList.forEach((post, i) => {
//         if (post.id === payloadPost.id) state.postList[i] = action.payload
//       })
//     })
// })

// export default blogReducer
