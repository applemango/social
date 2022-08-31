import { useRouter } from "next/router"
import { useEffect } from "react"

const PostPage = () => {
    const router = useRouter()
    const { id } = router.query
    useEffect(() => {
        if(!id) return
        router.push(`/?id=${id}`)
    })
    return <p>redirect...</p>
}
export default PostPage