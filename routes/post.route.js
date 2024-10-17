const express = require('express')
const authenticated = require('../middlwares/authenticate')

const {  getAllpost, GetUserPost, likepost, disLikepost, addcomment, getCommentsofposat, Deletepost, bookmarkpost, addNewPost } = require('../contolers/post.contorler')
const upload = require('../middlwares/multer')
const postroute = express.Router()

postroute.post('/addpost',authenticated,upload.single('image'),addNewPost)
postroute.get('/all',authenticated,getAllpost)
postroute.get('/userpost/all',authenticated,GetUserPost)
postroute.get('/:id/like',authenticated,likepost)
postroute.get('/:id/dislike',authenticated,disLikepost)
postroute.post('/:id/comment',authenticated,addcomment)
postroute.post('/:id/comment/all',authenticated,getCommentsofposat)
postroute.delete('/delete/:id',authenticated,Deletepost)
postroute.get('/:id/bookmark',authenticated,bookmarkpost)


module.exports = postroute