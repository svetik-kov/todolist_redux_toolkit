import { tasksReducer } from "features/todolistsList/tasks-reducer"
import { todolistsReducer } from "features/todolistsList/todolists-reducer"
import { AnyAction, applyMiddleware, combineReducers, createStore } from "redux"
import thunkMiddleware, { ThunkAction, ThunkDispatch } from "redux-thunk"
import { appReducer } from "./app-reducer"
import { authReducer } from "features/auth/module/auth-reducer"
import {configureStore} from "@reduxjs/toolkit";


// непосредственно создаём store
/*export const store_ = createStore(rootReducer, applyMiddleware(thunkMiddleware))*/
export const store=configureStore({
  reducer:{
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer,
  }
})
// определить автоматически тип всего объекта состояния
//export type AppRootStateType_ = ReturnType<typeof rootReducer>
export type AppRootStateType = ReturnType<typeof store.getState>

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppRootStateType, unknown, AnyAction>

// export type AppDispatch = typeof store.dispatch
//export type AppDispatch_ = ThunkDispatch<AppRootStateType, unknown, AnyAction>
export type AppDispatch = typeof store.dispatch

// а это, чтобы можно было в консоли браузера обращаться к store в любой момент
// @ts-ignore
window.store = store
