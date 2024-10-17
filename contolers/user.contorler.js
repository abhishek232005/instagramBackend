const User = require('../models/user.model');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');
const Post = require('../models/post.model');
const getDataurl = require('../db/datauri');
const cloudinary  = require('../db/cloudinary');
const sendmaile = require('../utils/mailer');


const secret_key = "abhishekgwala2005"; // Consider moving this to an environment variable for better security

// Register function
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).send({ message: "Username, email, or password is required", success: false });
        }

        const find_user = await User.findOne({ email });

        if (find_user) {
            return res.status(401).send({ message: "Email already in use", success: false });
        }

        const hashedPassword = await bcryptjs.hash(password, 12);

        const newUser = await User.create({ username, email, password: hashedPassword });

        return res.status(201).send({ message: "Account created successfully", success: true, user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error", success: false });
    }
};

// Login function
const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).send({ message: "Email or password is required", success: false });
      }
  
      const find_user = await User.findOne({ email });
  
      if (!find_user) {
        return res.status(401).send({ message: "Incorrect email or password", success: false });
      }
  
      const isPasswordMatch = await bcryptjs.compare(password, find_user.password);
  
      if (!isPasswordMatch) {
        return res.status(401).send({ message: "Incorrect email or password", success: false });
      }
  
      const token = jwt.sign({ id: find_user._id }, secret_key, { expiresIn: "7d" });
  
      // Safely populate each post
      const populatePosts = await Promise.all(
        find_user?.posts?.map(async (postId) => {
          const post = await Post.findById(postId);
          if (post && post.author.equals(find_user._id)) {  // Ensure post is not null and author matches
            return post;
          }
          return null;  // Return null if post is invalid
        })
      );
  
      // Filter out any null posts
      const validPosts = populatePosts.filter(post => post !== null);
  
      const userResponse = {
        _id: find_user._id,
        username: find_user.username,
        email: find_user.email,
        profilePhoto: find_user.profilePhoto,
        bio: find_user.bio,
        followers: find_user.followers,
        following: find_user.following,
        posts: validPosts // Only include valid posts
      };
  
      return res.status(201).json({
        message: `Welcome back, ${userResponse.username}`,
        success: true,
        user: userResponse,
        token
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Server error", success: false });
    }
  };
  

// Logout function
const logout = async (req, res) => {
    try {
        return res.cookie('token', "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error", success: false });
    }
};

// Get profile function
const getprofile = async (req, res) => {
    try {
        const userId = req.params.id;

        const find_user = await User.findById(userId)
            .populate({ path: 'posts', options: { sort: { createdAt: -1 } } })  // Populate user's posts
            .populate('bookmarks');  // Populate user's bookmarks

        if (!find_user) {
            return res.status(404).send({ message: "User not found", success: false });
        }

        return res.status(201).send({ user: find_user, success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error", success: false });
    }
};


// Edit profile function
const editprofile= async (req, res) => {
    try {
        const userId = req.user  // Assuming req.user contains the user object with _id
        const { bio, gender } = req.body;
        const profilePhoto = req.file;

        let cloudResponse;

        if (profilePhoto) {
            const fileUri = getDataurl(profilePhoto)
            // console.log(fileUri);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }
      
        
        const findUser = await User.findById(userId);

        if (!findUser) {
            return res.status(404).send({ message: "User not found", success: false });
        }

        if (bio) findUser.bio = bio;
        if (gender) findUser.gender = gender;
        if (profilePhoto ) findUser.profilePhoto = cloudResponse.secure_url;

        await findUser.save();
       console.log(findUser);
       
        return res.status(200).send({ message: "Profile updated", success: true,  findUser });
    } catch (error) {
        console.error(error);
        
    }
};


// Suggested users function
const suggestedusers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.user } }).select('-password');

        if (!suggestedUsers.length) {
            return res.status(400).send({ message: "currentiy do not have any users", success: false });
        }

        return res.status(200).send({ success: true, users: suggestedUsers });
    } catch (error) {
        console.error(error);
        
    }
};

// Follow or Unfollow function
const followOrUnfollow = async (req, res) => {
    try {
        const followkrnewala = req.user;
        const jiskofollowkrunge = req.params.id;

        if (followkrnewala == jiskofollowkrunge) {
            return res.status(400).send({ message: "You cannot follow/unfollow yourself", success: false });
        }

        const find_user = await User.findById(followkrnewala);
        const target_user = await User.findById(jiskofollowkrunge);
        console.log(find_user,target_user);
        
        if (!find_user || !target_user) {
            return res.status(400).send({ message: "User not found", success: false });
        }

        const isFollowing = find_user.following.includes(jiskofollowkrunge);

        if (isFollowing) {
            // Unfollow logic
            await Promise.all([
                User.updateOne({ _id: followkrnewala }, { $pull: { following: jiskofollowkrunge } }),
                User.updateOne({ _id: jiskofollowkrunge }, { $pull: { followers: followkrnewala } })
            ]);

            return res.status(200).send({ message: "Unfollowed successfully", success: true });
        } else {
            // Follow logic
            await Promise.all([
                User.updateOne({ _id: followkrnewala }, { $push: { following: jiskofollowkrunge } }),
                User.updateOne({ _id: jiskofollowkrunge }, { $push: { followers: followkrnewala } })
            ]);

            return res.status(200).send({ message: "Followed successfully", success: true });
        }
    } catch (error) {
        console.error(error);
       
    }
};

const generateRandomNumber =()=>{
    const randomNumber = Math.floor(Math.random()*900000)+ 100000
    return randomNumber
}

const Forget_password = async (req,res)=>{
    try {
        const {email} = req.body
        const find_user = await User.findOne({email:email})
        if(find_user){
            let otp = generateRandomNumber()
            console.log(otp);
            
            sendmaile(email, `otp is ${otp}`, "forget password", "")
            await User.updateOne({email:email}, {$set:{otp:otp, otpexpire: new Date().getTime() + 2 * 60000}})
            res.status(201).send({message:"otp send successFully",success:true})
        }else{
            res.status(401).send({message:"this email already exist",success:false})
        }
        
    } catch (error) {
        console.log(error);
        
    }
}

// otp_verify
const otp_verify = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Check if both email and otp are provided
        if (!email || !otp) {
            return res.status(401).send({ message: "OTP and email are required", success: false });
        }

        // Find the user by email
        const find_user = await User.findOne({ email: email });
        
        // If user is not found
        if (!find_user) {
            return res.status(400).send({ message: "User not found", success: false });
        }

        // Check if OTP has expired
        if (find_user.otpexpire <= new Date().getTime()) {
            return res.status(401).send({ message: "OTP has expired", success: false });
        }

        // Check if OTP is correct
        if (find_user.otp !== otp) {
            return res.status(401).send({ message: "Invalid OTP", success: false });
        }

        // OTP verification successful
        return res.status(201).send({ message: "OTP verification successful", success: true });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "An error occurred", success: false });
    }
};


// reste_password
const reste_password = async (req,res)=>{
    try {
        const {email,password} = req.body
        if(!email || !password){
            req.status(401).send({message:"email or password is required"})
        }
        const find_user = await User.findOne({email:email})
        const hashpassword = await bcryptjs.hash(password,12)

        if(find_user){
            const userupdate = await User.updateOne({email:email}, {$set:{password:hashpassword}})
           
            console.log(userupdate);
            if(userupdate.ismodifiedCount = 1){
                res.status(201).send({message:"profile Update successFully"})
            }
            res.status(401).send({ message: "update not update" })
        }else{
            res.status(200).send({message:"user not found"})
        }
     
    } catch (error) {
        console.log(error);
        
    }
}
module.exports = { register, login, logout, getprofile, editprofile, suggestedusers, followOrUnfollow,Forget_password,otp_verify,reste_password };
