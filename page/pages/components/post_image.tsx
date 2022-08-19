import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { getUrl } from "../../lib/main"

import styles from "./styles/post.module.scss"

type Props = {
    link: string
}
const Post_image = ({ link }:Props) => {
    const myLoader = ({scr}:any) => {
        return getUrl(`images/${ link }`)
    }
    return (
        <div>
            <TransformWrapper
            minScale={0.5}
            >
                <TransformComponent>
                    <div>
                    <Image
                    loader={myLoader}
                    layout={"fill"}
                    objectFit={"contain"}
                    src={getUrl(`images/${ link }`)}
                    alt="icon"
                    className={ styles.icon_ }
                    />
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    )
}
export default Post_image