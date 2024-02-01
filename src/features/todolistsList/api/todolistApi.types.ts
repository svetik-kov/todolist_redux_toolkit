
import {UpdateDomainTaskModelType} from "features/todolistsList/tasks-reducer";
import {TaskPriorities, TaskStatuses} from "common/enums";


export type AddTasksArg={ title: string, todolistId: string }
export type UpdateTaskArg = { taskId: string, model: UpdateDomainTaskModelType, todolistId: string }

export type TodolistType = {
    id: string
    title: string
    addedDate: string
    order: number
}


export type TaskType = {
    description: string
    title: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
    id: string
    todoListId: string
    order: number
    addedDate: string
}
export type UpdateTaskModelType = {
    title: string
    description: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
}
export type GetTasksResponse = {
    error: string | null
    totalCount: number
    items: TaskType[]
}