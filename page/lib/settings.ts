import axios from "axios"
import { getUrl } from './main'

import { isLoginAndLogin, getToken } from "./token"

export async function set_icon(selectedFile:File) {
    const login = await isLoginAndLogin()
    if(login) {
        try {
            const formData = new FormData();
            formData.append("file", selectedFile)
            const res = await axios.post(
                getUrl("/post/icon"),
                formData, {
                    headers: {
                        "Content-Type": "multipart/form-data;"
                        ,'Authorization': 'Bearer '+getToken()
                    }
                }
            )
            return true
        } catch (error: any) {
            return false
        }
    }
    return false
}