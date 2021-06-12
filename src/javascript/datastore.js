/*
    Filename: datastore.js
    Description:
        Keeps API data in memory thorugh a simple object.
*/

import {apiPOST, apiGET} from './api.js'

// Store all our info.
// Stores _id -> title, body, timestamp
//              \-> comments: []
let cache = {}
let currentPostId = null

export function getCurrentPostID(){
    return currentPostId
}
export function setCurrentPostID(post_id){
    currentPostId = post_id
    return
}

export function getCacheRef(){
    return cache
}

export async function loadInitialPosts(){

    const results = await apiGET('posts', '0')
    const jsonResults = await results.json()

    for (let obj of jsonResults){
        let {_id, title, body, timestamp} = obj
        cache[_id] = {title, body, timestamp}
    }

}


export async function loadComments(post_id){
    const results = await apiGET('posts/comments', post_id)
    const jsonResults = await results.json()


    cache[post_id].comments = []

    for (let comment of jsonResults){
        cache[post_id].comments.push(comment)
    }
    

    return cache[post_id].comments
}


export async function addPost(payload){
    const response = await apiPOST('newpost', payload)
    // TODO: CHECK REPSONSE STATUS THEN ADD TO CACHE
}

export async function addComment(payload){
    const response = await apiPOST('newcomment', payload)
    // TODO: check response status then add to cache
}

export async function LoadNewPosts(){
    console.log('load new posts called but not implemented')
}