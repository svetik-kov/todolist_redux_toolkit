import {todolistsAPI, TodolistType} from "api/todolists-api"
import {Dispatch} from "redux"
import {appAction, RequestStatusType} from "app/app-reducer"
import {handleServerNetworkError} from "utils/error-utils"
import {AppThunk} from "app/store"
import {createSlice, PayloadAction} from "@reduxjs/toolkit";



const slice = createSlice({
    name: 'todolists',
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            // return state.filter((tl) => tl.id != action.id)
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state.splice(index, 1)

        },
        addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            // return [{ ...action.todolist, filter: "all", entityStatus: "idle" }, ...state]
            state.unshift({...action.payload.todolist, filter: "all", entityStatus: "idle"})
        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            // return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl))
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].title = action.payload.title

            // 2 variant
            const todo = state.find((todo) => todo.id === action.payload.id)
            if (todo) {
                todo.title = action.payload.title
            }
        },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            //return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].entityStatus = action.payload.entityStatus
        },
        setTodolists: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
            // return action.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }))
            // 1 variant
            action.payload.todolists.forEach((tl) => {
                state.push({...tl, filter: "all", entityStatus: "idle"})
            })

            // 2 variant
            //return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        }
    }
})



// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {
        dispatch(appAction.setAppStatus({status: "loading"}))
        todolistsAPI
            .getTodolists()
            .then((res) => {
                dispatch(todolistsAction.setTodolists({todolists:res.data}))
                dispatch(appAction.setAppStatus({status: "succeeded"}))
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch)
            })
    }
}
export const removeTodolistTC = (todolistId: string): AppThunk => {
    return (dispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(appAction.setAppStatus({status: "loading"}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(todolistsAction.changeTodolistEntityStatus({id:todolistId,entityStatus: "loading"}))
        todolistsAPI.deleteTodolist(todolistId).then((res) => {
            dispatch(todolistsAction.removeTodolist({id:todolistId}))
            //скажем глобально приложению, что асинхронная операция завершена
            dispatch(appAction.setAppStatus({status: "succeeded"}))
        })
    }
}
export const addTodolistTC = (title: string): AppThunk => {
    return (dispatch) => {
        dispatch(appAction.setAppStatus({status: "loading"}))
        todolistsAPI.createTodolist(title).then((res) => {
            dispatch(todolistsAction.addTodolist({todolist:res.data.data.item}))
            dispatch(appAction.setAppStatus({status: "succeeded"}))
        })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title).then((res) => {
            dispatch(todolistsAction.changeTodolistTitle({id, title}))
        })
    }
}

// types
export type FilterValuesType = "all" | "active" | "completed"
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

export const todolistsReducer=slice.reducer
export const todolistsAction=slice.actions