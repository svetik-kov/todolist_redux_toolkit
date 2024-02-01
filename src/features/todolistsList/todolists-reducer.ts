import {appAction, RequestStatusType} from "app/app-reducer"
import {handleServerNetworkError} from "common/utils/handleServerNetworkError"
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {TodolistType} from "features/todolistsList/api/todolistApi.types";
import {todolistsAPI} from "features/todolistsList/api/todolistApi";
import {createAppAsyncThunk, handleServerAppError} from "common";
import {ResultCode} from "features/todolistsList/tasks-reducer";


const slice = createSlice({
    name: 'todolists',
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            //return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].entityStatus = action.payload.entityStatus
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id)
                if (index !== -1) state[index].title = action.payload.title
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                state.unshift({...action.payload.todolist, filter: "all", entityStatus: "idle"})
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id)
                if (index !== -1) state.splice(index, 1)
            })
            .addCase(fetchTodolists.fulfilled, (state, action) => {
                return action.payload.todolists.map((tl) => ({...tl, filter: "all", entityStatus: "idle"}))
            })
            .addCase(clearTasksAndTodolists, (state, action) => {
                return []
            })
    }
})

const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, void>(`${slice.name}/fetchTodolists`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: "loading"}))
            const res = await todolistsAPI.getTodolists()
            dispatch(appAction.setAppStatus({status: "succeeded"}))
            return {todolists: res.data}
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })


const removeTodolist = createAppAsyncThunk<{ id: string }, string>(`${slice.name}/removeTodolist`,
    async (id, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: "loading"}))
            dispatch(todolistsAction.changeTodolistEntityStatus({id, entityStatus: "loading"}))
            const res = await todolistsAPI.deleteTodolist(id)
            if (res.data.resultCode === ResultCode.success) {
                dispatch(appAction.setAppStatus({status: "succeeded"}))
                return {id}
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }

    })


const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, string>(`${slice.name}/addTodolist`,
    async (title, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: "loading"}))
            const res = await todolistsAPI.createTodolist(title)
            if (res.data.resultCode === ResultCode.success) {
                dispatch(appAction.setAppStatus({status: "succeeded"}))
                return {todolist: res.data.data.item}
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })


const changeTodolistTitle = createAppAsyncThunk<{ id: string, title: string }, { id: string, title: string }>(`${slice.name}/changeTodolistTitle`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: "loading"}))
            const res = await todolistsAPI.updateTodolist(arg.id, arg.title)
            if (res.data.resultCode === ResultCode.success) {
                dispatch(appAction.setAppStatus({status: "succeeded"}))
                return {id: arg.id, title: arg.title}
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })


// types
export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

export const todolistsReducer = slice.reducer
export const todolistsAction = slice.actions
export const todolistsThunks = {fetchTodolists, removeTodolist, addTodolist, changeTodolistTitle}