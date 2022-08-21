import type { NextPage } from 'next'

import styles from './styles/index.module.scss'

import Posts from "./components/posts"
import Header from "./components/header"
import Heads from "./components/heads"

const Home: NextPage = () => {
    return (
        <div className = {styles.main}>
            <Heads title={"social.abc - Home"} description={"None"} />
            <Header />
            <Posts />
        </div>
    )
}
export default Home
