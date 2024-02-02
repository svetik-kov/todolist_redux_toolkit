import {Dispatch} from "redux"
import {handleServerNetworkError} from "common/utils/handleServerNetworkError"
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {appAction} from "app/app-reducer";
import {ResultCode} from "features/todolistsList/tasks-reducer";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {handleServerAppError} from "common/utils/handleServerAppError";
import {LoginParamsType} from "features/auth/api/authApi.types";
import {authAPI} from "features/auth/api/authApi";
import {createAppAsyncThunk} from "common";


//https://immerjs.github.io/immer/update-patterns/#array-mutations
//https://redux-toolkit.js.org/usage/immer-reducers

const slice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false
    },
    reducers: {
      /*  setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
            state.isLoggedIn = action.payload.isLoggedIn
        }*/
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(logout.fulfilled,(state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
            .addCase(initializeApp.fulfilled,(state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn
            })
    }
})


// thunks
const login = createAppAsyncThunk<{isLoggedIn: boolean}, LoginParamsType>(`${slice.name}/login`,
    async (data, thunkAPI) => {
        const {dispatch, rejectWithValue, getState} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: "loading"}))
            const res = await authAPI.login(data)
            if (res.data.resultCode === ResultCode.success) {
                dispatch(appAction.setAppStatus({status: "succeeded"}))
                return {isLoggedIn: true}
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })

/*export const loginTC =
    (data: LoginParamsType) => (dispatch: Dispatch) => {
        dispatch(appAction.setAppStatus({status: "loading"}))
        authAPI
            .login(data)
            .then((res) => {
                if (res.data.resultCode === ResultCode.success) {
                    dispatch(authAction.setIsLoggedIn({isLoggedIn: true}))
                    dispatch(appAction.setAppStatus({status: "succeeded"}))
                } else {
                    handleServerAppError(res.data, dispatch)
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch)
            })
    }*/

const logout = createAppAsyncThunk<{isLoggedIn: boolean}, void>(`${slice.name}/logout`,
    async (_, thunkAPI) => {
        const {dispatch, rejectWithValue, getState} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: "loading"}))
            const res = await authAPI.logout()
            if (res.data.resultCode === ResultCode.success) {
                dispatch(appAction.setAppStatus({status: "succeeded"}))
                dispatch(clearTasksAndTodolists())
              return {isLoggedIn: false}
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })
/*export const logoutTC = () => (dispatch: Dispatch) => {
    dispatch(appAction.setAppStatus({status: "loading"}))
    authAPI.logout()
        .then((res) => {
            if (res.data.resultCode === ResultCode.success) {
                dispatch(authAction.setIsLoggedIn({isLoggedIn: false}))
                dispatch(appAction.setAppStatus({status: "succeeded"}))
                dispatch(clearTasksAndTodolists())
                /!*dispatch(tasksAction.clearTasks())
                dispatch(todolistsAction.clearTodolists())*!/
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}*/

const initializeApp=createAppAsyncThunk<{isLoggedIn:boolean},void >(`${slice.name}/initializeApp`,
    async (_,thunkAPI)=>{
      const {dispatch, rejectWithValue} = thunkAPI
      try {
        dispatch(appAction.setAppStatus({status: "loading"}))
        const res =await authAPI.me()
        if (res.data.resultCode === ResultCode.success) {
          return {isLoggedIn:true}
        } else {
          handleServerAppError(res.data, dispatch)
          return rejectWithValue(null)
        }
      } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
      }
      finally {
          dispatch(appAction.setAppInitialized({isInitialized:true}))
      }
    })

export const authReducer = slice.reducer
export const authAction = slice.actions
export const authThunks = {login, logout,initializeApp}
//export const {setIsLoggedIn}= slice.actions