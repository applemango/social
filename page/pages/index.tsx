import type { NextPage } from 'next'

import styles from './styles/index.module.scss'

import Posts from "./components/posts"

import Header from "./components/header"

const Home: NextPage = () => {
    return (
        <div className = {styles.main}>
            <Header />
            <Posts />
        </div>
    )
}
export default Home
