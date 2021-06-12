/* 
    Filename: router.js
    Description: this is the client-side router
                 which will take the URL info and insert the
                 associated compiled handle bars template
                 w/ data from API.
*/


import { loadInitialPosts, loadComments, getCacheRef, setCurrentPostID } from './datastore.js' 

// events for changing buttons
import {
    commmentButton, postButton
} from './button_events.js'


//Takes the timestamp of a specific post in UNIX utc format and derives
//how long post has been up by comparing to current time
function convertTime(postTime){

    //postTime contains the raw millisecond format of time that post was made

    //get this exact format for the current time
    var currTime = Date.now()

    //Get difference in milliseconds between current time and time of posting
    var msDifference = currTime - Number(postTime)

    //Convert milliseconds to hours and minutes
    var hours = msDifference / (1000 * 60 * 60)

    var finalHours = Math.trunc(hours)

    var finalMinutes = Math.floor((hours - finalHours) * 60)


    //Insert derived hours and minutes into final string
    var finalTimeString = "Posted " + finalHours + " hours and " + finalMinutes + " minutes ago"

    return finalTimeString

}


// Handlebar Template Imports
import AboutTemplate from '../views/about.hbs'
import PostContainerTemplate from '../views/post-container.hbs'
import NotFoundTemplate from '../views/404.hbs'
import SinglePostCommentsTemplate from '../views/post-single.hbs'


async function setupPostsPage(params){

    const payload = {posts: []}
    const cache = getCacheRef()

    for (let post_id of Object.keys(cache)){
        console.log(post_id)
        let postObject = {_id:post_id, ...cache[post_id]}
        postObject.timestamp = convertTime(postObject.timestamp)
        payload.posts.push(postObject)
    }

    return payload
}

async function getCommentsFromCache(params){

    const post_id = params['id']
    // maybe error check here?

    const cache = getCacheRef()

    if (!post_id || !cache[post_id]) return {
        post: {_id: 1, title: "Post Not Found", body: "This post doesn't exist.  Maybe try reloading the web-page?"},
        comments: []
    }

    // Update Cache Post ID State
    setCurrentPostID(post_id)

    const payload = {
        post: {_id: post_id, ...cache[post_id]},
        comments: await loadComments(post_id)
    }

    payload.post.timestamp = convertTime(payload.post.timestamp)

    console.log(payload.comments)

    return payload
}


/*
    This parses the arguments which come after the ? in the url
    "localhost/#?id=3&user=Mark" --> {"id": "3", "user": "Mark"}
*/
const GetURLParameters = () => {
    
    const contentAfterHash = window.location.hash.split('?').slice(1)
    const parameters = {}
    
    if (contentAfterHash.length){
        let pairings = contentAfterHash[0].split('&').map(x => x.split('='))
        for (let [arg, value] of pairings){
            parameters[String(arg)] = String(value);
        }
    }

    return parameters
}


// THIS IS IMPORTANT: IT STORES DESTRUCTOR
let currentDestructor = undefined


// This returns a "closure" (a function) which is setup to
// dynamically update the DOM router element with the handlebars
// template's content.
function RouteHandler(template, parameterized = false, eventHooks = false){
    return async () => {
        let parameters = undefined
        if (parameterized !== false){
            const URL_params = GetURLParameters()
            // Parameterized function handles URL params
            parameters = await parameterized(URL_params)
        }
        // Update DOM
        document.getElementById('router').innerHTML = template(parameters)

        if (eventHooks){
            // call constructor
            eventHooks[0]()
            currentDestructor = eventHooks[1]
        }
    }
}


// Update DOM based on route info
const updateRoutes = function () {

    // Call destructor if available
    if (currentDestructor !== undefined){
        currentDestructor()
        currentDestructor = undefined
    }

    const hash_path = window.location.hash.split('?')[0].toLowerCase().slice(1)

    // Defined routes--these should ALL be lowercase
    const routes = {
        '': RouteHandler(PostContainerTemplate, setupPostsPage, postButton()),
        'posts': RouteHandler(PostContainerTemplate, setupPostsPage, postButton()),
        'post': RouteHandler(SinglePostCommentsTemplate, getCommentsFromCache, commmentButton()),
        'about': RouteHandler(AboutTemplate, false),
        '404': RouteHandler(NotFoundTemplate, false),
    }

    // Does our route match?
    for (let key of Object.keys(routes)){
        if (hash_path === key.toLowerCase()){
            routes[hash_path]()
            return
        }
    }

    // otherwise return 404
    routes['404']()
}

// Adds event listeners
export function IntiailizeRoutes(){
    
    loadInitialPosts()
        .then(data => {
            console.log("Posts loaded")
            window.addEventListener('hashchange', updateRoutes)
            window.addEventListener('load', updateRoutes)
            document.addEventListener('ReloadComments', () => {
                console.log('reloading comments..')
                updateRoutes()
            })
            updateRoutes()
            console.log('now listening')
        })
        .catch(err => {
            console.log("Error caught: " + err)
        })
    

}