/* 
    Filename: button_events.js
    Description:
        
        Defines the dynamic event listener logic through "event-hooks"
        which is probably a misuage of that term.  Basically I define 
        functions which returns an array containing a [constructor, destructor]
        which setup and tear down the event listeners respectively.

        The constructor/destructors get called by the updateRoutes function
        which essentially controls the entire application state. 

*/


// API Methods / Cache stuff
import {apiPOST} from './api.js'
import {getCurrentPostID, LoadNewPosts, loadComments} from './datastore.js'


export const ReloadComments = new Event('ReloadComments')

const CommentModal = document.getElementById('comment-modal')
const PostModal    = document.getElementById('post-modal')


const ShowCommentModal = () => {
    CommentModal.className = ''
}
const HideCommentModal = () => {
    CommentModal.className = 'hidden'
}

const ShowPostModal = () => {
    PostModal.className = ''
}
const HidePostModal = () => {
    PostModal.className = 'hidden'
}

// returns [constructor, destructor]
export function commmentButton(){

    const API_ADD_COMMENT = (event) => {
        const BodyText = document.querySelector('[ref="commentBody"]').value
        console.log(BodyText)
        if (BodyText.length === 0){
            alert('Comments cannot be empty!')
            return
        }

        // hide modal
        HideCommentModal()

        const id = getCurrentPostID()
        // API CALL TO ADD COMMENT HERE
        apiPOST('newcomment', {
            post_id: id,
            body: BodyText
        }).then(data => {
            console.log('comment added')
            document.dispatchEvent(ReloadComments)
        }).catch(err => {
            console.log('error occured: ', err)
        })
    }

    return [
        () => {
            console.log('commentButton event hook constructor called')
            // SHOW MODAL BUTTON
            document.querySelector('#add-comment-button').addEventListener('click', ShowCommentModal)
            
            // Listeners to Exit Modals
            document.querySelectorAll('[ref="exitComment"]').forEach((element, index) => {
                element.addEventListener('click', HideCommentModal)
            })
            
            // Actually add comment
            document.querySelector('[ref="addComment"]').addEventListener('click', API_ADD_COMMENT)
        },
        () => {
            console.log('commentButton event hook destructor called')

            // remove listeners
            document.querySelector('#add-comment-button').removeEventListener('click', ShowCommentModal)
            document.querySelectorAll('[ref="exitComment"]').forEach((element, index) => {
                element.removeEventListener('click', HideCommentModal)
            })
            document.querySelector('[ref="addComment"]').removeEventListener('click', API_ADD_COMMENT)
        }
    ]
}


// returns [constructor, destructor]
export function postButton(){



    const API_ADD_POST = (event) => {
        const BodyText = document.querySelector('[ref="postBody"]').value
        const TitleText = document.querySelector('[ref="postTitle"]').value
        console.log(BodyText, TitleText)
        if (BodyText.length === 0 && TitleText.length === 0){ 
            alert("Post must have a title & body!")
            return
        }
        
        HidePostModal()

        // API CALL TO ADD POST HERE
        apiPOST('newpost', {
            title: TitleText,
            body: BodyText
        }).then(data => {
                console.log('post created')
                LoadNewPosts()
        }).catch(err => {
                console.log('error occured: ', err)
        })
    }

    return [
        () => {
            console.log('postButton event hook constructor called')

            // Show modal
            document.querySelector('#add-post-button').addEventListener('click', ShowPostModal)

            // Hide modal
            document.querySelectorAll('[ref="exitPost"]').forEach((element, index) => {
                element.addEventListener('click', HidePostModal)
            })

            // API request
            document.querySelector('[ref="addPost"]').addEventListener('click', API_ADD_POST)

        },
        () => {
            
            console.log('postButton event hook destructor called')

            document.querySelector('#add-post-button').removeEventListener('click', HidePostModal)

            document.querySelectorAll('[ref="exitPost"]').forEach((element, index) => {
                element.removeEventListener('click', HidePostModal)
            })

            document.querySelector('[ref="addPost"]').removeEventListener('click', API_ADD_POST)
        }
    ]


}

/* Back to top Button */
var backToTopButton = document.getElementById("backToTopButton");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

backToTopButton.addEventListener('click', topFunction)


/* Dark Mode Button Functionality */

var darkModeButton = document.getElementById("darkModeButton")

var bodyElement = document.getElementById("bodyID")
var aboutFrame1 = document.getElementById("aboutframeUno")
var aboutFrame2 = document.getElementById("aboutframeDos")
var allPostsCollection = document.getElementsByClassName("post-card")


function darkModeToggle(){

    var bodyClassTest = bodyElement.classList

    if( bodyClassTest.contains("bodyDark") ){
        //Remove dark mode classes and revert to light mode
        bodyElement.classList.remove("bodyDark")
        aboutFrame1.classList.remove("aboutframe1Dark")
        aboutFrame2.classList.remove("aboutframe1Dark")

        //Loop through current set of posts and add to each one
        for(var i=0; i < allPostsCollection.length; i++){
            allPostsCollection[i].id.classList.remove("post-cardDark")
        }
    }

    else{
        //Not in dark mode yet, so add dark mode classes to relevant elements
        bodyElement.classList.add("bodyDark")
        aboutFrame1.classList.add("aboutframe1Dark")
        aboutFrame2.classList.add("aboutframe1Dark")

        //Loop through current set of posts and add to each one
        for(var i=0; i < allPostsCollection.length; i++){
            allPostsCollection[i].id.classList.add("post-cardDark")
        }
    }

}


darkModeButton.addEventListener('click', darkModeToggle)










