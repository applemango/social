import { useRouter } from "next/router";
import { useState, useEffect } from "react";


import postStyles from "./components/styles/post.module.scss"
import styles from "./styles/create.module.scss"

import { isLogin } from "../lib/token"
import { post, post_image } from "../lib/send"

import Header from "./components/header"

const Create = () => {
    const router = useRouter()
    const [show, setShow] = useState(false)
    const [type, setType] = useState(0);
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [url, setUrl] = useState("")
    const [sending, setSending] = useState(false)
    const [selectedFile, setSelectedFile]:any = useState(null);
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    function fileSelect(event: any) {setSelectedFile(event.target.files[0]);setError(false)}
    function check() {
        if(type == 0 && title.length > 0) {return true}
        if(type == 1 && title.length > 0 && selectedFile) {return true}
        if(type == 2 && title.length > 0 && url.length > 0) {return true}
        setError(true)
        setErrorMessage("title is none or file or url is none")
        return false
    }
    function send() {
        setSending(!sending)
    }
    async function submit() {
        if(!check()) {return}
        send()
        let res;
        if(type == 0) {res = await post("post",title,body)}
        if(type == 1) {res = await post_image(title,selectedFile)}
        if(type == 2) {res = await post("url",title,url)}
        send()
        if(res) {
            router.replace("/")
            return
        }
        setError(true)
        setErrorMessage("???")
    }
    useEffect(() => {
        if(isLogin()) {
            setShow(true)
        } else {
            router.replace("/login")
        }
    },[])
    return (
        <div>
            <Header />
            { show && (
                <div className = {` ${postStyles.post} ${styles.main} `} >
                    <div className = { styles.selector }>
                        <div className = {` ${styles.select} ${ type == 0 ? (styles.select_active) : ("") } `} onClick={() => {setType(0);setSelectedFile(null);setError(false)}}>
                            <div className = {` ${styles.select_icon} ${styles.select_icon_post} `}></div>
                            <p>Post</p>
                        </div>
                        <div className = {` ${styles.select} ${ type == 1 ? (styles.select_active) : ("") } `} onClick={() => {setType(1);setError(false)}}>
                            <div className = {` ${styles.select_icon} ${styles.select_icon_image} `}></div>
                            <p>Image</p>
                        </div>
                        <div className = {` ${styles.select} ${ type == 2 ? (styles.select_active) : ("") } `} onClick={() => {setType(2);setSelectedFile(null);setError(false)}}>
                            <div className = {` ${styles.select_icon} ${styles.select_icon_url} `}></div>
                            <p>Url</p>
                        </div>
                    </div>
                    <div className = { styles.main_ }>
                        { type == 0 && (
                            <div className = {styles.main__ }>
                                <input value = {title} onChange = {(event) => {setTitle(event.target.value);setError(false)} } type="text" className = {styles.input_title} placeholder = {"title"} />
                                <textarea value = {body} onChange = {(event) => {setBody(event.target.value);setError(false)} } className = {styles.input_body} placeholder = {"Text (optional)"}></textarea>
                            </div>
                        )}
                        { type == 1 && (
                            <div className = {styles.main__ }>
                                <input value = {title} onChange = {(event) => {setTitle(event.target.value);setError(false)} } type="text" className = {styles.input_title} placeholder = {"title"} />
                                <input className = {styles.input_file} name="file" type="file" onChange = {fileSelect} accept=".png, .jpg" />
                                <div className = {styles.input_file_}>
                                    <div className = {styles.input_file__}>
                                        <div>
                                            { selectedFile && (
                                                <div className = {styles.logo}></div>
                                            )}
                                            <p className = { selectedFile ? (styles.active) : ("")}>{selectedFile ? (selectedFile.name) : ("Drag and drop image or")}</p>
                                            { !selectedFile && (
                                                <button>Upload</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        { type == 2 && (
                            <div className = {styles.main__ }>
                                <input value = {title} onChange = {(event) => {setTitle(event.target.value);setError(false)} } type="text" className = {styles.input_title} placeholder = {"title"} />
                                <input value = {url} onChange = {(event) => {setUrl(event.target.value);setError(false)} } type="text" className = {styles.input_title} placeholder = {"url"} />
                            </div>
                        )}
                    </div>
                    <div className = { styles.submit } >
                        {!sending ? (<button onClick={submit} >Post</button>) : (<p className={styles.submit_loading}>loading...</p>)}
                        { error && (<p className={styles.submit_error}>{errorMessage}</p>)}
                    </div>
                </div>
            )}
        </div>
    );
}
//{!sending ? (<button onClick={submit} >Post</button>) : (<p className={styles.submit_text}>loading...</p>)}
export default Create;