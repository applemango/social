import type { NextPage } from 'next'
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import Post from "./components/post"

import Icon from "./components/icon"

import Text from "./components/text"

import styles from "./styles/id.module.scss"
import postStyles from "./components/styles/post.module.scss"
import createStyles from "./styles/create.module.scss"


import { dateConversion } from "../lib/utility"
import { isLogin } from "../lib/token"
import { get_post_one, get_comment } from "../lib/get"
import { comment } from "../lib/send"

import Header from "./components/header"


//const Comment:NextPage = ({id, post_data, comment_data}:any) => {
const Comment:NextPage = ({id}:any) => {
    const router = useRouter()
    const [login, setLogin] = useState(isLogin())
    const [postData, setPostData] = useState({})
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [comments, setComments] = useState([{}])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    async function get_post(id:number) {
        const res = await get_post_one(id)
        //const res = {"data":post_data}
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
    //useEffect(() => {
    //    const id = Number(router.query.id)
    //    setLogin(isLogin())
    //    if(id && typeof id == "number") {
    //        get_post(id)
    //    }
    //},[router.query.id])
    useEffect(() => {
        //if(post_data) {
        //    get_post(id)
        //} else {
        //    setNotFound(true)
        //}
        get_post(id)
    },[])
    return (
        <div>
            <Header />
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
                        <div className = {`${createStyles.main__} ${styles.post} ${postStyles.post}`}>
                            <input value = {title} onChange = {(event) => {setTitle(event.target.value)} } type="text" className = {createStyles.input_title} placeholder = {"title"} />
                            <textarea value = {body} onChange = {(event) => {setBody(event.target.value)} } className = {`${createStyles.input_body} ${ styles.textarea }`} placeholder = {"Text (optional)"}></textarea>
                            <div className = {` ${createStyles.submit} ${ styles.submit } `} >
                                <button onClick={() => post()} >Post</button>
                            </div>
                        </div>
                    )}
                    <div className = {`${postStyles.post} ${styles.comments}`}>
                        { comments.length > 0 && comments.map((c:any, index:number) => (
                            c.text ? (
                                <div key = {index} className = {`${styles.comment}`}>
                                    <div className = {styles.top}>
                                        <Icon width={12} height={12} className = {styles.icon} name={c.icon} />
                                        <p>{c.username}</p>
                                        <p>{dateConversion(c.timestamp)}</p>
                                    </div>
                                    <h4 className = {styles.comment_title}>{c.title}</h4>
                                    <Text text = {c.text} className = {styles.text}/>
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

export async function getServerSideProps(context:any) {
    const id = Number(context.query.id)
    //const post_data:any = await get_post_one(id)//ssrだとlocalStorageにアクセスできないが
    //const comment_data:any = await get_comment(id)
    return {
        props: {
            "id":id
            //,"post_data": post_data.data ? post_data.data : null
            //,"comment_data": comment_data.data ? comment_data.data : null
        }
    }
}

export default Comment;
