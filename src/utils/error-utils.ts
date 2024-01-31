
import { ResponseType } from "api/todolists-api"
import { Dispatch } from "redux"
import {appAction} from "app/app-reducer";
import axios from "axios";
import {AppDispatch} from "app/store";

export const handleServerAppError = <D>(
  data: ResponseType<D>,
  dispatch: Dispatch,
) => {
  if (data.messages.length) {
    dispatch(appAction.setAppError({error:data.messages[0]}))
  } else {
    dispatch(appAction.setAppError({error:"Some error occurred"}))
  }
  dispatch(appAction.setAppStatus({status:"failed"}))
}

export const handleServerNetworkError = (err: unknown, dispatch: AppDispatch):void => {
  let errorMessage = "Some error occurred";

  // ❗Проверка на наличие axios ошибки
  if (axios.isAxiosError(err)) {
    // ⏺️ err.response?.data?.message - например получение тасок с невалидной todolistId
    // ⏺️ err?.message - например при создании таски в offline режиме
    errorMessage = err.response?.data?.message || err?.message || errorMessage;
    // ❗ Проверка на наличие нативной ошибки
  } else if (err instanceof Error) {
    errorMessage = `Native error: ${err.message}`;
    // ❗Какой-то непонятный кейс
  } else {
    errorMessage = JSON.stringify(err);
  }

  dispatch(appAction.setAppError({ error: errorMessage }));
  dispatch(appAction.setAppStatus({ status: "failed" }));
};

export const handleServerNetworkError_ = (
  error: { message: string },
  dispatch: Dispatch,
) => {
  dispatch(appAction.setAppError({error:error.message ? error.message : "Some error occurred"}))
  dispatch(appAction.setAppStatus({status:"failed"}))
}



//обработка ошибок (различные варианты)
//https://gist.github.com/safronman/df79fdac4cf5e4b4a159da460163cdbc

//export const errorUtils = (e: Error | AxiosError<{error: string}>, dispatch: Dispatch<SetAppErrorActionType>) => {
//     const err = e as Error | AxiosError<{ error: string }>
//     if (axios.isAxiosError(err)) {
//         const error = err.response?.data ? err.response.data.error : err.message
//         dispatch(setAppErrorAC(error))
//     } else {
//         dispatch(setAppErrorAC(`Native error ${err.message}`))
//     }
// }
//
//
// // https://github.com/axios/axios/issues/3612
// // 1. then/catch
// // 1 ver
// const deletePackTC1 = (packId: string): AppThunk => dispatch => {
//     packsAPI.deletePack(packId)
//         .then(() => {
//             // code
//         })
//         .catch((err: AxiosError<{ error: string }>) => {
//             const error = err.response
//                 ? err.response.data.error
//                 : err.message
//             console.log('error: ', error)
//         })
// }
// // 2 ver
// const deletePackTC2 = (packId: string): AppThunk => dispatch => {
//     packsAPI.deletePack(packId)
//         .then(() => {
//             // code
//         })
//         .catch((err: AxiosError) => {
//             const error = err.response
//                 ? (err.response.data as ({ error: string })).error
//                 : err.message
//             console.log('error: ', error)
//         })
// }
//
//
// // 2. try/catch
// // 1 ver
// export const deletePackTC3 = (packId: string): AppThunk => async dispatch => {
//     try {
//         // code
//     } catch (e) {
//         const err = e as Error | AxiosError<{ error: string }>
//         if (axios.isAxiosError(err)) {
//             const error = err.response?.data ? err.response.data.error : err.message
//             dispatch(setAppErrorAC(error))
//         } else {
//             dispatch(setAppErrorAC(`Native error ${err.message}`))
//         }
//     }
// }
//
// // 2 ver
// export const deletePackTC4 = (packId: string): AppThunk => async dispatch => {
//     try {
//         // code
//     } catch (e) {
//         const err = e as Error | AxiosError
//         if (axios.isAxiosError(err)) {
//             const error = err.response?.data ? (err.response.data as { error: string }).error : err.message
//             dispatch(setAppErrorAC(error))
//         } else {
//             dispatch(setAppErrorAC(`Native error ${err.message}`))
//         }
//     }
// }