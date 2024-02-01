
import {Dispatch} from "redux";
import {appAction} from "app/app-reducer";
import {ResponseType} from "common/types";

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
