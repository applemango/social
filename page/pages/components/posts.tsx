import type { NextPage } from 'next'
import { useRouter } from "next/router";
import Head from 'next/head'
import Image from 'next/image'
//import styles from './styles/index.module.scss'

import React from "react";
import { useState, useEffect } from "react";

import InfiniteScroll from 'react-infinite-scroller'; 

import { get_post, get_post_follow } from "../../lib/get"
import { isLogin } from '../../lib/token';

import Post from "./post"

import postStyles from "./styles/post.module.scss"
import postsStyles from "./styles/posts.module.scss"

import MyIcon from "./myIcon"

const Posts: NextPage = () => {
    const [loadEnd, setLoadEnd] = useState(false)

    const [posts, setPosts]:any = useState([{}])
    const [postsStart, setPostsStart] = useState(0)
    const [postsOneLoad, setPostsOneLoad] = useState(10)
    const [login, setLogin] = useState(false)
    const [sort, setSort] = useState(login ? "follow" : "new")

    const [screenHeight, setScreenHeight] = useState(0)

    const router = useRouter();

    const loadMore = async (page:any) => {
        let res;
        if(sort == "follow") {
            res = await get_post_follow(postsStart, postsStart + postsOneLoad)
        } else {
            res = await get_post(postsStart,postsStart+postsOneLoad,sort)
        }
        const data = JSON.parse(res)
        if(!data || data.length < postsOneLoad) {
            setLoadEnd(true)
        }
        let r:any = []
        data.forEach((data: any) => {
            r.push({
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
        });
        setPosts([...posts,...r])
        setPostsStart(postsStart + postsOneLoad )
    }
    const items = (
        <div key={0}>
            { posts.map((p:any, index:number) => (
                <div key={index}>
                    <Post data={p} />
                </div>
            ))}
        </div>
    )
    const loader = (
        <div key={1}>
            { a((screenHeight-300 < 0 ? 150 : screenHeight-300)/150).map((p:any, index:number) => (
                <div key={index} className={postsStyles.loader}></div>
            ))}
        </div>
    )
    function a(n:number) {
        let r = [];
        for (var i = 0; i < n; i++) {
            r.push(i)
        }
        return r
    }
    useEffect(() => {if(isLogin()){
        setLogin(true)
        setSort("follow")
        setPosts([{}])
        setPostsStart(0)
        setLoadEnd(false)
    }},[])
    function e() {if(window != undefined) {setScreenHeight(window.innerHeight)}}
    useEffect(() => {e()})
    return (
        <div>
            { login && (
                <div className = {` ${postStyles.post} ${postsStyles.post} `}>
                    <div className = { postsStyles.create }>
                        <div className = { postsStyles.icon }>
                            <MyIcon width={128} height={128} className={ postsStyles.icon_ }/>
                        </div>
                        <div className = { postsStyles.input} onClick = {() => {router.replace("/create")}}>
                            <input className = { postsStyles.input_ } type="text" placeholder={"Create Post"} />
                        </div>
                    </div>
                </div>
            )}
            <div className = {` ${postStyles.post} ${ postsStyles.sort} `}>
                { login && (
                    <div onClick = {() => {
                        if(sort != "follow") {
                            setSort("follow")
                            setPosts([{}])
                            setPostsStart(0)
                            setLoadEnd(false)
                        }
                    } } className = { postsStyles.sortType }>
                        <div className = {` ${postsStyles.logo} ${postsStyles.bolt} `}></div>
                        <a className = { postsStyles.sortType_ }>follow</a>
                    </div>
                ) }
                <div onClick = {() => {
                    if(sort != "new") {
                        setSort("new")
                        setPosts([{}])
                        setPostsStart(0)
                        setLoadEnd(false)
                    }
                } } className = { postsStyles.sortType }>
                    <div className = {` ${postsStyles.logo} ${postsStyles.bolt} `}></div>
                    <a className = { postsStyles.sortType_ }>new</a>
                </div>
                <div onClick = {() => {
                    if(sort != "trending") {
                        setSort("trending")
                        setPosts([{}])
                        setPostsStart(0)
                        setLoadEnd(false)
                    }
                } } className = { postsStyles.sortType }>
                    <div className = {` ${postsStyles.logo} ${postsStyles.trending} `}></div>
                    <a className = { postsStyles.sortType_ }>trending</a>
                </div>
                <div onClick = {() => {
                    if(sort != "image") {
                        setSort("image")
                        setPosts([{}])
                        setPostsStart(0)
                        setLoadEnd(false)
                    }
                } } className = { postsStyles.sortType }>
                    <div className = {` ${postsStyles.logo} ${postsStyles.image} `}></div>
                    <a className = { postsStyles.sortType_ }>image</a>
                </div>
            </div>
            <InfiniteScroll loadMore={loadMore} hasMore={!loadEnd} loader={loader}>
                {items}
            </InfiniteScroll>
        </div>
    )
}
export default Posts
