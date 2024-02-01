import {instance} from "common/api/instance";
import {LoginParamsType} from "./authApi.types";
import {ResponseType} from "common/types";

export const authAPI = {
    login(data: LoginParamsType) {
        return instance.post<ResponseType<{ userId?: number }>>("auth/login", data)
    },
    logout() {
        return instance.delete<ResponseType<{ userId?: number }>>("auth/login")
    },
    me() {
        return instance.get<ResponseType<{ id: number; email: string; login: string }>>("auth/me")
    },
}

