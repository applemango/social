import axios from "axios"
import { getUrl } from './main'

import { isLoginAndLogin, getToken } from "./token"

export async function likeAndDislike(id: number,like: boolean = true) {
    const login = await isLoginAndLogin()
    if(login) {
        try {
            const res = await axios.get(
                getUrl(`post/${ like ? 'like' : 'dislike' }/${id}`), {
                    headers: {
                        "Content-Type": "application/json"
                        ,"Authorization": "Bearer "+getToken()
                    }
                }
            )
            return res.data
        } catch (error: any) {
            return false
        }
    } else {
        return false
    }
}

export async function post(type: string = "post",title: string, body: string) {
    const login = await isLoginAndLogin()
    if(login) {
        try {
            const res = await axios.post(
                getUrl('post'), {
                    body: JSON.stringify({
                        type: type
                        ,title: title
                        ,text: body
                    })
                }, {
                    headers: {
                        "Content-Type": "application/json;"
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
export async function post_image(title: string,selectedFile:File) {
    const login = await isLoginAndLogin()
    if(login) {
        try {
            const formData = new FormData();
            formData.append("file", selectedFile)
            formData.append("type","image")
            formData.append("title",title)
            const res = await axios.post(
                getUrl("post/image"),
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

export async function comment(title: string, body: string, id: number) {
    const login = await isLoginAndLogin()
    if(login) {
        try {
            const res = await axios.post(
                getUrl('comment'), {
                    body: JSON.stringify({
                        title: title
                        ,text: body
                        ,id: id
                    })
                }, {
                    headers: {
                        "Content-Type": "application/json;"
                        ,'Authorization': 'Bearer '+getToken()
                    }
                }
            )
            return res
        } catch (error: any) {
            return false
        }
    }
    return false
}