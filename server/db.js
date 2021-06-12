/*
    filename: db.js
    description: file containing definition for helper-class
                 which defines the interface to our database.
*/
require('dotenv').config()
const { MongoClient, ObjectId } = require('mongodb')
const DB_CONFIG  = require('./db_config.json')

// load database info from the .env file (gitignored)
const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME     = process.env.DB_NAME
const DB_HOST     = process.env.DB_HOST
const CONNECTION_URI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`


function invalid_post({timestamp, title, body}){
    const PostLimits = DB_CONFIG["charLimits"]["Posts"]

    return title.length > PostLimits["Title"] || body.length > PostLimits["Body"]
}

function invalid_comment({body}){
    return body.length > DB_CONFIG["charLimits"]["Comment"]["Body"]
}


/*
    Post:
    {
        timestamp: (seconds),
        title: string,
        body: string
    }
    Comment:
    {
        body: string
    }
*/


// database --> MongoInterface object with methods for 
let database


// Initializes database
exports.initDatabaseInterface = function (callback){
    console.log("connecting...")
    MongoClient.connect(CONNECTION_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }, (err, client) => {
        if (err) throw err

        // create database interface object 
        database = new MongoInterface(client.db(DB_NAME))
        console.log('Connected to database.')
        callback()
    })
}

// Jacked this pattern from Dr. Hess's cs 493 example code
exports.getDBReference = function () {
    return database 
}

function MongoInterface(db){
        this.database = db
        this.posts = this.database.collection('posts')
        this.comments = this.database.collection('comments')
}

MongoInterface.prototype = {
    createPost: async function (post_obj) {
        // Don't hit the DB if the post is invalid
        if (invalid_post(post_obj)) return false

        const result = this.posts.insertOne(post_obj)
    
        return result
    },
    // comment is of form:
    // { post_id, body }
    createComment: async function(comment) {
        // return -1 for size limit violation
        if (invalid_comment(comment)) return -1

        // return -2 for invalid post_id
        let result = -2

        console.log(comment)

        // Check if ID references an existing thread
        const count = await this.posts.countDocuments({_id: ObjectId(comment.post_id)})

        console.log(count)

        if (count === 1){
            result = this.comments.insertOne(comment)
        }
        
        return result
    },
    deletePost: async function(post_id){

        if (!ObjectId.isValid(post_id)){
            return -1
        }

        const resultComments = await this.deleteComments(post_id)
        const resultPosts = await this.posts.deleteOne({_id: post_id})
        
        return {comments: resultComments.deletedCount, posts: resultPosts.deletedCount}
    },
    // Assumes post_id is valid
    deleteComments: async function(post_id){
        return await this.comments.deleteMany({post_id})
    },
    // We assume page is numeric
    // Returns (paginated) the posts from the last 24 hours
    getPosts: async function(page){

        /* 
            Ok, so since running a sub-process to delete posts every 24 hours
            is going to take a bit too long for me to implement I am just gonna
            return posts from the last 24 hours.

            So, we're not really deleting posts after 24 hours...

            Let's just call it the "snapchat" design pattern.
        */
        const query = {
            // 1000 * 60 * 60 * 24 == 86400000 == 24 hours in ms
            timestamp: { $gt: Date.now() - 86400000}
        }

        const options = {
            sort: {timestamp: -1},
            skip: DB_CONFIG["PageSize"] * page,
            limit: DB_CONFIG["PageSize"]
        }

        // get all results within the page range
        const cursor = await this.posts.find(query, options)

        // load all the posts into memory
        const posts = await cursor.toArray()


        return posts
    },
    getComments: async function(post_id){

        if (!ObjectId.isValid(post_id)){
            return -1
        }

        // I only want comments associated with this post id
        const query = {post_id}

        // I want ascending order (older comments first)
        const options = {sort: {_id: 1}}

        const cursor = await this.comments.find(query, options)

        // NOTE: this is stupid for scaling reasons since we never
        //       limit the number of comments a user may leave;
        //       in a real production environment there would be
        //       a chance the comment count exceeds our system's
        //       memory capacity.
        const comments = await cursor.toArray()

        return comments
    }
}