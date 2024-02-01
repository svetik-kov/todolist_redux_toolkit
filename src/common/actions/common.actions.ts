import {createAction} from "@reduxjs/toolkit";
import {TasksStateType} from "features/todolistsList/tasks-reducer";
import {TodolistDomainType} from "features/todolistsList/todolists-reducer";

export type ClearTasksAndTodolists={
    tasks:TasksStateType
    todolists:TodolistDomainType[]
}
export const clearTasksAndTodolists=createAction('common/clear-tasks-todolists')