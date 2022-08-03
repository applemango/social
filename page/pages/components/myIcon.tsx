import { useEffect } from "react"
import React from "react"
import { useState } from "react"
import Image from "next/image";

import { get_me_icon } from "../../lib/get"
import { getUrl } from "../../lib/main"

type Props = {
    width: number
    height: number
    className:any
}
const MyIcon = ({ width,height,className }:Props) => {
    const [my, setMy] = useState("")
    async function main() {
        const res = await get_me_icon()
        setMy(res)
    }
    useEffect(() => {
        main()
    })
    const myLoader = ({scr}:any) => {
        return getUrl(`icons/${my}`);
    }
    if(!my){return <div></div>;}
    return (
        <Image
        loader={myLoader}
        src={getUrl(`icons/${my}`)}
        alt="icon"
        width={width}
        height={height}
        className={className}
        />
    )
}
export default MyIcon