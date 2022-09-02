import type { NextPage } from 'next'

import styles from './styles/index.module.scss'

import Posts from "./components/posts"
import Header from "./components/header"
import Heads from "./components/heads"
import Post from "./components/modal"

import { follow, unFollow } from "../lib/send"
import { get_post_follow } from "../lib/get"

import { useRouter } from "next/router";
import Modal from 'react-modal'
Modal.setAppElement('#__next')

const Home: NextPage = () => {
    const router = useRouter()
    return (
        <>
            {
                /*<button onClick={() => {
                    async function f() {
                        const res = await follow("mango")
                        console.log(res)
                    }
                    f()
                }}>Follow</button>
                <button onClick={() => {
                    async function f() {
                        const res = await unFollow("mango")
                        console.log(res)
                    }
                    f()
                }}>unFollow</button>
                <button onClick={() => {
                    async function f() {
                        const res = await get_post_follow(0,10)
                        const data = JSON.parse(res)
                        console.log(data)
                    }
                    f()
                }}>getFollowPost</button>*/
            }
            <Modal
                className={styles.modal}
                style={{
                    overlay: {
                        backgroundColor: "rgb(0 0 0 / 45%)"
                    }
                    ,content: {}
                }}
                isOpen={!!router.query.id}
                onRequestClose={() => router.push("/")}
                contentLabel="post modal"
            >
                <div className={styles.modal_}>
                    <Post id={router.query.id} />
                </div>
            </Modal>
            <div className = {styles.main} style={!!router.query.id ? {
                height: "100vh"
                ,overflow: "hidden"
            }:{}}>
                <Heads title={"social.abc - Home"} description={"None"} />
                <Header />
                <Posts />
            </div>
        </>
    )
}
export default Home
