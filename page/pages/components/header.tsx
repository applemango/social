import { useRouter } from "next/router";
import Link from "next/link";
import React from "react"
import axios from 'axios'
import { useState, useEffect } from "react"
import styles from "./styles/header.module.scss"

import { isLogin, logout } from "../../lib/token"

const Header = () => {
    const router = useRouter();
    const [login, setLogin] = useState(false)
    async function out() {
        const res = await logout()
        router.reload();
    }
    useEffect(() => {
        setLogin(isLogin())
    },[])
    return (
        <header className = { styles.header } >
            <div className = { styles.title }>
                <Link href="/" >
                    <a>
                        <div className = { styles.logo }>
                            <div></div>
                            <p>ABC</p>
                        </div>
                    </a>
                </Link>
            </div>
            <div className = { styles.links} >
                { login ? (
                    <div>
                        <a onClick = { () => out() } className = {` ${styles.link_account} ${styles.logout } `}>Log out</a>
                        <Link href="/settings"><a className = {` ${styles.link_account} ${styles.settings } `}></a></Link>
                    </div>
                ) :(
                    <div>
                        <Link href="/login"><a className = {` ${styles.link_account} ${styles.login} `}>Log in</a></Link>
                        <Link href="/login"><a className = {` ${styles.link_account} ${styles.signUp} `}>Sign up</a></Link>
                    </div>
                )}
            </div>
        </header>
    )
}
//<div className = { styles.logo }></div>
//<h1 className = { styles.heading }>Hello!</h1>
export default Header