import React from 'react'
import Layout from './layout'

export interface TestProps {
    title: string
}

function IndexComponent(props: TestProps) {
    return (
        <Layout title={props.title}>
            <h1>{props.title}</h1>
            <p>React is working!</p>
        </Layout>
    )
}


export default IndexComponent


