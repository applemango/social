import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import postStyles from "./components/styles/post.module.scss"
import styles from "./styles/create.module.scss"
import style from "./styles/settings.module.scss"

import { isLogin } from "../lib/token"
import { set_icon } from "../lib/settings"

import Header from "./components/header"

const Create = () => {
    const router = useRouter()
    const [show, setShow] = useState(false)
    const [selectedFile, setSelectedFile]:any = useState(null);
    const [msg, setMsg] = useState("")
    function fileSelect(event: any) {setSelectedFile(event.target.files[0])}

    async function post() {
        setMsg("Loading...")
        if(selectedFile) {
            const res = await set_icon(selectedFile)
            if(res) {
                setMsg("Success!")
            } else {
                setMsg("Error")
            }
        } else {
            setMsg("file not selected")
        }
    }
    useEffect(() => {
        if(isLogin()) {
            setShow(true)
        } else {
            router.replace("/login")
        }
    })
    return (
        <div>
            <Header />
            { show && (
                <div>
                    <div className = {`${postStyles.post} ${style.icon_settings}`} >
                        <div className = {style.top}>
                            <h2>icon settings</h2>
                            <div className = {`${styles.submit} ${style.submit}`}>
                                <button onClick = { () => post()}>save</button>
                            </div>
                        </div>
                        { msg && (
                            <p>{msg}</p>
                        )}
                        <div className = {`${styles.main__ } ${style.icon_input}`}>
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
                    </div>
                </div>
            )}
        </div>
    );
}

export default Create;
