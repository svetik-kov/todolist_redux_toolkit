import {Dispatch} from "redux"
import {authAPI, LoginParamsType} from "api/todolists-api"
import {handleServerAppError, handleServerNetworkError} from "utils/error-utils"
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {appAction} from "app/app-reducer";
import {tasksAction} from "features/TodolistsList/tasks-reducer";
import {todolistsAction} from "features/TodolistsList/todolists-reducer";
import {clearTasksAndTodolists} from "common/actions/common.actions";


//https://immerjs.github.io/immer/update-patterns/#array-mutations
//https://redux-toolkit.js.org/usage/immer-reducers

const slice = createSlice({
    name: 'auth',
    initialState:{
        isLoggedIn: false},
    reducers: {
        setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
            state.isLoggedIn = action.payload.isLoggedIn
        }
    }
})
export const authReducer = slice.reducer
export const authAction=slice.actions
//export const {setIsLoggedIn}= slice.actions




// thunks
export const loginTC =
    (data: LoginParamsType) => (dispatch: Dispatch) => {
        dispatch(appAction.setAppStatus({status: "loading"}))
        authAPI
            .login(data)
            .then((res) => {
                if (res.data.resultCode === 0) {
                    dispatch(authAction.setIsLoggedIn({isLoggedIn:true}))
                    dispatch(appAction.setAppStatus({status:"succeeded"}))
                } else {
                    handleServerAppError(res.data, dispatch)
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch)
            })
    }
export const logoutTC = () => (dispatch: Dispatch) => {
    dispatch(appAction.setAppStatus({status:"loading"}))
    authAPI
        .logout()
        .then((res) => {
            if (res.data.resultCode === 0) {
                dispatch(authAction.setIsLoggedIn({isLoggedIn:false}))
                dispatch(appAction.setAppStatus({status:"succeeded"}))
                dispatch(clearTasksAndTodolists())
                /*dispatch(tasksAction.clearTasks())
                dispatch(todolistsAction.clearTodolists())*/
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}

