import {createSlice, PayloadAction} from "@reduxjs/toolkit";


export type RequestStatusType = "idle" | "loading" | "succeeded" | "failed"

const slice=createSlice({
  name:'app',
  initialState:{
    status: "idle" as RequestStatusType,
    error: null as null|string,
    isInitialized: false,
  },
  reducers:{
    setAppError:(state,action:PayloadAction<{error: string | null}>)=>{
      state.error=action.payload.error
    },
    setAppStatus:(state,action:PayloadAction<{ status: RequestStatusType }>)=>{
      state.status=action.payload.status
},
    setAppInitialized:(state,action:PayloadAction<{ isInitialized: boolean }>)=>{
     state.isInitialized=action.payload.isInitialized
}
  }
})


/*export const initializeAppTC = () => (dispatch: Dispatch) => {
  authAPI.me().then((res) => {
    if (res.data.resultCode === ResultCode.success) {
      dispatch(authAction.setIsLoggedIn({isLoggedIn:true}))
    } else {
    }

    dispatch(appAction.setAppInitialized({isInitialized:true}))
  })
}*/



export const appReducer=slice.reducer
export const appAction=slice.actions

export type AppInitialState=ReturnType<typeof slice.getInitialState>