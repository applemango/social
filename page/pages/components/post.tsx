import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import React from "react"
import { useState, useEffect } from "react"
import styles from "./styles/post.module.scss"

import Text from "./text"

import Post_image from "./post_image"

import { getUrl } from "../../lib/main"
import { likeAndDislike } from "../../lib/send"
import { dateConversion } from "../../lib/utility"

type Props = {
    data: any
}
const Post = ({data}:Props) => {
    const router = useRouter();
    const [share, setShare] = useState(false)
    const [rating, setRating] = useState(getRanting())
    const [postLike,setPostLike] = useState(getLike())
    const time = dateConversion(getTimestamp())
    const [link, setLink] = useState("")
    const img = getIcon()
    useEffect(() => {
        if(location != undefined) {
            setLink(`http://${location.host}/${data.id}`)
        }
    },[])
    if(!data) {
        return (<div></div>)
    }
    function getTimestamp() {if (!data) {return Date.now()}return data.timestamp}
    function getLike() {if(!data) {return null}return data.like}
    function getRanting() {if(!data) {return 0}return data.rating}////if(Object.keys(data).indexOf("rating") == -1) {return 0}
    function getIcon(){if(!data){return 0}return data.icon}
    if(!data.id) return(<div></div>)
    async function like(n:number) {
        const res = await likeAndDislike(n)
        if(res) {
            setRating(res.rating)
            setPostLike(res.like)
        } else {
            router.replace("/login")
        }
    }
    async function dislike(n:number) {
        const res = await likeAndDislike(n,false)
        if(res) {
            setRating(res.rating)
            setPostLike(res.like)
        } else {
            router.replace("/login")
        }
    }
    const myLoader = ({scr}:any) => {
        return getUrl(`icons/${img}`);
    }
    const myLoader_ = ({scr}:any) => {
        return getUrl(`images/${data.text}`)
    }
    return (
        <div className = { styles.post } >
            <div className  = { styles.rating }>
                <button className = {` ${styles.like} ${postLike ? (styles.like_active) : ("")} `} onClick = {() => like(data.id)}></button>
                <p className = {` ${styles.rate} ${rating < 0 ? (styles.rate_minus) : (rating > 0 ? (styles.rate_plus) : (""))} `}>{!rating ? 0 : rating}</p>
                <button className = {` ${styles.dislike} ${postLike == false ? (styles.dislike_active) : ("")} `} onClick = { () => dislike(data.id) }></button>
            </div>
            <div className = { styles.main }>
                <div className = { styles.data }>
                    <div className = { styles.icon }>
                        <Image
                            loader={myLoader}
                            src={getUrl(`icons/${img}`)}
                            alt="icon"
                            width={128}
                            height={128}
                            className={ styles.icon_ }
                        />
                    </div>
                    <div className = { styles.data_list }>
                        <p className = { styles.username}>{data.username}</p>
                        <p>{time}</p>
                    </div>
                </div>
                <div className = { styles.main_ }>
                    { data.type == "post" && (
                        <div>
                            <h3 className = { styles.title}>{data.title}</h3>
                            <Text className = { styles.text } text={data.text} />
                        </div>
                    )}
                    { data.type == "image" && (
                        <div>
                            <h3 className = { styles.title}>{data.title}</h3>
                            <div className = { styles.image }>
                                <Post_image link={data.text} />
                            </div>
                        </div>
                    )}
                    { data.type == "url" && (
                        <div>
                            <h3 className = { styles.title}>{data.title}</h3>
                            <a href={data.text} className = { styles.link} rel="noopener noreferrer" target="_blank">{data.text}</a>
                        </div>
                    )}
                </div>
                <div className = { styles.data_bottom}>
                    <Link href={"/"+data.id}>
                        <a target="">
                            <div className = { styles.bottom_button}>
                                <div className = {`${styles.bottom_icon} ${styles.bottom_icon_comment}`}></div>
                                <p>{data.comments}</p>
                                <p> Comments</p>
                            </div>
                        </a>
                    </Link>
                    <div className = { styles.bottom_button} onClick={() => setShare(!share) }>
                        <div className = {`${styles.bottom_icon} ${styles.bottom_icon_share}`}></div>
                        <p>Share</p>
                    </div>
                </div>
                { share && (
                    <div className = { styles.share}>
                        <Link href={link}><a className = { styles.link }>{link}</a></Link>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Post
/*
                        <div>
                            <h3 className = { styles.title}>{data.title}</h3>
                            <div className = { styles.image }>
                                <Image
                                    loader={myLoader_}
                                    layout={"fill"}
                                    objectFit={"contain"}
                                    src={getUrl(`images/${data.text}`)}
                                    alt="icon"
                                    className={ styles.icon_ }
                                />
                            </div>
                        </div>
*/