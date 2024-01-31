import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from "api/todolists-api"
import {Dispatch} from "redux"
import {AppDispatch, AppRootStateType, AppThunk} from "app/store"
import {handleServerAppError, handleServerNetworkError} from "utils/error-utils"
import {appAction} from "app/app-reducer";
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {todolistsAction} from "features/TodolistsList/todolists-reducer";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {createAppAsyncThunk} from "utils/createAppAsyncThunk";


const slice = createSlice({
    name: 'tasks',
    initialState: {} as TasksStateType,
    reducers: {
        removeTask: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            if (index !== -1) tasks.splice(index, 1)
        },
        addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
            state[action.payload.task.todoListId].unshift(action.payload.task)
        },
        updateTask: (state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            if (index !== -1) tasks[index] = {...tasks[index], ...action.payload.model}
        },
      /*  setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) => {
            state[action.payload.todolistId] = action.payload.tasks
        },*/
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.fulfilled,(state,action)=>{
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(removeTask.fulfilled,(state,action)=>{
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks.splice(index, 1)
            })
            .addCase(todolistsAction.addTodolist, (state, action) => {
                state[action.payload.todolist.id] = []
            })
            .addCase(todolistsAction.removeTodolist, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(todolistsAction.setTodolists, (state, action) => {
                action.payload.todolists.forEach((tl) => {
                    state[tl.id] = []
                })

            })
            .addCase(clearTasksAndTodolists, (state, action) => {
                return {}
            })
    }
})


// thunks

const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[], todolistId: string },
    string>(`${slice.name}/fetchTasks`,
    async (todolistId, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appAction.setAppStatus({status: "loading"}))
        const res = await todolistsAPI.getTasks(todolistId)
        const tasks = res.data.items
        dispatch(appAction.setAppStatus({status: "succeeded"}))
        return {tasks, todolistId}
    } catch (e:any) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }


})

/*export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(appAction.setAppStatus({status: "loading"}))
    todolistsAPI.getTasks(todolistId).then((res) => {
        const tasks = res.data.items
        dispatch(tasksAction.setTasks({tasks, todolistId}))
        dispatch(appAction.setAppStatus({status: "succeeded"}))
    })
}*/
const removeTask=createAppAsyncThunk<{taskId: string, todolistId: string},{taskId: string, todolistId: string}>(`${slice.name}/removeTask`,
    async (arg,thunkAPI)=>{
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appAction.setAppStatus({status: "loading"}))
        const res=await todolistsAPI.deleteTask(arg.todolistId, arg.taskId)
        dispatch(appAction.setAppStatus({status: "succeeded"}))
        return {taskId, todolistId}
    } catch (e) {
        return rejectWithValue(null)
    }
})


export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId).then((res) => {
        const action = tasksAction.removeTask({taskId, todolistId})
        dispatch(action)
    })
}
export const addTaskTC =
    (title: string, todolistId: string) =>
        (dispatch: Dispatch) => {
            dispatch(appAction.setAppStatus({status: "loading"}))
            todolistsAPI
                .createTask(todolistId, title)
                .then((res) => {
                    if (res.data.resultCode === 0) {
                        const task = res.data.data.item
                        const action = tasksAction.addTask({task})
                        dispatch(action)
                        dispatch(appAction.setAppStatus({status: "succeeded"}))
                    } else {
                        handleServerAppError(res.data, dispatch)
                    }
                })
                .catch((error) => {
                    handleServerNetworkError(error, dispatch)
                })
        }
export const updateTaskTC =
    (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
        (dispatch, getState: () => AppRootStateType) => {
            const state = getState()
            const task = state.tasks[todolistId].find((t) => t.id === taskId)
            if (!task) {
                //throw new Error("task not found in the state");
                console.warn("task not found in the state")
                return
            }

            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...domainModel,
            }

            todolistsAPI
                .updateTask(todolistId, taskId, apiModel)
                .then((res) => {
                    if (res.data.resultCode === 0) {
                        const action = tasksAction.updateTask({taskId, model: domainModel, todolistId})
                        dispatch(action)
                    } else {
                        handleServerAppError(res.data, dispatch)
                    }
                })
                .catch((error) => {
                    handleServerNetworkError(error, dispatch)
                })
        }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}


export const tasksReducer = slice.reducer
export const tasksAction = slice.actions
export const tasksThunks={fetchTasks, removeTask}