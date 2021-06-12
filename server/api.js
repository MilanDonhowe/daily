/**
    Filename: api.js
    Description: json-API express router.
                 All clientside requests should be made to
                 <host>/api/<route defined here>
                 e.g. localhost:3000/api/posts/0 --> returns 1st page of posts
                                                     made in last 24 hours.
*/

// import database interface
const {getDBReference} = require('./db.js')


const express = require('express')
const router = express.Router()

// Enable JSON parsing
router.use(express.json())

/* CREATE OPERATIONS */


/*
JSON POST Request Body:
{
    title
    body
}
*/
router.post('/newpost', async (req, res) => {
    // ready request body & insert into DB
    const title = req.body['title']
    const body = req.body['body']
    if (title && body){

        // otherwise add the post
        const newPost = {
            title,
            body,
            timestamp: Date.now()
        }

        // now push post to database
        const result = await (getDBReference()).createPost(newPost)

        if (result === false){
            res.status(400).send('Post violates database size limits')
            return
        }

        res.status(200).send('Post added')
        return
    }
    res.status(400).send('Invalid or missing request parameters')
})


// JSON POST Request Body:
// { 
//  body
//  post_id
// }
router.post('/newcomment', async (req, res) => {

    // Get JSON body parameters
    const body = req.body['body']
    const post_id = req.body['post_id']

    if (body && post_id){

        const result = await (getDBReference()).createComment({post_id, body})

        // error results
        if (result === -1){
            res.status(400).send('Comment violates database size limits')
            return
        }
        if (result === -2){
            res.status(500).send('Post ID references non-existent post')
            return
        }

        res.status(200).send('Comment added')
        return
    }
    res.status(400).send('Invalid or missing request parameters')
})


/* READ OPERATIONS */

// Get posts (paginated)
router.get('/posts/:page', async (req, res) => {
    // parse parameter
    const pageNumber = parseInt(req.params.page, 10)
    
    // if parameter is invalid, tell them.
    if (isNaN(pageNumber)) {
        res.status(400).send('Must specify valid page number')
        return
    }

    const posts = await (getDBReference()).getPosts(pageNumber)    

    res.status(200).send(JSON.stringify(posts))
})


// Get comments associated with a post
router.get('/posts/comments/:post_id', async (req, res) => {
    
    if (!req.params.post_id){
        res.status(400).send('Must specify a post id')
        return
    }

    const comments = await (getDBReference()).getComments(req.params.post_id)

    if (comments === -1){
        res.status(400).send('Given post id is not valid BSON')
        return
    }

    res.status(200).send(JSON.stringify(comments))
})


module.exports = router