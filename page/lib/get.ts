import axios from "axios"
import { getUrl } from './main'
import { isLoginAndLogin, getToken } from './token'

export async function get_me() {
    const login = await isLoginAndLogin()
    if (login) {
        try {
            const res = await axios.get(
                getUrl("me"), {
                    headers: {
                        "Content-Type": "application/json"
                        ,"Authorization": "Bearer "+getToken()
                    }
                }
            )
            return res.data
        } catch (error) {
            return false
        }
    }
    return false
}
export async function get_me_icon() {
    const login = await isLoginAndLogin()
    if (login) {
        try {
            const res = await axios.get(
                getUrl("me/icon"), {
                    headers: {
                        "Content-Type": "application/json"
                        ,"Authorization": "Bearer "+getToken()
                    }
                }
            )
            return res.data.name
        } catch (error) {
            return false
        }
    }
    return false

}

export async function get_post(start:number = 0, end:number = 10, type:string = "new") {
    const login = await isLoginAndLogin()
    if (login) {
        return await get_post_login(start,end,type)
    } else {
        return await get_post_normal(start,end,type)
    }
}

export async function get_post_normal(start:number = 0, end:number = 10, type:string = "new") {
    try {
        const res = await axios.post(
            getUrl("post/get"), {
                body: JSON.stringify(
                    {
                        start : start
                        , end : end
                        , type: type 
                    }
                )
            }
        )
        return res.data
    } catch (err) {
        return false
    }
}
export async function get_post_login(start:number = 0, end:number = 10, type:string = "new") {
    try {
        const res = await axios.post(
            getUrl("post/get/login"),{
                body: JSON.stringify(
                    {
                        start : start
                        ,end  : end
                        ,type : type 
                    }
                )
            }, {
                headers: {
                    "Content-Type": "application/json;"
                    ,"Authorization": "Bearer "+getToken()
                }
            }
        )
        return res.data
    } catch (err) {
        return await get_post_normal(start,end,type)
    }
}

export async function get_post_one(id: number) {
    const login = await isLoginAndLogin()
    if (login) {
        return await get_post_one_login(id)
    } else {
        return await get_post_one_normal(id)
    }
}

export async function get_post_one_normal(id: number) {
    try {
        const res = await axios.get(
            getUrl(`post/get/one/${id}`)
        )
        return res
    } catch (err) {
        return false
    }
}

export async function get_post_one_login(id: number) {
    try {
        const res = await axios.get(
            getUrl(`post/get/one/login/${id}`),{
                headers: {
                    "Content-Type": "application/json;"
                    ,"Authorization": "Bearer "+getToken()
                }
            }
        )
        return res
    } catch (err) {
        return await get_post_one_normal(id)
    }
}

export async function get_post_follow(start:number = 0, end:number = 10) {
    try {
        const res = await axios.post(
            getUrl("post/get/follow"),{
                body: JSON.stringify(
                    {
                        start : start
                        ,end  : end
                    }
                )
            }, {
                headers: {
                    "Content-Type": "application/json;"
                    ,"Authorization": "Bearer "+getToken()
                }
            }
        )
        return res.data
    } catch (err) {
        return false
    }
}

export async function get_comment(id: number) {
    try {
        const res = await axios.get(
            getUrl(`comment/get/${id}`)
        )
        return res
    } catch (err) {
        return false
    }
}

export async function isFollow(username: string) {
    const login = await isLoginAndLogin()
    if(login) {
        try {
            const res = await axios.post(
                getUrl('isfollow'), {
                    body: JSON.stringify({
                        username: username
                    })
                }, {
                    headers: {
                        "Content-Type": "application/json;"
                        ,'Authorization': 'Bearer '+getToken()
                    }
                }
            )
            return res.data
        } catch (error: any) {
            return false
        }
    }
    return false
}