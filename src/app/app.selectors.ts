import {RootState} from "@reduxjs/toolkit/query";
import {AppRootStateType} from "app/store";

export const selectStatus=(state:AppRootStateType) => state.app.status
export const selectIsInitialized=(state:AppRootStateType) => state.app.isInitialized
export const selectIsLoggedIn=(state:AppRootStateType) => state.auth.isLoggedIn



//createSelector - это функция из библиотеки reselect, которая позволяет создавать селекторы в Redux-приложениях.
// Селекторы используются для извлечения данных из хранилища Redux,
// а createSelector помогает оптимизировать производительность приложения, кэшируя результаты вызова селекторов и предотвращая повторные вычисления.

//export const filteredByNamePacksSelector = createSelector(
//   // 1 - массив селекторов
//   [packsSelector],
//   // 2 - функция, которая принимает данные от селекторов и возвращает новое значение
//   (packs) => {
//     console.log("filteredByNamePacksSelector");
//     return packs.filter((p) => p.name.includes("f"));
//   }
// );

//https://react-redux.js.org/api/hooks#useselector-examples