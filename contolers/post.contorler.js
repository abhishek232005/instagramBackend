const post = require('../models/post.model')
const User = require('../models/user.model')
const sharp = require("sharp")
// const upload = require('../middlwares/multer');
const comment = require('../models/comment.model');
const cloudinary = require('../db/cloudinary');
const Post = require('../models/post.model');
const { getReceiverSocketId, io } = require('../socket/socket.io');


const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const userid = req.user;

        if (!image) {
            return res.status(401).send({ message: "Image is required" });
        }

        // Image upload
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: "inside" })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // Buffer to data URI
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri)

        // Post creation
        const postCreate = await post.create({
            caption,
            image: cloudResponse.secure_url,
            author: userid,
        });

        const userFind = await User.findById(userid);
        if (userFind) {
            userFind.posts.push(postCreate._id);
            await userFind.save();
        }

        // Populate the author field without the password
        await postCreate.populate({ path: 'author', select: "-password" });

        return res.status(201).send({
            message: "Post Create SuccessFully",
            post: postCreate,
            success: true,
        });
    } catch (error) {
        console.log(error);

    }
};


//  getAllpost
const getAllpost = async (req, res) => {
    try {
        const post_find = await post.find().sort({ createdAt: -1 }).populate({ path: "author", select: "username profilePhoto" })
            .populate({
                path: "comments",
                sort: { createdAt: -1 },
                populate: ({
                    path: "author",
                    select: "username profilePhoto"
                })

            })
        return res.status(201).send({
            post_find,
            success: true,

        })
    } catch (error) {
        console.log(error);

    }
}

const GetUserPost = async (req, res) => {
    try {
        const authorid = req.user
        const posts_find = await post.find({ author: authorid }).sort({ createdAt: -1 }).populate({
            path: "author",
            select: "username,  profilePhoto"

        }).populate({
            path: "comments",
            sort: { createdAt: -1 },
            populate: ({
                path: "author",
                select: "username,  profilePhoto"
            })

        })
        return res.status(201).send({
            posts_find,
            success: true,

        })

    } catch (error) {
        console.log(error);

    }
}

const likepost = async (req, res) => {
    try {
        const likekrnewalUserkiId = req.user;
        const postId = req.params.id;
        const postfind = await post.findById(postId)
        if (!postfind) {
            return res.status(404).send({ message: "post not fund", success: false })
        }

        // like logic started
        await postfind.updateOne({ $addToSet: { likes: likekrnewalUserkiId } })
        await postfind.save()

        // implement socket io for real time notfication
        const user = await User.findById(likekrnewalUserkiId).select('username profilephoto' )
        const postownerId = postfind.author.toString()
        if(postownerId === likekrnewalUserkiId){
            // emit a notification event
            const notification = {
                type: 'like',
                userId:likekrnewalUserkiId,
                userDatails:user,
                postId,
                message:"your post was liked"
            }
            const postOwnerSocketId = getReceiverSocketId(postownerId)
            io.to(postOwnerSocketId).emit('notification',notification)
        }
        return res.status(201).send({ message: "post liked", success: true })
    } catch (error) {
        console.log(error);

    }
}

const disLikepost = async (req, res) => {
    try {
        const likekrnewalUserkiId = req.user
        const postId = req.params.id
        const postfind = await post.findById(postId)
        if (!postfind) {
            return res.status(404).send({ message: "post not fund", success: true })
        }
        await postfind.updateOne({ $pull: { likes: likekrnewalUserkiId } })
        await postfind.save()

        // impment socket in for real tine notification
        const user = await User.findById(likekrnewalUserkiId).select('username profilephoto' )
        const postownerId = postfind.author.toString()
        if(postownerId === likekrnewalUserkiId){
            // emit a notification event
            const notification = {
                type: 'dislike',
                userId:likekrnewalUserkiId,
                userDatails:user,
                postId,
                message:"your post was liked"
            }
            const postOwnerSocketId = getReceiverSocketId(postownerId)
            io.to(postOwnerSocketId).emit('notification',notification)
        }
    
        return res.status(201).send({ message: "post dislike", success: true })
    } catch (error) {
        console.log(error);

    }
}


const addcomment = async (req, res) => {
    try {
        const postId = req.params.id;  // ID of the post
        const commentAuthorId = req.user;  // User who is adding the comment

        const { text } = req.body;

        // Check if the text is provided
        if (!text) {
            return res.status(400).send({ message: "Text is required", success: false });
        }

        // Find the post by ID
        const postFind = await Post.findById(postId);
        if (!postFind) {
            return res.status(404).send({ message: "Post not found", success: false });
        }

        // Create a comment
        let newComment = await comment.create({
            text,
            author: commentAuthorId,
            post: postId,  // Correct the field name to 'post', not 'postfind'
        });

        // Populate author details after comment creation
       await newComment.populate({
            path: "author",
            select: "username profilephoto",
        })

        // Add the new comment to the post's comments array
        postFind.comments.push(newComment._id);
        await postFind.save();

        return res.status(201).send({ message: "Comment Added", comment: newComment, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal Server Error", success: false });
    }
};


const getCommentsofposat = async (req, res) => {
    try {
        const postId = req.params.id
        const comments = await comment.find({ post: postId }).populate('author', "username, profilephoto")
        if (!comments) {
            return res.status(404).send({ message: "No comments found for this post", success: false })
        }

        return res.status(201).send({ success: true, comments })
    } catch (error) {
        console.log(error);

    }
}

const Deletepost = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.user

        const postfind = await post.findById(postId)
        if (!postfind) return res.status(404).send({ message: "post not found", success: true })

        // check if the login in user is the caner of post
        if (postfind.author.toString() === userId) {
            return res.status(400).send({ message: "Unavthorized" })
        }

        // delete user
        await post.findByIdAndDelete(postId)

        // remove the post id form the user post
        let user = await User.findById(userId)
        user.posts = user.posts.filter(id => id.toString() == postId);

        await user.save();

        // delete assoctated comments
        await comment.deleteMany({ postfind: postId });
        return res.status(201).send({ message: "post delted", success: true })
    } catch (error) {
        console.log(error);

    }
}


const bookmarkpost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorid = req.user;

        // Find the post by ID
        const postfind = await post.findById(postId);
        if (!postfind) {
            return res.status(404).send({ message: "Post not found", success: false });
        }

        // Find the user by ID
        const user = await User.findById(authorid);

        // Check if the post is already bookmarked
        if (user.bookmarks.includes(postfind._id)) {
            // If already bookmarked, remove from bookmarks
            await user.updateOne({ $pull: { bookmarks: postfind._id } });
            return res.status(200).send({ type: "unsaved", message: 'Post removed from bookmarks', success: true });
        } else {
            // If not bookmarked, add to bookmarks
            await user.updateOne({ $addToSet: { bookmarks: postfind._id } });
            return res.status(201).send({ type: "saved", message: 'Post bookmarked successfully', success: true });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Server error", success: false });
    }
};

module.exports = { addNewPost, getAllpost, GetUserPost, likepost, disLikepost, addcomment, getCommentsofposat, bookmarkpost, Deletepost }