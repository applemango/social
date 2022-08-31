import styles from "./styles/modal.module.scss"

import type { NextPage } from 'next'
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Post from "./post"
import Icon from "./icon"
import Text from "./text"
import idStyles from "../styles/id.module.scss"
import postStyles from "./styles/post.module.scss"
import createStyles from "../styles/create.module.scss"
import { dateConversion } from "../../lib/utility"
import { isLogin } from "../../lib/token"
import { get_post_one, get_comment } from "../../lib/get"
import { comment } from "../../lib/send"
import Header from "./header"
import Heads from "./heads"

const Post_ = ({id}:any) => {
    const router = useRouter()
    const [login, setLogin] = useState(isLogin())
    const [postData, setPostData] = useState({})
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [comments, setComments] = useState([{}])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [headTitle,setHeadTitle] = useState("Not found")

    async function get_post(id:number) {
        const res = await get_post_one(id)
        if (res) {
            data(res)
            return
        }
    }
    function data(response: any) {
        const data = JSON.parse(response.data);
        setPostData({
            "id":data.id
            ,"type":data.type
            ,"title":data.title
            ,"text":data.text
            ,"username":data.username
            ,"timestamp":data.timestamp
            ,"rating":data.rating
            ,"like":data.like
            ,"comments":data.comments
            ,"icon":data.icon
        })
        setHeadTitle(data.title)
        getComments()
    }
    async function getComments() {
        const res = await get_comment(Number(router.query.id))
        //const res = {"data":comment_data}
        if(res) {
            const comment = JSON.parse(res.data)
            let r:any = [];
            comment.forEach((c:any, index:number) => {
                r.push({
                    "title":c.title
                    ,"text":c.text ? c.text : " "
                    ,"timestamp":c.timestamp
                    ,"username":c.username
                    ,"icon":c.icon
                });
            });
            setComments([...comments,...r])
        }
        setLoading(false)
    }
    async function post() {
        const id = Number(router.query.id)
        const res = await comment(title, body, id)
        if(res) {
            const d = res.data
            const r = [{
                "title":title
                ,"text":body ? body : " "
                ,"timestamp":"now"
                ,"username":d.username
                ,"icon":d.icon
            }]
            setComments([...r,...comments,])
            setTitle("")
            setBody("")
        }
    }
    useEffect(() => {
        get_post(id)
    },[])
    return (
        <div>
            <Heads title={"social.abc - post : " + headTitle } description={"None"} />
            { notFound && (
                <div>
                    <h1>Not Found</h1>
                </div>
            )}
            { !loading && (
                <div>
                    <div>
                        <Post data={postData} />
                    </div>
                    { login && (
                        <div className = {`${createStyles.main__} ${idStyles.post} ${postStyles.post}`}>
                            <input value = {title} onChange = {(event) => {setTitle(event.target.value)} } type="text" className = {createStyles.input_title} placeholder = {"title"} />
                            <textarea value = {body} onChange = {(event) => {setBody(event.target.value)} } className = {`${createStyles.input_body} ${ idStyles.textarea }`} placeholder = {"Text (optional)"}></textarea>
                            <div className = {` ${createStyles.submit} ${ idStyles.submit } `} >
                                <button onClick={() => post()} >Post</button>
                            </div>
                        </div>
                    )}
                    <div className = {`${postStyles.post} ${idStyles.comments}`}>
                        { comments.length > 0 && comments.map((c:any, index:number) => (
                            c.text ? (
                                <div key = {index} className = {`${idStyles.comment}`}>
                                    <div className = {idStyles.top}>
                                        <Icon width={12} height={12} className = {idStyles.icon} name={c.icon} />
                                        <p>{c.username}</p>
                                        <p>{dateConversion(c.timestamp)}</p>
                                    </div>
                                    <h4 className = {idStyles.comment_title}>{c.title}</h4>
                                    <Text text = {c.text} className = {idStyles.text}/>
                                </div>
                            ):""
                        ))}
                        { (!(comments.length > 1) && !loading ) && (
                            <h1>No comments yet.</h1>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Post_