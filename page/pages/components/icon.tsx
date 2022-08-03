import Image from "next/image";

import { getUrl } from "../../lib/main"

type Props = {
    width: number
    height: number
    className:any
    name:string
}
const Icon = ({ width,height,className,name }:Props) => {
    const myLoader = () => {
        return getUrl(`icons/${name}`);
    }
    return (
        <Image
        loader={myLoader}
        src={getUrl(`icons/${name}`)}
        alt="icon"
        width={width}
        height={height}
        className={className}
        />
    )
}
export default Icon