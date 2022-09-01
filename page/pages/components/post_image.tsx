import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import { getUrl } from "../../lib/main"

import styles from "./styles/post.module.scss"

type Props = {
    link: string
    move?: boolean
}
const Post_image = ({ link, move = false }:Props) => {
    const myLoader = ({scr}:any) => {
        return getUrl(`images/${ link }`)
    }
    return (
        <div>
            <TransformWrapper
                minScale={0.5}
                disabled={!move}
            >
                <TransformComponent>
                    <div className={styles.postImageBackground}>
                        <Image
                            loader={myLoader}
                            layout={"fill"}
                            objectFit={"contain"}
                            src={getUrl(`images/${ link }`)}
                            alt="icon"
                            className={ styles.postImage }
                            width={"100%"}
                            height={"100%"}
                        />
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    )
}
export default Post_image