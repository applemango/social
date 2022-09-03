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
import { follow, unFollow } from "../../lib/send"
import { isFollow } from "../../lib/get"

type Props = {
    data: any
    className?: any
    movePostImage?: boolean
}
const Post = ({data, className, movePostImage = false }:Props) => {
    const router = useRouter();
    const [share, setShare] = useState(false)
    const [rating, setRating] = useState(getRanting())
    const [postLike,setPostLike] = useState(getLike())
    const time = dateConversion(getTimestamp())
    const [link, setLink] = useState("")
    const [following, setFollowing] = useState(false)
    const img = getIcon()
    useEffect(() => {
        if(location != undefined) {
            setLink(`http://${location.host}/${data.id}`)
        }
    },[])
    useEffect(() => {
        async function get_isFollowing() {
            const res = await isFollow(data.username)
            setFollowing(res)
        }
        get_isFollowing()
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
    async function followUser() {
        const res = await follow(data.username)
        setFollowing(true)
    }
    async function unFollowUser() {
        const res = await unFollow(data.username)
        setFollowing(false)
    }
    const myLoader = ({scr}:any) => {
        return getUrl(`icons/${img}`);
    }
    const myLoader_ = ({scr}:any) => {
        return getUrl(`images/${data.text}`)
    }
    return (
        <div className = {` ${styles.post} ${className} `} >
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
                        <div className={styles.name}>
                            <p className = { styles.username}>{data.username}</p>
                            <div className={styles.userHover}>
                                <div className = { styles.userHover_}>
                                    { following ? (
                                        <button className={styles.followButton} onClick={unFollowUser}>unFollow</button>
                                    ):(
                                        <button className={styles.followButton} onClick={followUser}>Follow</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p>{time}</p>
                    </div>
                </div>
                <Link href={`/?id=${data.id}`} as={`/post/${data.id}`}>
                    <a>
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
                                        <Post_image link={data.text} move={movePostImage} />
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
                        <div style={{display:"none"}}>
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
                    </a>
                </Link>
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