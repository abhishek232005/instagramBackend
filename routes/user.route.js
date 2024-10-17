const express = require('express');
const {register, login, logout, getprofile, editprofile, suggestedusers, followOrUnfollow, Forget_password, otp_verify, reste_password} = require('../contolers/user.contorler')

const authenticated = require('../middlwares/authenticate');
const upload = require('../middlwares/multer');
const userroute = express.Router();

userroute.post('/register',register);
userroute.post('/login', login);
userroute.get('/logout', logout);
userroute.get('/:id/profile', authenticated, getprofile);
userroute.post('/profile/edit', authenticated, upload.single("profilePhoto"), editprofile);
userroute.get('/suggested', authenticated, suggestedusers);
userroute.post('/followOrUnfollow/:id', authenticated, followOrUnfollow);
userroute.post('/forgetpassword',Forget_password);
userroute.post('/otp_verify',otp_verify);
userroute.post('/Reste_password',reste_password);


module.exports = userroute;

