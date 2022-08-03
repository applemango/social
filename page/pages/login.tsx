import type { NextPage } from 'next'
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import style from "./styles/login.module.scss"
import React from "react";
import Link from "next/link";

import { login, signUp, isLogin } from "../lib/token"

const Login: NextPage = () => {
    const router = useRouter();
    const [sign, setSign] = useState(false)
    const [name, setName] = useState("")
    const [pass, setPass] = useState("")
    const [passFC, setPassFC] = useState("")
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    async function login_() {
        if(!name || !pass){setError(true);setErrorMessage("password or username has not been entered");return}
        const res = await login(name, pass)
        if (res.msg == "success") {
            router.replace("/");
        } else {
            setError(true);
            setErrorMessage(res.text)
        }
    }
    async function signUp_() {
        if(!name || !pass){setError(true);setErrorMessage("password or username has not been entered");return}
        if(name.length < 3) {setError(true);setErrorMessage("username is too short");return;}
        if(pass.length < 5) {setError(true);setErrorMessage("password is too short");return;}
        if(pass != passFC) {setError(true);setErrorMessage("password does not match confirmation");return;}
        if(pass == name) {setError(true);setErrorMessage("password cannot be the same as username");return;}
        const res = await signUp(name, pass)
        if(res.msg == "success") {
            router.replace("/");
        } else {
            setError(true);
            setErrorMessage(res.text)
        }
    }
    return (
        <div>
            <div className = { style.main }>
                {sign ? 
                    (<h1 className = { style.title }>welcome</h1>): 
                    (<h1 className = { style.title }>welcome back :)</h1>)
                }
                <div className = { style.main_ }>
                    <div>
                        <div className = { style.text }><p>Username</p></div>
                        <input onChange = { (event: any) => {setName(event.target.value)} } type="username" />
                    </div>
                    <div>
                        <div className = { style.text } ><p>Password</p></div>
                        <input onChange = { (event: any) => {setPass(event.target.value)} } type="password" />
                        { sign && (
                            <div>
                                <div className = { style.text } ><p>for confirmation</p></div>
                                <input onChange = { (event: any) => {setPassFC(event.target.value)} } type="password" />
                            </div>
                        )}
                    </div>
                    { error && (
                        <p className = { style.errorMessage }>{ errorMessage }</p>
                    )}
                    { sign ?
                        (<button onClick = { () => signUp_() }>Sign Up</button>):
                        (<button onClick = { () => login_() }>login</button>)
                    }
                    <div className = { style.hone_Sign }>
                        { isLogin(true) ? (
                            <Link href="/"><a>Home</a></Link>
                        ) : (
                            <Link href="/"><a>Home</a></Link>
                        )}
                        <p>/</p>
                        { sign ? 
                            (<a className = { style.changeMode } onClick = { () => {
                                setSign(false)
                                setError(false)
                            }}>Login</a>):
                            (<a className = { style.changeMode } onClick = { () => {
                                setSign(true)
                                setError(false)
                            }}>Sign Up</a>)
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Login