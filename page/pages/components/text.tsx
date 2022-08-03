import React from "react"

type Props = {
    text: string
    className: any
}
const Text = ({ text, className }:Props) => {
    if(text == undefined) {
        return (<div key={1}><p className={className} >{text}</p></div>)
    }
    const t = text.split("\n")
    return (
        <div>
            { t.length > 0 && 
                t.map((t, index) => (
                    <div key={ index }>
                        <p className={className} >{t}</p>
                    </div>
                ))}
        </div>
    )
}
export default Text
