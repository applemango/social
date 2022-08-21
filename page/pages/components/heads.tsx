import Head from "next/head"
type Props = {
    title: string
    description: string
    unIndex?: boolean
}
export default function Heads({title, description, unIndex}:Props) {
    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={ description } />
            { unIndex && (
                <meta name="robots" content="noindex,nofollow"></meta>
            )}
        </Head>
    )
}