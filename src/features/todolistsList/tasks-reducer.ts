import {handleServerNetworkError} from "common/utils/handleServerNetworkError"
import {appAction} from "app/app-reducer";
import {createSlice} from "@reduxjs/toolkit";
import {todolistsThunks} from "features/todolistsList/todolists-reducer";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {createAppAsyncThunk} from "common/utils/createAppAsyncThunk";
import {handleServerAppError} from "common/utils/handleServerAppError";
import {AddTasksArg, TaskType, UpdateTaskArg, UpdateTaskModelType} from "features/todolistsList/api/todolistApi.types";
import {todolistsAPI} from "features/todolistsList/api/todolistApi";
import {TaskPriorities, TaskStatuses} from "common/enums";


const slice = createSlice({
    name: 'tasks',
    initialState: {} as TasksStateType,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(addTask.fulfilled, (state, action) => {
                state[action.payload.task.todoListId].unshift(action.payload.task)
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks[index] = {...tasks[index], ...action.payload.model}
            })
            .addCase(removeTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks.splice(index, 1)
            })
            .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
                state[action.payload.todolist.id] = []
            })
            .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
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
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }


    })


const addTask = createAppAsyncThunk<{ task: TaskType }, AddTasksArg>(`${slice.name}/addTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue, getState} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: "loading"}))
            //const res = await todolistsAPI.createTask(arg.todolistId, arg.title)
            const res = await todolistsAPI.createTask(arg)
            if (res.data.resultCode === ResultCode.success) {
                const task = res.data.data.item
                dispatch(appAction.setAppStatus({status: "succeeded"}))
                return {task}
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })


;
const updateTask = createAppAsyncThunk<UpdateTaskArg, UpdateTaskArg>(`${slice.name}/updateTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue, getState} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: 'loading'}))
            const state = getState()
            const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId)
            if (!task) {
                //throw new Error("task not found in the state");
                dispatch(appAction.setAppError({error: 'Task not found'}))
                console.warn("task not found in the state")
                return rejectWithValue(null)
            }

            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...arg.model,
            }

            const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
            if (res.data.resultCode === ResultCode.success) {
                dispatch(appAction.setAppStatus({status: 'succeeded'}))
                return arg
            } else {
                handleServerAppError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })


const removeTask = createAppAsyncThunk<{ taskId: string, todolistId: string }, { taskId: string, todolistId: string }>(`${slice.name}/removeTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appAction.setAppStatus({status: "loading"}))
            const res = await todolistsAPI.deleteTask(arg.todolistId, arg.taskId)
            if (res.data.resultCode === ResultCode.success) {
                dispatch(appAction.setAppStatus({status: "succeeded"}))
                return arg
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
export const ResultCode = {
    success: 0,
    error: 1,
    captcha: 10
} as const

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
export const tasksThunks = {fetchTasks, removeTask, addTask, updateTask}